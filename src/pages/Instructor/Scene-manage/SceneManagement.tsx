import { Table, Input, Button, Space, Tooltip, Modal, Form, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SceneService } from "../../../services/scene.service";

const SceneManagement = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      setLoading(true);
      const res = await SceneService.getAllScenes();
      setDataSource(res || []);
    } catch (e) {
      toast.error("Lỗi tải danh sách bối cảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setSelectedSceneId(record.id ?? record._id);
    form.setFieldsValue({
      sceneName: record.sceneName,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteVisible(true);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await SceneService.deleteScene(deleteId);
      toast.success("Xoá bối cảnh thành công!");
      setDeleteVisible(false);
      setDeleteId(null);
      fetchScenes();
    } catch (err: any) {
      console.error("Delete scene failed:", err?.response?.data || err?.message || err);
      toast.error("Xoá bối cảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("sceneName", values.sceneName);
      formData.append("description", values.description);

      if (isEditing && selectedSceneId) {
        await SceneService.updateScene(selectedSceneId, formData);
        toast.success("Cập nhật bối cảnh thành công!");
      } else {
        await SceneService.createScene(formData);
        toast.success("Tạo bối cảnh thành công!");
      }
      setIsModalVisible(false);
      fetchScenes();
    } catch (e) {
      toast.error("Đã có lỗi khi lưu bối cảnh!");
    }
  };

  const columns = [
    { title: "Tên bối cảnh", dataIndex: "sceneName", width: 300 },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 600,
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span
            style={{
              display: "inline-block",
              maxWidth: 560,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      width: 140,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <EditOutlined onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: "red" }}
              onClick={() => handleDelete(record.id ?? record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* Header */}
      <div
        className="header-section"
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Input.Search placeholder="Tìm kiếm bối cảnh" style={{ width: 280 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm bối cảnh
        </Button>
      </div>

      {/* Bảng có cuộn ngang */}
      <Table
        columns={columns as any}
        dataSource={dataSource}
        pagination={{ pageSize: 8 }}
        rowKey={(r: any) => r?.id ?? r?._id}
        loading={loading}
        bordered
        scroll={{ x: "max-content" }} // chỉ cuộn ngang
      />

      {/* CREATE / UPDATE Modal */}
      <Modal
        open={isModalVisible}
        title={isEditing ? "Sửa bối cảnh" : "Thêm bối cảnh"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên bối cảnh"
            name="sceneName"
            rules={[{ required: true, message: "Vui lòng nhập tên bối cảnh" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* DELETE Modal */}
      <Modal
        title="Xoá bối cảnh"
        open={deleteVisible}
        onCancel={() => {
          setDeleteVisible(false);
          setDeleteId(null);
        }}
        footer={null}
        destroyOnClose
        width={400}
      >
        <p>Bạn có chắc chắn muốn xoá bối cảnh này? Hành động này không thể hoàn tác.</p>
        <Row justify="end" gutter={8}>
          <Col>
            <Button
              onClick={() => {
                setDeleteVisible(false);
                setDeleteId(null);
              }}
            >
              Huỷ
            </Button>
          </Col>
          <Col>
            <Button type="primary" danger loading={loading} onClick={onDelete}>
              Xoá
            </Button>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default SceneManagement;
