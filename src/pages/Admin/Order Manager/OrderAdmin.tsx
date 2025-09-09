import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Input,
  Select,
  Tooltip,
  Badge,
  Modal,
  Button,
} from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";

import type { Order, OrderStatusCode } from "../../../types/order";
import { getOrderStatusLabel } from "../../../types/order";
import { OrderService } from "../../../services/order.service";
import "./orderAdmin.css";

const { Title, Text } = Typography;
const { Search } = Input;

const STATUS_OPTIONS: { label: string; value: OrderStatusCode; color: string }[] = [
  { value: 0, label: "PENDING",   color: "gold"   },
  { value: 1, label: "PAID",      color: "green"  },
  { value: 2, label: "CANCELLED", color: "red"    },
];

const statusColor = (s?: OrderStatusCode) =>
  s === 1 ? "green" : s === 2 ? "red" : "gold";

const currency = (n?: number) =>
  typeof n === "number" ? new Intl.NumberFormat("vi-VN").format(n) : "";

const OrderAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusCode | undefined>(undefined);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<Order | null>(null);
  const [updateNewStatus, setUpdateNewStatus] = useState<OrderStatusCode>(0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      message.error(e?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filteredData = useMemo(() => {
    let data = orders;
    if (statusFilter !== undefined) data = data.filter((o) => o.status === statusFilter);

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter((o) => {
        const fields = [
          o.id,
          o.organizationId,
          o.accountId,
          (o as any).subscriptionPlanId ?? (o as any).subcriptionPlanId,
          o.orderCode?.toString() ?? "",
        ];
        return fields.some((f) => (f || "").toLowerCase().includes(q));
      });
    }
    return data;
  }, [orders, statusFilter, searchText]);

  const doUpdateStatus = async (row: Order, newStatus: OrderStatusCode) => {
    setUpdatingId(row.id);
    try {
      const hide = message.loading("Cập nhật trang thái...", 0) as any;
      await OrderService.updateStatus(row.id, newStatus); 
      if (typeof hide === "function") hide();
      message.success("Cập nhật trạng thái thành công");
      await loadOrders();
    } catch (e: any) {
      message.error(e?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const openUpdateModal = (row: Order) => {
    setUpdateTarget(row);
    setUpdateNewStatus((row.status ?? 0) as OrderStatusCode);
    setUpdateModalOpen(true);
  };

  const submitUpdate = async () => {
    if (!updateTarget) return;
    const curr = (updateTarget.status ?? 0) as OrderStatusCode;
    const next = updateNewStatus;

    if (next === curr) {
      message.info("Trạng thái không thay đổi");
      setUpdateModalOpen(false);
      setUpdateTarget(null);
      return;
    }

    await doUpdateStatus(updateTarget, next);
    setUpdateModalOpen(false);
    setUpdateTarget(null);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setUpdateTarget(null);
  };

  const doDelete = async (row: Order) => {
    setDeletingId(row.id);
    try {
      await OrderService.delete(row.id);
      message.success("Xóa đơn hàng thành công");
      setOrders(prev => prev.filter(o => o.id !== row.id));
      await loadOrders();
    } catch (e: any) {
      message.error(e?.message || "Xóa đơn hàng thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (row: Order) => {
    if (row.status !== 2) {
      Modal.warning({
        title: "Only CANCELLED orders can be deleted",
        content: (
          <span>
            Order <Text code>{row.id}</Text> has status{" "}
            <Tag color={statusColor(row.status)} style={{ margin: 0 }}>
              {getOrderStatusLabel(row.status)}
            </Tag>
            . Please set it to <Tag color="red" style={{ margin: 0 }}>CANCELLED</Tag> first.
          </span>
        ),
      });
      return;
    }

    Modal.confirm({
      title: "Xóa đơn hàng này?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          You are deleting order <Text code>{row.id}</Text>. This action cannot be undone.
        </span>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => doDelete(row),
    });
  };

  const onChange: TableProps<Order>["onChange"] = () => {};

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 260,
      render: (v: string) => (
        <Tooltip title={v}>
          <span className="oa-id-chip" title={v}>{v}</span>
        </Tooltip>
      ),
    },
    {
      title: "Gói đăng ký",
      dataIndex: "subscriptionPlanName",
      key: "subscriptionPlanName",
      ellipsis: true,
      render: (_: any, row) => {
        const name =
          (row as any).subcriptionPlanName ??
          (row as any).subscriptionPlanId ??
          (row as any).subcriptionPlanId;
        return name ? <span className="oa-plan">{name}</span> : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Tổng tiền ",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      align: "right",
      sorter: (a, b) =>
        ((a as any).totalPrice ?? a.totalPrice ?? 0) - ((b as any).totalPrice ?? b.totalPrice ?? 0),
      render: (_: any, row) => (
        <span className="oa-price">{currency((row as any).totalPrice ?? row.totalPrice)}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === (value as number),
      render: (s: OrderStatusCode | undefined) => (
        <span className={`oa-status oa-status--${getOrderStatusLabel(s).toLowerCase()}`}>
          <Badge status={s === 1 ? "success" : s === 2 ? "error" : "warning"} style={{ marginRight: 6 }} />
          {getOrderStatusLabel(s)} {}
        </span>
      ),
    },
    {
      title: "Tổ chức",
      dataIndex: "organizationId",
      key: "organizationId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}><span className="oa-dim">{v}</span></Tooltip>
      ),
    },
    {
      title: "Tài khoản tạo đơn hàng",
      dataIndex: "accountId",
      key: "accountId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}><span className="oa-dim">{v}</span></Tooltip>
      ),
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 280,
      render: (_, row) => (
        <Space size="small" className="oa-actions">
          <Button
            type="primary"
            onClick={() => openUpdateModal(row)}
            loading={updatingId === row.id}
          >
            Cặp nhật đơn hàng
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === row.id}
            onClick={() => handleDeleteClick(row)}
            data-can-delete={row.status === 2}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="oa-card">
      <div className="oa-header">
        <Title level={4} className="oa-title">Quản lý các đơn hàng</Title>
        <Space className="oa-controls" wrap>
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            className="oa-filter"
            options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Search
            allowClear
            placeholder="Tìm kiếm bằng ID /Tổ chức / Tài khoản / Gói đăng ký"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="oa-search"
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        size="middle"
        bordered
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        onChange={onChange}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1280, y: 560 }}
        className="oa-table"
      />

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={updateModalOpen}
        onCancel={closeUpdateModal}
        onOk={submitUpdate}
        okText="Cập nhật"
        okButtonProps={{
          loading: updatingId === updateTarget?.id,
         
        }}
        destroyOnHidden
      >
        {updateTarget && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              Đơn hàng: <Text code>{updateTarget.id}</Text>
            </div>
            <div>
              Trạng thái hiện tại:&nbsp;
              <Tag color={statusColor(updateTarget.status)} style={{ margin: 0 }}>
                {getOrderStatusLabel(updateTarget.status)}
              </Tag>
            </div>
            <div>
              Trạng thái cập nhật:
              <div style={{ marginTop: 8 }}>
                <Select<OrderStatusCode>
                  value={updateNewStatus}
                  options={STATUS_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
                  onChange={(v) => setUpdateNewStatus(v)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default OrderAdmin;
