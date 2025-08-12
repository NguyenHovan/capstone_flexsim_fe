import React, { useEffect, useState } from "react";
import { Button, message, Tag } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import { getQueryParam, saveOrderCode, loadOrderCode } from "../../utils/payParams";
import "./paymentResulf.css";

const PaymentSuccess: React.FC = () => {
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
      <div className="payres-card success">
        <div className="payres-badge">
          <svg viewBox="0 0 24 24" className="icon">
            <circle cx="12" cy="12" r="11" />
            <path d="M7 12l3 3 7-7" fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="payres-title">Payment Successful!</h2>
        <p className="payres-sub">{syncing ? "Đang xác nhận giao dịch…" : "Giao dịch đã được xác nhận."}</p>

        <div className="payres-rows">
          <div className="row"><span>Payment ID</span><strong>{orderCode || "-"}</strong></div>
          <div className="row"><span>Status</span><strong>
            {status !== undefined ? <Tag color="green">{getOrderStatusLabel(status)}</Tag> : "—"}
          </strong></div>
        </div>

        <div className="payres-actions">
          <Button type="primary" onClick={() => navigate("/organizationAdmin/order-manager", { replace: true })}>
            Quay lại đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
