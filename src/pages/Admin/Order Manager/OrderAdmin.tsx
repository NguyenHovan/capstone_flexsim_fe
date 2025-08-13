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
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";

import type { Order, OrderStatusCode } from "../../../types/order";
import { getOrderStatusLabel } from "../../../types/order";
import { OrderService } from "../../../services/order.service";
import "./orderAdmin.css";

const { Title, Text } = Typography;
const { Search } = Input;

const STATUS_OPTIONS: { label: string; value: OrderStatusCode; color: string }[] = [
  { value: 0, label: "PENDING", color: "gold" },
  { value: 1, label: "PAID", color: "green" },
  { value: 2, label: "CANCELLED", color: "red" },
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

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(data || []);
    } catch (e: any) {
      message.error(e?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredData = useMemo(() => {
    let data = orders;
    if (statusFilter !== undefined) {
      data = data.filter((o) => o.status === statusFilter);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter((o) => {
        const fields = [
          o.id,
          o.organizationId,
          o.accountId,
          o.subscriptionPlanId,
          o.subscriptionPlanName,
          o.orderCode?.toString() ?? "",
        ];
        return fields.some((f) => (f || "").toLowerCase().includes(q));
      });
    }
    return data;
  }, [orders, statusFilter, searchText]);

  const doUpdateStatus = async (row: Order, newStatus: OrderStatusCode) => {
    if (row.status === newStatus) return;
    setUpdatingId(row.id);
    try {
      const hide = message.loading("Updating status…", 0);
      const updated = await OrderService.updateStatus(row.id, newStatus);
      hide();
      message.success("Update status successful");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === row.id
            ? {
                ...o,
                status: updated.status ?? newStatus,
                updatedAt: updated.updatedAt ?? new Date().toISOString(),
              }
            : o
        )
      );
    } catch (e: any) {
      message.error(e?.message || "Update status failure");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmUpdate = (row: Order, val: OrderStatusCode) => {
    Modal.confirm({
      title: "Confirm status change",
      content: (
        <span>
          Change status of order <Text code>{row.id}</Text> to{" "}
          <Tag color={statusColor(val)} style={{ margin: 0 }}>
            {getOrderStatusLabel(val)}
          </Tag>
          ?
        </span>
      ),
      okText: "Update",
      cancelText: "Cancel",
      onOk: () => doUpdateStatus(row, val),
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
          <span className="oa-id-chip" title={v}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    
    {
      title: "Plan",
      dataIndex: "subcriptionPlanName",
      key: "subcriptionPlanName",
      ellipsis: true,
      render: (v: string | undefined) =>
        v ? <span className="oa-plan">{v}</span> : <Text type="secondary">—</Text>,
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      align: "right",
      sorter: (a, b) =>
        ((a as any).totalPrice ?? a.price ?? 0) - ((b as any).totalPrice ?? b.price ?? 0),
      render: (_: any, row) => (
        <span className="oa-price">{currency((row as any).totalPrice ?? row.price)}</span>
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
          <Badge
            status={s === 1 ? "success" : s === 2 ? "error" : "warning"}
            style={{ marginRight: 6 }}
          />
          {getOrderStatusLabel(s)}
        </span>
      ),
    },
    {
      title: "Organization",
      dataIndex: "organizationId",
      key: "organizationId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}>
          <span className="oa-dim">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: "Account",
      dataIndex: "accountId",
      key: "accountId",
      width: 240,
      render: (v: string) => (
        <Tooltip title={v}>
          <span className="oa-dim">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) =>
        dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf(),
      render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      sorter: (a, b) =>
        dayjs(a.updatedAt || 0).valueOf() - dayjs(b.updatedAt || 0).valueOf(),
      render: (v?: string | null) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      title: "Action",
      key: "action",
      width: 240,
      render: (_, row) => {
        const current = row.status ?? 0;
        return (
          <Space size="small" className="oa-actions">
            <Select<OrderStatusCode>
              value={current}
              className="oa-status-select"
              options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
              onChange={(val) => {
                if (val === current) return;
                confirmUpdate(row, val);
              }}
              disabled={updatingId === row.id}
              loading={updatingId === row.id}
            />
          </Space>
        );
      },
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
    </Card>
  );
};

export default OrderAdmin;
