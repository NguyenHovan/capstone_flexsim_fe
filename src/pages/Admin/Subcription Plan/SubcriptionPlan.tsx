import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Typography, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";

const { Title, Text } = Typography;

const SubscriptionPlanAdmin: React.FC = () => {
  const [data, setData] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await SubscriptionPlanService.getAll();
      setData(res || []);
    } catch (e: any) {
      message.error(e?.message || "Unable to download list subscription plan");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const columns: ColumnsType<SubscriptionPlan> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Duration (months)", dataIndex: "durationInMonths", key: "durationInMonths" },
    { title: "Max Workspaces", dataIndex: "maxWorkSpaces", key: "maxWorkSpaces" },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => <Text type={v ? "success" : "secondary"}>{v ? "Active" : "Inactive"}</Text>
    },
    {
      title: "Action",
      key: "action",
      render: (_, row) => (
        <Space>
          <Button onClick={() => onEdit(row)}>Edit</Button>
          <Popconfirm title="Remove this subscription plan?" onConfirm={() => onDelete(row.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, durationInMonths: 1, maxWorkSpaces: 1, price: 0 });
    setOpen(true);
  };

  const onEdit = (row: SubscriptionPlan) => {
    setEditing(row);
    form.setFieldsValue(row);
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    try {
      await SubscriptionPlanService.delete(id);
      message.success("Deleted");
      load();
    } catch (e: any) {
      message.error(e?.message || "Delete failure");
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await SubscriptionPlanService.update(editing.id, values);
        message.success("Update successful");
      } else {
        await SubscriptionPlanService.create(values);
        message.success("Subscription plan creation successful");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "Save failure");
    }
  };

  return (
    <Card>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Subscription Plans (Admin)</Title>
        <Button type="primary" onClick={openCreate}>Create Subscription Plan</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Edit Plan" : "Create Plan"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText={editing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Import subscription plan name" }]}>
            <Input placeholder="Example: 12 month package" />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: "Enter price" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="durationInMonths" label="Duration in months" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxWorkSpaces" label="Max workspaces" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Description (optional)" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SubscriptionPlanAdmin;
