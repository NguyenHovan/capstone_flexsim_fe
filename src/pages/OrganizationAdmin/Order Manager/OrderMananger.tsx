import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Table, Button, Modal, Form, Select, Tag, Space,
  Typography, message, Empty, Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { Order, OrderStatusCode } from "../../../types/order";
import { getOrderStatusLabel } from "../../../types/order";
import { OrderService } from "../../../services/order.service";
import { PaymentService } from "../../../services/payment.service";
import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";
import { saveOrderCode } from "../../../utils/payParams";

const { Title, Text } = Typography;

type CurrentUser = { id: string; organizationId: string; userName?: string };

const statusColor = (s?: OrderStatusCode) =>
  s === 1 ? "green" : s === 2 ? "red" : "gold";

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
      setOrders(data || []);
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

  // Chỉ hiển thị order của account hiện tại
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.accountId === currentUser.id);
  }, [orders, currentUser]);

  // Map nhanh: planId -> planName
  const planNameById = useMemo<Record<string, string>>(
    () => plans.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string,string>),
    [plans]
  );

const onPay = async (orderId: string) => {
  try {
    if (!orderId) { message.error("Thiếu orderId"); return; }

    // 1) Create payment để lấy link thanh toán + orderCode
    const res = await PaymentService.createByOrderId(orderId);
    if (res?.orderCode) saveOrderCode(res.orderCode); // lưu dự phòng

    const url = res?.checkoutUrl ?? res?.payUrl; // payUrl là fallback nếu BE dùng tên khác
    if (!url) {
      message.warning("Không nhận được checkoutUrl từ máy chủ.");
      return;
    }

    // 2) Redirect sang PayOS để user thanh toán/hủy
    window.location.href = url;
  } catch (e: any) {
    message.error(e?.message || "Tạo liên kết thanh toán thất bại");
  }
};

  const handleCreate = async () => {
    try {
      const { subscriptionPlanId } = await form.validateFields();
      if (!currentUser) throw new Error("Chưa đăng nhập");

      const payload = {
        organizationId: currentUser.organizationId,
        accountId: currentUser.id,
        subscriptionPlanId,
      };

      await OrderService.create(payload);
      message.success("Create order successful");
      setOpenCreate(false);
      form.resetFields();
      await loadOrders(); // auto load lại danh sách
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "Create order failure");
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 240,
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}><Text code copyable>{v}</Text></Tooltip>
      ),
    },
    {
      title: "Subscription Plan",
      dataIndex: "subcriptionPlanId",
      key: "subcriptionPlanId",
      ellipsis: true,
      render: (planId: string | undefined) =>
        planId ? (planNameById[planId] || <Text type="secondary">Không tìm thấy gói</Text>)
               : <Text type="secondary">—</Text>,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      width: 120,
      render: (_: any, row) => <span>{currency((row as any).totalPrice ?? row.price)}</span>,
      sorter: (a, b) => ((a as any).totalPrice ?? a.price ?? 0) - ((b as any).totalPrice ?? b.price ?? 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => <Tag color={statusColor(s)}>{getOrderStatusLabel(s)}</Tag>,
      filters: [
        { text: "PENDING", value: 0 },
        { text: "PAID", value: 1 },
        { text: "CANCELLED", value: 2 },
      ],
      onFilter: (value, record) => record.status === (value as number),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
      sorter: (a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, row) => (
        <Space>
          {row.status === 0 && <Button type="primary" onClick={() => onPay(row.id)}>Pay</Button>}
        </Space>
      ),
    },
  ];

  if (!currentUser) {
    return (
      <Card>
        <Title level={4} style={{ margin: 0 }}>Order Manager</Title>
        <div style={{ marginTop: 16 }}>
          <Empty description="Bạn cần đăng nhập để xem đơn hàng của mình" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Order Manager</Title>
        <Button type="primary" onClick={() => setOpenCreate(true)}>Create Order</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={myOrders}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <Empty description="Chưa có đơn hàng nào cho tài khoản này" /> }}
      />

      <Modal
        title="Create Order"
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onOk={handleCreate}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Subscription Plan"
            name="subscriptionPlanId"
            rules={[{ required: true, message: "Chọn gói dịch vụ" }]}
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
