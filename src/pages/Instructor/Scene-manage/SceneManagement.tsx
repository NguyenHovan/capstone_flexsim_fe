import { Table, Input, Button, Space, Tooltip, Modal, Form, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SceneService } from "../../../services/scene.service";
import type { Scene, SceneInput } from "../../../types/scene";

const SceneManagement: React.FC = () => {
  const [dataSource, setDataSource] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [form] = Form.useForm();

  // Lấy current user id từ localStorage
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.id || null;
    } catch { return null; }
  }, []);

  const isOwner = (rec: Scene) =>
    !!currentUserId && rec.instructorId === currentUserId;

  const fetchScenes = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const list = await SceneService.getScenesByInstructor(currentUserId);
      setDataSource(list || []);
    } catch {
      toast.error("Lỗi tải danh sách bối cảnh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScenes(); /* eslint-disable-next-line */ }, [currentUserId]);

  const handleAdd = () => {
    if (!currentUserId) {
      toast.error("Bạn cần đăng nhập để tạo bối cảnh.");
      return;
    }
    form.resetFields();
    setIsEditing(false);
    setSelectedSceneId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Scene) => {
    if (!isOwner(record)) {
      toast.error("Chỉ người tạo mới được sửa bối cảnh này.");
      return;
    }
    setIsEditing(true);
    setSelectedSceneId(record.id);
    form.setFieldsValue({
      sceneName: record.sceneName,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const rec = dataSource.find(x => x.id === id);
    if (!rec) return;
    if (!isOwner(rec)) {
      toast.error("Chỉ người tạo mới được xoá bối cảnh này.");
      return;
    }
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
      setDataSource(prev => prev.filter(s => s.id !== deleteId)); // optimistic
    } catch (err: any) {
      console.error("Delete scene failed:", err?.response?.data || err?.message || err);
      toast.error("Xoá bối cảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentUserId) {
        toast.error("Không xác định được người dùng hiện tại.");
        return;
      }
      const values = await form.validateFields();
      const payload: SceneInput = {
        instructorId: currentUserId,           // BẮT BUỘC
        sceneName: values.sceneName,
        description: values.description,
      };

      if (isEditing && selectedSceneId) {
        await SceneService.updateScene(selectedSceneId, payload);
        toast.success("Cập nhật bối cảnh thành công!");
      } else {
        await SceneService.createScene(payload);
        toast.success("Tạo bối cảnh thành công!");
      }
      setIsModalVisible(false);
      fetchScenes();
    } catch {
      toast.error("Đã có lỗi khi lưu bối cảnh!");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dataSource;
    return dataSource.filter(s =>
      [s.sceneName, s.description].some(v => (v || "").toLowerCase().includes(q))
    );
  }, [dataSource, search]);

  const columns = [
    { title: "Tên bối cảnh", dataIndex: "sceneName", width: 320 },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 600,
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{ display: "inline-block", maxWidth: 560, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_: any, record: Scene) => {
        const allowed = isOwner(record);
        return (
          <Space>
            <Tooltip title={allowed ? "Sửa" : "Chỉ người tạo mới được sửa"}>
              <span>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled={!allowed}
                  onClick={() => handleEdit(record)}
                />
              </span>
            </Tooltip>
            <Tooltip title={allowed ? "Xoá" : "Chỉ người tạo mới được xoá"}>
              <span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!allowed}
                  onClick={() => handleDelete(record.id)}
                />
              </span>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // GUARD: chưa đăng nhập
  if (!currentUserId) {
    return (
      <div>
        <Input.Search
          placeholder="Tìm kiếm bối cảnh"
          style={{ width: 280, marginBottom: 12 }}
          disabled
        />
        <Button type="primary" icon={<PlusOutlined />} disabled>
          Thêm bối cảnh
        </Button>
        <p style={{ marginTop: 12, color: "#999" }}>
          Vui lòng đăng nhập để xem và quản lý bối cảnh của bạn.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <Input.Search
          placeholder="Tìm kiếm bối cảnh"
          style={{ width: 320 }}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={setSearch}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm bối cảnh
        </Button>
      </div>

      <Table
        columns={columns as any}
        dataSource={filtered}
        pagination={{ pageSize: 8 }}
        rowKey={(r: Scene) => r.id}
        loading={loading}
        bordered
        scroll={{ x: "max-content" }}
      />

      {/* CREATE / UPDATE Modal */}
      <Modal
        open={isModalVisible}
        title={isEditing ? "Sửa bối cảnh" : "Thêm bối cảnh"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
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
          <Col><Button onClick={() => { setDeleteVisible(false); setDeleteId(null); }}>Huỷ</Button></Col>
          <Col><Button type="primary" danger loading={loading} onClick={onDelete}>Xoá</Button></Col>
        </Row>
      </Modal>
    </div>
  );
};

export default SceneManagement;
