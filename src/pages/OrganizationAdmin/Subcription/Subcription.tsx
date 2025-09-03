import React, { useEffect, useMemo, useState } from "react";
import {
  Tabs,
  Row,
  Col,
  Card,
  Typography,
  Empty,
  Skeleton,
  message,
  Tag,
  Space,
  Button,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";

import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import type { Order } from "../../../types/order";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";
import { OrderService } from "../../../services/order.service";
import { AccountService } from "../../../services/account.service";

import "./subcription.css";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const fmtCurrency = (n: number, currency = "VND") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    minimumFractionDigits: 0,
    currency,
  }).format(n);
const months = (m: number) => `${m} month${m > 1 ? "s" : ""}`;
const fmtDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");

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
function extractSections(plan: SubscriptionPlan): {
  sections: PlanView["_sections"];
  all: string[];
} {
  const raw = (plan.description || "").trim();
  if (raw) {
    try {
      const j = JSON.parse(raw);
      if (j && (Array.isArray(j.primary) || Array.isArray(j.extra))) {
        const primary = (j.primary || [])
          .map((x: any) => String(x))
          .filter(Boolean);
        const extra = (j.extra || [])
          .map((x: any) => String(x))
          .filter(Boolean);
        return { sections: { primary, extra }, all: [...primary, ...extra] };
      }
    } catch {}
  }
  const all = splitTextBenefits(plan.description);
  return { sections: null, all };
}
const getCurrentUserLite = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id
      ? ({ id: u.id, organizationId: u.organizationId } as {
          id: string;
          organizationId?: string;
        })
      : null;
  } catch {
    return null;
  }
};

type PlanGridProps = {
  plans: SubscriptionPlan[];
  loading?: boolean;
  extraHeader?: (p: SubscriptionPlan) => React.ReactNode;
  extraFooter?: (p: SubscriptionPlan) => React.ReactNode;
  onCreate?: (p: SubscriptionPlan) => void;
  creatingPlanId?: string | null;
};

