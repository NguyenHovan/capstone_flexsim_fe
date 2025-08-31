import React, { useEffect, useMemo, useState } from "react";
import { Button, message, Tag, Tooltip, Typography } from "antd";
import { CopyOutlined} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService } from "../../services/payment.service";
import { OrderService } from "../../services/order.service";
import { getOrderStatusLabel, type OrderStatusCode } from "../../types/order";
import {
  getQueryParam,
  saveOrderCode,
  loadOrderCode,
  saveOrderId,
  loadOrderId,
  saveAccountId,
} from "../../utils/payParams";
import "./paymentResulf.css";

const { Text } = Typography;

const ORDER_MANAGER_URL = (() => {
  const { protocol, hostname, port } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocal
    ? `${protocol}//${hostname}${port ? `:${port}` : ""}/organizationAdmin/order-manager`
    : "https://capstone-flexsim-fe.vercel.app/organizationAdmin/order-manager";
})();

const tagColor = (s?: OrderStatusCode) => (s === 1 ? "green" : s === 2 ? "volcano" : "gold");

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    const me = raw ? JSON.parse(raw) : null;
    return me?.id || "";
  } catch {
    return "";
  }
};

const extractFromUpdate = (res: any) => {
  const p = Array.isArray(res) ? res[0] : res;
  return {
    status: (p?.status ?? p?.data?.status) as OrderStatusCode | undefined,
    orderId:
      (p?.id ??
        p?.orderId ??
        p?.order?.id ??
        p?.data?.id ??
        p?.data?.orderId) as string | undefined,
    accountId: (p?.accountId ?? p?.order?.accountId ?? p?.data?.accountId) as string | undefined,
  };
};

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [status, setStatus] = useState<OrderStatusCode | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);

  const orderCodeFromUrl = useMemo(() => sp.get("orderCode") || getQueryParam("orderCode"), [sp]);
  const orderCode = useMemo(() => orderCodeFromUrl || loadOrderCode(), [orderCodeFromUrl]);

  useEffect(() => {
    if (orderCodeFromUrl) saveOrderCode(orderCodeFromUrl);
  }, [orderCodeFromUrl]);

  const findOrderByCode = async (ocNum: number) => {
    try {
      const all = await OrderService.getAll();
      return all.find((o: any) => Number(o?.orderCode) === ocNum || String(o?.orderCode) === String(ocNum));
    } catch {
      return undefined;
    }
  };

  const refreshStatus = async () => {
    if (!orderCode) return message.warning("Thiếu Payment ID (orderCode)");
    const ocNum = Number(orderCode);
    if (!Number.isFinite(ocNum)) return message.error("orderCode không hợp lệ");

    try {
      setSyncing(true);
      const res = await PaymentService.update({ orderCode: ocNum });

      const { status: s0, orderId: oid0, accountId: aid0 } = extractFromUpdate(res);
      setStatus(s0);

      let oid: string | undefined = oid0 ?? (loadOrderId() ?? undefined);
      let aid: string | undefined = aid0 ?? undefined;

      if (!oid) {
        const found = await findOrderByCode(ocNum);
        if (found) {
          oid = (found as any).id as string | undefined;
          aid = aid || ((found as any).accountId as string | undefined);
        }
      }

      setOrderId(oid);
      if (oid) saveOrderId(oid);

      if (!aid && oid) {
        try {
          const o = await OrderService.getById(oid);
          aid = (o as any)?.accountId as string | undefined;
        } catch {
          // ignore
        }
      }
      if (!aid) aid = getCurrentUserId();

      setAccountId(aid);
      if (aid) saveAccountId(aid);

      if (s0 === 2) {
        navigate(`/payment/fail?orderCode=${orderCode}`, { replace: true });
        return;
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể xác nhận thanh toán";
      message.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      message.success("Đã sao chép");
    } catch {
      message.warning("Không thể sao chép");
    }
  };

  const goToOrder = () => {
    const sameOrigin = window.location.origin === new URL(ORDER_MANAGER_URL).origin;
    if (sameOrigin) navigate("/organizationAdmin/order-manager", { replace: true });
    else window.location.assign(ORDER_MANAGER_URL);
  };

  return (
    <div className="payres-page">
      <div className={`payres-card success ${syncing ? "is-loading" : ""}`}>
        <div className="payres-head">
          <div className="payres-logo" aria-hidden>LS</div>
          <div className="payres-headtext"><h4>LogiSimEdu</h4><span>Payment result</span></div>
        </div>

        <div className="payres-badge">
          <svg viewBox="0 0 24 24" className="icon" aria-hidden>
            <circle cx="12" cy="12" r="11" />
            <path d="M7 12l3 3 7-7" fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="payres-title">Payment Successful</h2>
        <p className="payres-sub" aria-live="polite">
          {syncing ? "Đang xác nhận giao dịch…" : "Giao dịch được xác nhận thành công."}
        </p>

        <div className="payres-divider" />
        <div className="payres-rows">
          <div className="row">
            <span>Order ID</span>
            <div className="row-end">
              <Text className="mono">{orderId || "-"}</Text>
              <Tooltip title="Copy"><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copy(orderId)} /></Tooltip>
            </div>
          </div>
          <div className="row">
            <span>Account ID</span>
            <div className="row-end">
              <Text className="mono">{accountId || "-"}</Text>
              <Tooltip title="Copy"><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copy(accountId)} /></Tooltip>
            </div>
          </div>
          <div className="row">
            <span>Status</span>
            <strong>{status !== undefined ? <Tag color={tagColor(status)}>{getOrderStatusLabel(status)}</Tag> : "—"}</strong>
          </div>
        </div>

        <div className="payres-actions">
          <Button onClick={goToOrder}>Trở về trang đơn hàng</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
