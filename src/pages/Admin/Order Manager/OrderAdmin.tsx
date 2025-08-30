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
      message.error(e?.message || "Unable to load orders");
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
      const hide = message.loading("Updating status…", 0) as any;
      await OrderService.updateStatus(row.id, newStatus); 
      if (typeof hide === "function") hide();
      message.success("Update status successful");
      await loadOrders();
    } catch (e: any) {
      message.error(e?.message || "Update status failure");
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
      message.info("Status unchanged");
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
      message.success("Deleted order successfully");
      setOrders(prev => prev.filter(o => o.id !== row.id));
      await loadOrders();
    } catch (e: any) {
      message.error(e?.message || "Delete order failed");
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
      title: "Delete this order?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          You are deleting order <Text code>{row.id}</Text>. This action cannot be undone.
        </span>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => doDelete(row),
    });
  };

  const onChange: TableProps<Order>["onChange"] = () => {};

  const columns: ColumnsType<Order> = [
    {
      title: "Order ID",
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
      title: "Plan",
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
      title: "Total Price",
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
      title: "Status",
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
      title: "Organization",
      dataIndex: "organizationId",
      key: "organizationId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}><span className="oa-dim">{v}</span></Tooltip>
      ),
    },
    {
      title: "Account",
      dataIndex: "accountId",
      key: "accountId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}><span className="oa-dim">{v}</span></Tooltip>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      title: "Action",
      key: "action",
      width: 280,
      render: (_, row) => (
        <Space size="small" className="oa-actions">
          <Button
            type="primary"
            onClick={() => openUpdateModal(row)}
            loading={updatingId === row.id}
          >
            Update
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === row.id}
            onClick={() => handleDeleteClick(row)}
            data-can-delete={row.status === 2}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="oa-card">
      <div className="oa-header">
        <Title level={4} className="oa-title">Order Manager</Title>
        <Space className="oa-controls" wrap>
          <Select
            allowClear
            placeholder="Filter status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            className="oa-filter"
            options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Search
            allowClear
            placeholder="Search by ID / Code / Org / Account / Plan"
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
        title="Update Order Status"
        open={updateModalOpen}
        onCancel={closeUpdateModal}
        onOk={submitUpdate}
        okText="Update"
        okButtonProps={{
          loading: updatingId === updateTarget?.id,
         
        }}
        destroyOnHidden
      >
        {updateTarget && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              Order: <Text code>{updateTarget.id}</Text>
            </div>
            <div>
              Current:&nbsp;
              <Tag color={statusColor(updateTarget.status)} style={{ margin: 0 }}>
                {getOrderStatusLabel(updateTarget.status)}
              </Tag>
            </div>
            <div>
              New status:
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
