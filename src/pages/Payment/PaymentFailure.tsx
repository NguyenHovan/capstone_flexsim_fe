import React, { useEffect, useState } from "react";
import { Button, message, Tag } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import { getQueryParam, saveOrderCode, loadOrderCode } from "../../utils/payParams";
import "./paymentResulf.css";

const PaymentFail: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [status, setStatus] = useState<OrderStatusCode | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  const ocFromUrl = sp.get("orderCode") || getQueryParam("orderCode");
  if (ocFromUrl) saveOrderCode(ocFromUrl);
  const orderCode = ocFromUrl || loadOrderCode();

  useEffect(() => {
    const run = async () => {
      if (!orderCode) { message.warning("Thiếu orderCode"); return; }
      try {
        setSyncing(true);
        const res = await PaymentService.update({ orderCode: Number(orderCode) });
        const s = (res as any)?.status;
        if (typeof s === "number") setStatus(s as OrderStatusCode);
      } catch (e: any) {
        message.error(e?.message || "Không thể cập nhật trạng thái");
      } finally {
        setSyncing(false);
      }
    };
    run();
  }, [orderCode]);

  return (
    <div className="payres-page">
      <div className="payres-card fail">
        <div className="payres-badge">
          <svg viewBox="0 0 24 24" className="icon">
            <circle cx="12" cy="12" r="11" />
            <path d="M8 8l8 8M16 8l-8 8" fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="payres-title">Payment Failed!</h2>
        <p className="payres-sub">
          {syncing ? "Đang kiểm tra trạng thái…" : "Đơn hàng chưa được thanh toán thành công."}
        </p>

        <div className="payres-rows">
          <div className="row"><span>Payment ID</span><strong>{orderCode || "-"}</strong></div>
          <div className="row"><span>Status</span><strong>
            {status !== undefined ? <Tag color={status === 2 ? "volcano" : "gold"}>{getOrderStatusLabel(status)}</Tag> : "—"}
          </strong></div>
        </div>

        <div className="payres-actions gap">
          <Button onClick={() => navigate(-1)}>Thử lại</Button>
          <Button type="primary" onClick={() => navigate("/organizationAdmin/order-manager", { replace: true })}>
            Quay lại đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
