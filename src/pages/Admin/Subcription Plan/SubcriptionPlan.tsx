import React, { useEffect, useState } from "react";
import { 
  Card, Table, Button, Modal, Form, Input, InputNumber, 
  Switch, Space, Typography, message 
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SubscriptionPlan } from "../../../types/subscriptionPlan";
import { SubscriptionPlanService } from "../../../services/subscriptionPlan.service";

const { Title, Text } = Typography;

const SubscriptionPlanAdmin: React.FC = () => {
  const [data, setData] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false); // modal xóa
  const [deleteId, setDeleteId] = useState<string | null>(null); // id đang chọn xoá
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await SubscriptionPlanService.getAll();
      setData(res || []);
    } catch (e: any) {
      message.error(e?.message || "Không thể tải danh sách gói đăng ký.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const columns: ColumnsType<SubscriptionPlan> = [
    { title: "ID", dataIndex: "id", width: 260, key: "id" },
    { title: "Tên gói đăng ký", dataIndex: "name", width: 260, key: "name" },
    { title: "Giá gói đăng ký", dataIndex: "price", width: 170, key: "price" },
    { title: "Thời hạn (tháng)", dataIndex: "durationInMonths", width: 170, key: "durationInMonths" },
    { title: "Số không gian làm việc tối đa", dataIndex: "maxWorkSpaces", width: 220, key: "maxWorkSpaces" },
    {
      title: "Trạng thái",
      dataIndex: "isActive", 
      width: 160,
      key: "isActive",
      render: (v: boolean) => <Text type={v ? "success" : "secondary"}>{v ? "Đang hoạt động" : "Không hoạt động"}</Text>
    },
    {
      title: "Thao tác",
      key: "action", 
      width: 260,
      render: (_, row) => (
        <Space>
          <Button onClick={() => onEdit(row)}>Sửa</Button>
          <Button danger onClick={() => {
            setDeleteId(row.id);
            setDeleteVisible(true);
          }}>
            Xóa
          </Button>
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

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await SubscriptionPlanService.delete(deleteId);
      message.success("Đã xóa thành công");
      setDeleteVisible(false);
      setDeleteId(null);
      load();
    } catch (e: any) {
      message.error(e?.message || "Xóa thất bại");
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await SubscriptionPlanService.update(editing.id, values);
        message.success("Chỉnh sửa thành công");
      } else {
        await SubscriptionPlanService.create(values);
        message.success("Thêm gói đăng ký thành công");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || "Lưu thất bại");
    }
  };

  return (
    <Card>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lí các gói đăng ký (Admin)</Title>
        <Button type="primary" onClick={openCreate}>Thêm gói đăng ký</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content", y: 520 }}  
        sticky  
      />

      {/* Modal Create/Update */}
      <Modal
        title={editing ? "Chỉnh sửa" : "Thêm gói đăng ký"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText={editing ? "Chỉnh sửa" : "Thêm gói đăng ký"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên gói đăng ký" rules={[{ required: true, message: "Thêm tên gói đăng ký" }]}>
            <Input placeholder="Ví dụ: Gói đăng ký 1 tháng" />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Nhập giá gói đăng ký" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="durationInMonths" label="Thời hạn gói (tháng)" rules={[{ required: true }]} >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxWorkSpaces" label="Số lượng không gian làm việc tối đa " rules={[{ required: true }]} >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Delete */}
      <Modal
        title="Xóa gói đăng ký"
        open={deleteVisible}
        onCancel={() => {
          setDeleteVisible(false);
          setDeleteId(null);
        }}
        footer={null}
        width={400}
      >
        <p>Bạn có chắc chắn muốn xóa gói đăng ký này? Hành động này không thể hoàn tác.</p>
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => {
            setDeleteVisible(false);
            setDeleteId(null);
          }}>
            Hủy
          </Button>
          <Button type="primary" danger loading={loading} onClick={onDelete}>
            Xóa
          </Button>
        </Space>
      </Modal>
    </Card>
  );
};

export default SubscriptionPlanAdmin;
