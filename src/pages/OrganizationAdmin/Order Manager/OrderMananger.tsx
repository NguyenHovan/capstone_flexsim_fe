import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Table, Button, Modal, Form, Select, Tag, Space,
  Typography, message, Empty, Tooltip, Grid
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
const { useBreakpoint } = Grid;

type CurrentUser = { id: string; organizationId: string; userName?: string };

const statusColor = (s?: OrderStatusCode) =>
  s === 1 ? "green" : s === 2 ? "red" : "gold";

const statusLabelVI = (s?: OrderStatusCode) =>
  s === 1 ? "ĐÃ THANH TOÁN" : s === 2 ? "ĐÃ HỦY" : "CHỜ THANH TOÁN";

const currency = (n?: number) =>
  typeof n === "number" ? new Intl.NumberFormat("vi-VN").format(n) : "";

const OrderOrganization: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  /** Bấm nút Thanh toán trên từng đơn */
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

  /** OK trong modal: chỉ TẠO ĐƠN, không thanh toán */
  const handleCreateOrderOnly = async () => {
    try {
      const { subscriptionPlanId } = await form.validateFields();
      if (!currentUser) throw new Error("Chưa đăng nhập");

      await OrderService.create({
        organizationId: currentUser.organizationId,
        accountId: currentUser.id,
        subscriptionPlanId,
      });

      message.success("Tạo đơn thành công! Bạn có thể thanh toán từ bảng đơn hàng.");
      setOpenCreate(false);
      form.resetFields();
      await loadOrders(); // hiển thị đơn PENDING vừa tạo
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "Tạo đơn thất bại");
    }
  };

  /** Cột cho desktop/tablet */
  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 260,
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}><Text code copyable>{v}</Text></Tooltip>
      ),
    },
    {
      title: "Bắt đầu → Kết thúc",
      key: "dates",
      width: 220,
      responsive: ["sm"], // ẩn trên xs
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
      width: 140,
      render: (_: any, row) => <span>{currency((row as any).totalPrice ?? row.totalPrice)}</span>,
      sorter: (a, b) => ((a as any).totalPrice ?? a.totalPrice ?? 0) - ((b as any).totalPrice ?? b.totalPrice ?? 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
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
      width: 190,
      responsive: ["md"], // ẩn dưới md
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
      sorter: (a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, row) => (
        <Space wrap>
          {row.status === 0 && (
            <Button type="primary" size={isMobile ? "middle" : "small"} onClick={() => onPay(row.id, currentUser?.id)}>
              Thanh toán
            </Button>
          )}
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

  /** Nội dung danh sách responsive */
  const listContent = isMobile ? (
    <Space direction="vertical" style={{ width: "100%" }} size="small">
      {orders.length === 0 ? (
        <Empty description="Chưa có đơn hàng nào cho tài khoản này" />
      ) : (
        orders.map((o) => {
          const s = o.startDate ? dayjs(o.startDate).format("DD/MM/YYYY") : "—";
          const e = o.endDate ? dayjs(o.endDate).format("DD/MM/YYYY") : "—";
          return (
            <Card key={o.id} size="small" bodyStyle={{ padding: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={6}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <Text strong>Mã:</Text>
                  <Text code style={{ maxWidth: 190 }} ellipsis={{ tooltip: o.id }}>
                    {o.id}
                  </Text>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <Text strong>Trạng thái:</Text>
                  <Tag color={statusColor(o.status)} style={{ margin: 0 }}>{statusLabelVI(o.status)}</Tag>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <Text strong>Thời gian:</Text>
                  <Text>{s} → {e}</Text>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <Text strong>Tổng tiền:</Text>
                  <Text>{currency((o as any).totalPrice ?? o.totalPrice)}</Text>
                </div>

                {o.createdAt && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <Text strong>Tạo lúc:</Text>
                    <Text>{dayjs(o.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                  </div>
                )}

                {o.status === 0 && (
                  <Button type="primary" block onClick={() => onPay(o.id, currentUser?.id)}>
                    Thanh toán
                  </Button>
                )}
              </Space>
            </Card>
          );
        })
      )}
    </Space>
  ) : (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={orders}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      locale={{ emptyText: <Empty description="Chưa có đơn hàng nào cho tài khoản này" /> }}
      scroll={{ x: 900 }}
      size="middle"
    />
  );

  return (
    <Card>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}
        wrap
      >
        <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
          Quản lý đơn hàng
        </Title>
        {/* Nhãn tuỳ ý; hành vi: mở modal tạo đơn */}
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo đơn hàng
        </Button>
      </Space>

      {listContent}

      <Modal
        title="Chọn gói để tạo đơn"
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onOk={handleCreateOrderOnly}
        okText="Tạo đơn hàng"
        destroyOnHidden
        width={isMobile ? 360 : 520}
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
