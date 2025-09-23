import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Card,
  message,
  Space,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CategoryService } from "../../../services/category.service";
import type { Category, CategoryForm } from "../../../types/category";
import "./category-manage.css";

const CategoryManage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [selected, setSelected] = useState<Category | null>(null);
  const [viewData, setViewData] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getCategories();
      setCategories(data || []);
    } catch {
      message.error("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onCreate = async (vals: CategoryForm) => {
    try {
      await CategoryService.createCategory(vals);
      message.success("Tạo danh mục thành công");
      setCreateVisible(false);
      createForm.resetFields();
      fetchAll();
    } catch {
      message.error("Tạo danh mục thất bại");
    }
  };

  const onUpdate = async (vals: CategoryForm) => {
    if (!selected) return;
    try {
      await CategoryService.updateCategory(selected.id, vals);
      message.success("Cập nhật thành công");
      setUpdateVisible(false);
      updateForm.resetFields();
      setSelected(null);
      fetchAll();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await CategoryService.deleteCategory(deleteId);
      message.success("Xoá thành công");
      setDeleteVisible(false);
      setDeleteId(null);
      fetchAll();
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const handleView = (rec: Category) => {
    setViewData(rec);
    setViewVisible(true);
  };

  const handleEdit = (rec: Category) => {
    setSelected(rec);
    updateForm.setFieldsValue({
      categoryName: rec.categoryName,
      isActive: rec.isActive,
    });
    setUpdateVisible(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteVisible(true);
  };

  const columns: ColumnsType<Category> = [
    { title: "ID", dataIndex: "id", key: "id", ellipsis: true },
    { title: "Tên danh mục", dataIndex: "categoryName", key: "categoryName" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (v: boolean) =>
        v ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, rec) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(rec)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(rec)} />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(rec.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>Quản lý Danh mục</h2>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
            Thêm Danh mục
          </Button>
        </Col>
      </Row>

      <Card>
        <Table<Category>
          rowKey="id"
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* CREATE */}
      <Modal
        title="Tạo danh mục"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={onCreate}>
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          
          <Row justify="end" gutter={8}>
            <Col><Button onClick={() => setCreateVisible(false)}>Huỷ</Button></Col>
            <Col><Button type="primary" htmlType="submit">Lưu</Button></Col>
          </Row>
        </Form>
      </Modal>

      {/* UPDATE */}
      <Modal
        title="Cập nhật danh mục"
        open={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={updateForm} layout="vertical" onFinish={onUpdate}>
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          
          <Row justify="end" gutter={8}>
            <Col><Button onClick={() => setUpdateVisible(false)}>Huỷ</Button></Col>
            <Col><Button type="primary" htmlType="submit">Cập nhật</Button></Col>
          </Row>
        </Form>
      </Modal>

      {/* DELETE confirm */}
      <Modal
        title="Xác nhận xoá"
        open={deleteVisible}
        onCancel={() => setDeleteVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <p>Bạn có chắc chắn muốn xoá danh mục này?</p>
        <Row justify="end" gutter={8}>
          <Col><Button onClick={() => setDeleteVisible(false)}>Huỷ</Button></Col>
          <Col><Button danger type="primary" onClick={onDelete}>Xoá</Button></Col>
        </Row>
      </Modal>

      {/* VIEW */}
      <Modal
        title="Chi tiết danh mục"
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {viewData ? (
          <div>
            <p><b>ID:</b> {viewData.id}</p>
            <p><b>Tên:</b> {viewData.categoryName}</p>
            <p><b>Trạng thái:</b> {viewData.isActive ? "Hoạt động" : "Ngừng"}</p>
            <p><b>Ngày tạo:</b> {viewData.createdAt ? new Date(viewData.createdAt).toLocaleString() : "—"}</p>
            <p><b>Ngày cập nhật:</b> {viewData.updatedAt ? new Date(viewData.updatedAt).toLocaleString() : "—"}</p>
          </div>
        ) : "Đang tải..."}
      </Modal>
    </>
  );
};

export default CategoryManage;