const PlanGrid: React.FC<PlanGridProps> = ({
  plans,
  loading,
  extraHeader,
  extraFooter,
  onCreate,
  creatingPlanId,
}) => {
  const navigate = useNavigate();
  const items: PlanView[] = useMemo(
    () =>
      plans.map((p, i) => {
        const { sections, all } = extractSections(p);
        return {
          ...p,
          _variant: pickVariant(p.name, i),
          _pricePerMonth:
            p.durationInMonths > 0 ? p.price / p.durationInMonths : p.price,
          _sections: sections,
          _allBenefits: all,
        };
      }),
    [plans]
  );

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Col key={i} xs={24} sm={12} lg={8}>
            <Card className="pp-card">
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }
  if (!items.length)
    return (
      <Empty
        description="Không có gói nào."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );

  return (
    <Row gutter={[16, 16]}>
      {items.map((p) => (
        <Col key={p.id} xs={24} sm={12} lg={8}>
          <Card className={`pp-card variant-${p._variant}`} hoverable>
            <div className="pp-head">
              <div className="pp-name">{p.name}</div>
              <Space
                direction="vertical"
                size={0}
                style={{ alignItems: "flex-end" }}
              >
                {extraHeader?.(p)}
                <Tag color={p.isActive ? "green" : "red"} className="pp-state">
                  {p.isActive ? "Active" : "Inactive"}
                </Tag>
              </Space>
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
                {(() => {
                  const base = p._allBenefits.length ? [...p._allBenefits] : [];
                  const ensure = (
                    label: string,
                    test: RegExp,
                    value: string
                  ) => {
                    if (!base.some((b) => test.test(b)))
                      base.push(`${label} ${value}`);
                  };
                  ensure(
                    "Max workspaces:",
                    /max\s*workspaces?/i,
                    String(p.maxWorkSpaces)
                  );
                  ensure(
                    "Duration:",
                    /^duration:/i,
                    `${months(p.durationInMonths)}`
                  );
                  return (
                    <ul className="pp-benefits">
                      {base.map((b, idx) => (
                        <li key={idx}>
                          <CheckCircleFilled className="pp-check" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            )}

            {extraFooter?.(p)}

            {onCreate && p.isActive && (
              <div className="pp-footer">
                <Button
                  className="pp-subscribe"
                  onClick={() => {
                    onCreate(p);
                    navigate(`/organizationAdmin/order-manager`);
                  }}
                  loading={creatingPlanId === p.id}
                >
                  Create Order
                </Button>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const OrgAdminSubscriptions: React.FC = () => {
  const [msg, contextHolder] = message.useMessage();

  const [me, setMe] = useState<{ id: string; organizationId?: string } | null>(
    null
  );
  const [activePlans, setActivePlans] = useState<SubscriptionPlan[]>([]);
  const [myPlans, setMyPlans] = useState<SubscriptionPlan[]>([]);
  const [ordersByPlan, setOrdersByPlan] = useState<Record<string, Order[]>>({});
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [creatingPlanId, setCreatingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCurrentUserLite();
    if (cached) setMe(cached);
    (async () => {
      try {
        const res = await AccountService.getMe();
        if (res?.id) setMe({ id: res.id, organizationId: res.organizationId });
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingActive(true);
      try {
        const data = await SubscriptionPlanService.getAllActive().catch(
          async () => {
            const all = await SubscriptionPlanService.getAll();
            return all.filter((p) => p.isActive);
          }
        );
        setActivePlans(Array.isArray(data) ? data : []);
      } catch {
        msg.error("Tải danh sách gói (Active) thất bại.");
      } finally {
        setLoadingActive(false);
      }
    })();
  }, [msg]);

  const loadMine = async (accountId: string) => {
    setLoadingMine(true);
    try {
      const [orders, plans] = await Promise.all([
        OrderService.getAll(),
        SubscriptionPlanService.getAll(),
      ]);

      const mine = orders.filter(
        (o) => o.accountId === accountId && o.status === 1
      );

      const grouped = new Map<string, Order[]>();
      for (const o of mine) {
        const pid =
          (o as any).subscriptionPlanId ?? (o as any).subcriptionPlanId;
        if (!pid) continue;
        const arr = grouped.get(pid) || [];
        arr.push(o);
        grouped.set(pid, arr);
      }
      grouped.forEach((arr) => {
        arr.sort(
          (a, b) =>
            new Date(b.createdAt ?? (b as any).orderTime ?? 0).getTime() -
            new Date(a.createdAt ?? (a as any).orderTime ?? 0).getTime()
        );
      });

      const planMap = new Map(plans.map((p) => [p.id, p]));
      const activePlanList: SubscriptionPlan[] = [];
      const ordersByPlanObj: Record<string, Order[]> = {};

      grouped.forEach((ordList, pid) => {
        const plan = planMap.get(pid);
        if (plan && plan.isActive) {
          activePlanList.push(plan);
          ordersByPlanObj[pid] = ordList;
        }
      });

      const uniq = Array.from(
        new Map(activePlanList.map((p) => [p.id, p])).values()
      );
      setMyPlans(uniq);
      setOrdersByPlan(ordersByPlanObj);
    } catch {
      msg.error("Tải gói đã mua thất bại.");
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    if (me?.id) loadMine(me.id);
  }, [me?.id]);

  const createOrderFor = async (plan: SubscriptionPlan) => {
    if (!me?.id || !me.organizationId) {
      return msg.warning("Không tìm thấy thông tin tài khoản/đơn vị.");
    }
    const key = `create-order-${plan.id}`;
    try {
      setCreatingPlanId(plan.id);
      msg.loading({ content: "Đang tạo order…", key, duration: 0 });

      const created = await OrderService.create({
        organizationId: me.organizationId,
        accountId: me.id,
        subscriptionPlanId: plan.id,
      });

      if (!created || !(created as any).id) {
        throw new Error("Tạo order không thành công.");
      }

      msg.success({ content: "Tạo order thành công!!!", key, duration: 2.5 });

      await loadMine(me.id);
      return created;
    } catch (e: any) {
      msg.destroy(key);
      msg.error(
        e?.response?.data?.message || e?.message || "Tạo order thất bại"
      );
    } finally {
      setCreatingPlanId(null);
    }
  };

  return (
    <div className="pricing-pro">
      {contextHolder}

      <div className="pricing-pro__heading">
        <Title level={3} className="pricing-pro__title">
          Subscription Plans
        </Title>
      </div>

      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: "active",
            label: "All Active Plans",
            children: (
              <PlanGrid
                plans={activePlans}
                loading={loadingActive}
                onCreate={createOrderFor}
                creatingPlanId={creatingPlanId}
              />
            ),
          },
          {
            key: "mine",
            label: "My Subscription Plans",
            children: (
              <>
                <PlanGrid
                  plans={myPlans}
                  loading={loadingMine || !me}
                  extraHeader={(p) => {
                    const list = ordersByPlan[p.id] || [];
                    if (!list.length) return null;
                    const latest = list[0];
                    return (
                      <Space
                        direction="vertical"
                        size={0}
                        style={{ alignItems: "flex-end" }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {fmtDate((latest as any).startDate)} →{" "}
                          {fmtDate((latest as any).endDate)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {list.length} orders
                        </Text>
                      </Space>
                    );
                  }}
                  extraFooter={(p) => {
                    const list = ordersByPlan[p.id] || [];
                    if (!list.length) return null;
                    return (
                      <div className="pp-section" style={{ marginTop: 10 }}>
                        <div className="pp-section-title">Your Orders</div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {list.map((o) => (
                            <div
                              key={o.id}
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <Text code copyable={{ text: o.id }}>
                                {o.id}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {fmtDate((o as any).startDate)} →{" "}
                                {fmtDate((o as any).endDate)}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                {!loadingMine && myPlans.length === 0 && (
                  <Empty
                    description="Bạn chưa mua gói nào."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default OrgAdminSubscriptions;
