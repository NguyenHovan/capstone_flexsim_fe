import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Table, Button, Modal, Form, Select, Tag, Space,
  Typography, message, Empty, Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { Order, OrderStatusCode } from "../../../types/order";
import { OrderService } from "../../../services/order.service";
import { PaymentService } from "../../../services/payment.service";
import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";
import {
  saveOrderCode, saveOrderId, saveAccountId, savePreferredOrigin
} from "../../../utils/payParams";

const { Title, Text } = Typography;

type CurrentUser = { id: string; organizationId: string; userName?: string };

const statusColor = (s?: OrderStatusCode) =>
  s === 1 ? "green" : s === 2 ? "red" : "gold";

const statusLabelVI = (s?: OrderStatusCode) =>
  s === 1 ? "ĐÃ THANH TOÁN" : s === 2 ? "ĐÃ HỦY" : "CHỜ THANH TOÁN";

const currency = (n?: number) =>
  typeof n === "number" ? new Intl.NumberFormat("vi-VN").format(n) : "";

const OrderOrganization: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form] = Form.useForm();

  const currentUser: CurrentUser | null = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return null; }
  }, []);

  const loadOrders = async () => {
    if (!currentUser) { setOrders([]); return; }
    setLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders((data || []).filter(o => o.accountId === currentUser.id));
    } catch (e: any) {
      message.error(e?.message || "Không tải được đơn hàng");
    } finally { setLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const data = await SubscriptionPlanService.getAll();
      setPlans((data || []).filter((p) => p.isActive));
    } catch {
      message.error("Không tải được gói dịch vụ");
    }
  };

  useEffect(() => {
    loadOrders();
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const onPay = async (orderId: string, accountId: string | undefined) => {
    try {
      if (!orderId) { message.error("Thiếu orderId"); return; }
      savePreferredOrigin();
      saveOrderId(orderId);
      if (accountId) saveAccountId(accountId);

      const res = await PaymentService.createByOrderId(orderId);
      if (res?.orderCode) saveOrderCode(res.orderCode);
      const url = res?.checkoutUrl ?? res?.payUrl;
      if (!url) return message.warning("Không nhận được checkoutUrl từ máy chủ.");
      window.location.href = url; // chuyển sang PayOS
    } catch (e: any) {
      message.error(e?.message || "Tạo liên kết thanh toán thất bại");
    }
  };

  const handleCreateAndPay = async () => {
    try {
      const { subscriptionPlanId } = await form.validateFields();
      if (!currentUser) throw new Error("Chưa đăng nhập");

      // TẠO ORDER: dùng accountId + organizationId của currentUser + gói đã chọn
      const order = await OrderService.create({
        organizationId: currentUser.organizationId,
        accountId: currentUser.id,
        subscriptionPlanId,
      });

      message.success("Tạo đơn thành công. Đang chuyển đến cổng thanh toán…");
      setOpenCreate(false);
      form.resetFields();

      await onPay(order.id, currentUser.id);
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "Tạo đơn/Thanh toán thất bại");
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 240,
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}><Text code copyable>{v}</Text></Tooltip>
      ),
    },
    {
      title: "Bắt đầu → Kết thúc",
      key: "dates",
      width: 210,
      render: (_, row) => {
        const s = row.startDate ? dayjs(row.startDate).format("DD/MM/YYYY") : "—";
        const e = row.endDate ? dayjs(row.endDate).format("DD/MM/YYYY") : "—";
        return <span>{s} → {e}</span>;
      }
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      width: 120,
      render: (_: any, row) => <span>{currency((row as any).totalPrice ?? row.totalPrice)}</span>,
      sorter: (a, b) => ((a as any).totalPrice ?? a.totalPrice ?? 0) - ((b as any).totalPrice ?? b.totalPrice ?? 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (s) => <Tag color={statusColor(s)}>{statusLabelVI(s)}</Tag>,
      filters: [
        { text: "Chờ thanh toán", value: 0 },
        { text: "Đã thanh toán", value: 1 },
        { text: "Đã hủy", value: 2 },
      ],
      onFilter: (value, record) => record.status === (value as number),
    },
    {
      title: "Tạo lúc",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
      sorter: (a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 160,
      render: (_, row) => (
        <Space>
          {row.status === 0 && <Button type="primary" onClick={() => onPay(row.id, currentUser?.id)}>Thanh toán</Button>}
        </Space>
      ),
    },
  ];

  if (!currentUser) {
    return (
      <Card>
        <Title level={4} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
        <div style={{ marginTop: 16 }}>
          <Empty description="Bạn cần đăng nhập để xem đơn hàng của mình" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý đơn hàng</Title>
        <Button type="primary" onClick={() => setOpenCreate(true)}>Tạo & Thanh toán</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={orders}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Chưa có đơn hàng nào cho tài khoản này" /> }}
      />

      <Modal
        title="Chọn gói để mua"
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onOk={handleCreateAndPay}
        okText="Thanh toán"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Gói dịch vụ"
            name="subscriptionPlanId"
            rules={[{ required: true, message: "Vui lòng chọn gói dịch vụ" }]}
          >
            <Select
              placeholder="Chọn gói"
              options={plans.map((p) => ({
                label: `${p.name} • ${p.durationInMonths} tháng • ${currency(p.price)}`,
                value: p.id,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default OrderOrganization;
