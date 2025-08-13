import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Tag } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import { getQueryParam, saveOrderCode, loadOrderCode } from "../../utils/payParams";
import "./paymentResulf.css"; // nếu file này là 'paymentResult.css' thì sửa lại import cho đúng

const tagColor = (s?: OrderStatusCode) => (s === 1 ? "green" : s === 2 ? "volcano" : "gold");

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [status, setStatus] = useState<OrderStatusCode | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  // lấy orderCode từ URL (ưu tiên) hoặc từ local storage util
  const orderCodeFromUrl = useMemo(() => sp.get("orderCode") || getQueryParam("orderCode"), [sp]);
  const orderCode = useMemo(() => orderCodeFromUrl || loadOrderCode(), [orderCodeFromUrl]);

  // chỉ lưu orderCode vào storage 1 lần khi có từ URL
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
          // Nếu BE trả CANCELLED (2) mà đang ở trang success → chuyển sang fail
          if (s === 2) {
            navigate(`/payment/fail?orderCode=${orderCode}`, { replace: true });
            return;
          }
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Không thể xác nhận thanh toán";
        message.error(msg);
      } finally {
        setSyncing(false);
      }
    };
    run();
  }, [orderCode, navigate]);

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
          <div className="row">
            <span>Status</span>
            <strong>
              {status !== undefined ? <Tag color={tagColor(status)}>{getOrderStatusLabel(status)}</Tag> : "—"}
            </strong>
          </div>
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
