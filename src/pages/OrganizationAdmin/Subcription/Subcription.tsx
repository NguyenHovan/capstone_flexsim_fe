import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Typography, Button, Empty, Skeleton, message, Tag } from "antd";
import { CheckCircleFilled, ReloadOutlined } from "@ant-design/icons";
import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";
import "./subcription.css";

const { Title} = Typography;

const fmtCurrency = (n: number, currency = "VND") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2,   
    currency,
  }).format(n);

const months = (m: number) => `${m} month${m > 1 ? "s" : ""}`;

type PlanView = SubscriptionPlan & {
  _variant: "basic" | "standard" | "business" | "premium";
  _pricePerMonth: number;
  _sections: { primary: string[]; extra: string[] } | null;
  _allBenefits: string[];
};

function pickVariant(name: string, idx: number): PlanView["_variant"] {
  const n = (name || "").toLowerCase();
  if (n.includes("premium")) return "premium";
  if (n.includes("business") || n.includes("pro")) return "business";
  if (n.includes("standard")) return "standard";
  if (n.includes("basic") || n.includes("starter")) return "basic";
  return (["basic", "standard", "business", "premium"] as const)[idx % 4];
}

function splitTextBenefits(desc?: string): string[] {
  const d = (desc || "").trim();
  if (!d) return [];
  return d
    .split(/\r?\n|[•;]|(?<=\S)\.(?:\s+|$)/g) 
    .map((s) => s.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function extractSections(plan: SubscriptionPlan): { sections: PlanView["_sections"]; all: string[] } {
  const raw = (plan.description || "").trim();
  if (raw) {
    try {
      const j = JSON.parse(raw);
      if (j && (Array.isArray(j.primary) || Array.isArray(j.extra))) {
        const primary = (j.primary || []).map((x: any) => String(x)).filter(Boolean);
        const extra = (j.extra || []).map((x: any) => String(x)).filter(Boolean);
        return { sections: { primary, extra }, all: [...primary, ...extra] };
      }
    } catch {
    }
  }
  const all = splitTextBenefits(plan.description);
  return { sections: null, all };
}

const OrgAdminSubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await SubscriptionPlanService.getAll();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const items: PlanView[] = useMemo(
    () =>
      plans.map((p, i) => {
        const { sections, all } = extractSections(p);
        return {
          ...p,
          _variant: pickVariant(p.name, i),
          _pricePerMonth: p.durationInMonths > 0 ? p.price / p.durationInMonths : p.price,
          _sections: sections,
          _allBenefits: all,
        };
      }),
    [plans]
  );

  return (
    <div className="pricing-pro">
      <div className="pricing-pro__heading">
        <Title level={3} className="pricing-pro__title">Subscription Plans</Title>
      </div>

      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card className="pp-card"><Skeleton active paragraph={{ rows: 8 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : items.length === 0 ? (
        <Empty
          description="No subscription plans found."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button icon={<ReloadOutlined />} onClick={fetchPlans}>Reload</Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((p) => (
            <Col key={p.id} xs={24} sm={12} lg={8}>
              <Card className={`pp-card variant-${p._variant}`}  hoverable>
                <div className="pp-head">
                  <div className="pp-name">{p.name}</div>
                  <Tag color={p.isActive ? "green" : "red"} className="pp-state">
                    {p.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>

                <div className="pp-price">
                  <div className="pp-price-main">{fmtCurrency(p.price)}</div>
                  <div className="pp-price-sub">monthly</div>
                </div>

                

                {p._sections ? (
                  <>
                    {p._sections.primary.length > 0 && (
                      <div className="pp-section">
                        <div className="pp-section-title">Highlights</div>
                        <ul className="pp-benefits">
                          {p._sections.primary.map((b, idx) => (
                            <li key={`p-${idx}`}>
                              <CheckCircleFilled className="pp-check" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p._sections.extra.length > 0 && (
                      <div className="pp-section">
                        <div className="pp-section-title">All features</div>
                        <ul className="pp-benefits">
                          {p._sections.extra.map((b, idx) => (
                            <li key={`e-${idx}`}>
                              <CheckCircleFilled className="pp-check" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pp-section">
                    <div className="pp-section-title">All benefits</div>
                    <ul className="pp-benefits">
                      {(p._allBenefits.length ? p._allBenefits : [
                        `Duration: ${months(p.durationInMonths)}`,
                        `Max workspaces: ${p.maxWorkSpaces}`,
                        `Est. price/month: ${fmtCurrency(p._pricePerMonth)}`
                      ]).map((b, idx) => (
                        <li key={idx}>
                          <CheckCircleFilled className="pp-check" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default OrgAdminSubscriptionPlans;
