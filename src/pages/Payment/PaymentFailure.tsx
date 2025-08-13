import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Tag } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import { getQueryParam, saveOrderCode, loadOrderCode } from "../../utils/payParams";
import "./paymentResulf.css"; // hoặc 'paymentResult.css' nếu cần

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

  useEffect(() => {
    const run = async () => {
      if (!orderCode) {
        message.warning("Thiếu orderCode");
        return;
      }
      const ocNum = Number(orderCode);
      if (!Number.isFinite(ocNum)) {
        message.error("orderCode không hợp lệ");
        return;
      }

      try {
        setSyncing(true);
        const res = await PaymentService.update({ orderCode: ocNum });
        const s = res?.status as OrderStatusCode | undefined;

        if (typeof s === "number") {
          setStatus(s);
          // Nếu BE trả PAID (1) mà đang ở trang fail → chuyển sang success
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
    run();
  }, [orderCode, navigate]);

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
          <div className="row">
            <span>Status</span>
            <strong>
              {status !== undefined ? <Tag color={tagColor(status)}>{getOrderStatusLabel(status)}</Tag> : "—"}
            </strong>
          </div>
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
