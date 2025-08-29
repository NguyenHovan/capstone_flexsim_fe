import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Tag, Tooltip } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import { getQueryParam, saveOrderCode, loadOrderCode } from "../../utils/payParams";
import "./paymentResulf.css";

const ORDER_MANAGER_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5173/organizationAdmin/order-manager"
    : "https://capstone-flexsim-fe.vercel.app/organizationAdmin/order-manager";

const tagColor = (s?: OrderStatusCode) => (s === 2 ? "volcano" : s === 1 ? "green" : "gold");

const PaymentFail: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [status, setStatus] = useState<OrderStatusCode | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  const orderCodeFromUrl = useMemo(() => sp.get("orderCode") || getQueryParam("orderCode"), [sp]);
  const orderCode = useMemo(() => orderCodeFromUrl || loadOrderCode(), [orderCodeFromUrl]);

  useEffect(() => {
    if (orderCodeFromUrl) saveOrderCode(orderCodeFromUrl);
  }, [orderCodeFromUrl]);

  const refreshStatus = async () => {
    if (!orderCode) return message.warning("Thiếu orderCode");
    const ocNum = Number(orderCode);
    if (!Number.isFinite(ocNum)) return message.error("orderCode không hợp lệ");
    try {
      setSyncing(true);
      const res = await PaymentService.update({ orderCode: ocNum });
      const s = res?.status as OrderStatusCode | undefined;
      if (typeof s === "number") {
        setStatus(s);
        if (s === 1) {
          navigate(`/payment/success?orderCode=${orderCode}`, { replace: true });
          return;
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể cập nhật trạng thái";
      message.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const copyCode = async () => {
    if (!orderCode) return;
    try {
      await navigator.clipboard.writeText(String(orderCode));
      message.success("Đã sao chép Payment ID");
    } catch {
      message.warning("Không thể sao chép, vui lòng copy thủ công");
    }
  };

  const goToOrder = () => {
    const sameOrigin = window.location.origin === new URL(ORDER_MANAGER_URL).origin;
    if (sameOrigin) {
      navigate("/organizationAdmin/order-manager", { replace: true });
    } else {
      window.location.assign(ORDER_MANAGER_URL);
    }
  };

  return (
    <div className="payres-page">
      <div className={`payres-card fail ${syncing ? "is-loading" : ""}`}>
        <div className="payres-head">
          <div className="payres-logo" aria-hidden>LS</div>
          <div className="payres-headtext">
            <h4>LogiSimEdu</h4>
            <span>Payment result</span>
          </div>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={refreshStatus}
            loading={syncing}
            className="payres-refresh"
          >
            Refresh
          </Button>
        </div>

        <div className="payres-badge">
          <svg viewBox="0 0 24 24" className="icon" aria-hidden>
            <circle cx="12" cy="12" r="11" />
            <path d="M8 8l8 8M16 8l-8 8" fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="payres-title">Payment Failed</h2>
        <p className="payres-sub" aria-live="polite">
          {syncing ? "Đang kiểm tra trạng thái…" : "Thanh toán chưa thành công hoặc đã bị hủy."}
        </p>

        <div className="payres-divider" />

        <div className="payres-rows">
          <div className="row">
            <span>Payment ID</span>
            <div className="row-end">
              <strong className="mono">{orderCode || "-"}</strong>
              <Tooltip title="Copy">
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={copyCode} />
              </Tooltip>
            </div>
          </div>
          <div className="row">
            <span>Status</span>
            <strong>
              {status !== undefined ? (
                <Tag color={tagColor(status)}>{getOrderStatusLabel(status)}</Tag>
              ) : "—"}
            </strong>
          </div>
        </div>

        <div className="payres-actions">
          <Button onClick={() => navigate(-1)}>Thử lại</Button>
          <Button onClick={goToOrder}>Xem đơn hàng</Button>
          <Button type="primary" onClick={() => navigate("/", { replace: true })}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;