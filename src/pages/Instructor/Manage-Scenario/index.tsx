import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Select,
  Tooltip,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ScenarioService } from "../../../services/scenario.service";
import { SceneService } from "../../../services/scene.service";
import type { Scenario } from "../../../types/scenario";
import type { Scene } from "../../../types/scene";
import { useNavigate } from "react-router-dom";

const ScenarioManager: React.FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [form] = Form.useForm();

  // current user id
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.id || null;
    } catch {
      return null;
    }
  }, []);

  const isOwner = (row: Scenario) =>
    !!currentUserId && row.instructorId === currentUserId;

  const loadScenes = async () => {
    if (!currentUserId) return;
    try {
      const data = await SceneService.getScenesByInstructor(currentUserId);
      setScenes(data || []);
    } catch {
      message.error("Không tải được danh sách bối cảnh!");
    }
  };

  const loadScenarios = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const data = await ScenarioService.getByInstructor(currentUserId);
      setScenarios(data || []);
    } catch {
      message.error("Không tải được danh sách kịch bản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenes();
    loadScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const openCreate = () => {
    if (!currentUserId) {
      message.error("Bạn cần đăng nhập để tạo kịch bản.");
      return;
    }
    setEditingScenario(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (row: Scenario) => {
    if (!isOwner(row)) {
      message.error("Chỉ người tạo mới được sửa kịch bản này.");
      return;
    }
    setEditingScenario(row);
    form.setFieldsValue({
      scenarioName: row.scenarioName,
      description: row.description,
      sceneId: row.sceneId,
      fileUrl: row.fileUrl
        ? [
            {
              uid: "-1",
              name: row.fileUrl.split("/").pop() || "file",
              status: "done",
              url: row.fileUrl,
            },
          ]
        : [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (row: Scenario) => {
    if (!isOwner(row)) {
      message.error("Chỉ người tạo mới được xoá kịch bản này.");
      return;
    }
    try {
      await ScenarioService.deleteScenario(row.id);
      message.success("Xoá kịch bản thành công!");
      setScenarios((prev) => prev.filter((s) => s.id !== row.id));
    } catch {
      message.error("Xoá kịch bản thất bại!");
    }
  };

  const handleSubmit = async (values: any) => {
    if (!currentUserId) {
      message.error("Không xác định được người dùng hiện tại.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("instructorId", currentUserId); // <— bắt buộc
      fd.append("sceneId", values.sceneId);
      fd.append("scenarioName", values.scenarioName);
      fd.append("description", values.description || "");

      // fileUrl là binary; chỉ append khi có file mới
      const fileList = values.fileUrl as any[];
      const first = Array.isArray(fileList) ? fileList[0] : null;
      if (first?.originFileObj) fd.append("fileUrl", first.originFileObj);

      if (editingScenario) {
        await ScenarioService.updateScenario(editingScenario.id, fd);
        message.success("Cập nhật kịch bản thành công!");
      } else {
        await ScenarioService.createScenario(fd);
        message.success("Tạo kịch bản thành công!");
      }

      setModalVisible(false);
      setEditingScenario(null);
      form.resetFields();
      loadScenarios();
    } catch {
      message.error("Thao tác thất bại!");
    }
  };

  const columns = [
    {
      title: "Tên kịch bản",
      dataIndex: "scenarioName",
      key: "scenarioName",
      width: 240,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 460,
      render: (text: string) =>
        text ? (
          <Tooltip title={text} placement="topLeft">
            <Typography.Paragraph
              style={{ margin: 0, maxWidth: 440 }}
              ellipsis={{ rows: 2 }}
            >
              {text}
            </Typography.Paragraph>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "Bối cảnh",
      dataIndex: "sceneId",
      key: "sceneId",
      width: 220,
      render: (id: string) => scenes.find((s) => s.id === id)?.sceneName || id,
    },
    {
      title: "Tệp",
      dataIndex: "fileUrl",
      key: "fileUrl",
      width: 160,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Xem tệp
          </a>
        ) : (
          "Không có"
        ),
    },
    {
      title: "Xem chi tiết",
      dataIndex: "viewDetail",
      key: "viewDetail",
      width: 160,
      render: (_: any, row: Scenario) => (
        <Button
          size="small"
          onClick={() => navigate(`/instructor-scenario-object/${row.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 190,
      render: (_: any, row: Scenario) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            disabled={!isOwner(row)}
            onClick={() => openEdit(row)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá kịch bản?"
            okText="Xoá"
            cancelText="Hủy"
            onConfirm={() => handleDelete(row)}
            disabled={!isOwner(row)}
          >
            <Button danger size="small" disabled={!isOwner(row)}>
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Quản lý Kịch bản (Scenario)</h2>

      <Button type="primary" onClick={openCreate} style={{ marginBottom: 16 }}>
        + Thêm kịch bản
      </Button>

      <Table
        rowKey={(r: Scenario) => r.id}
        columns={columns as any}
        dataSource={scenarios}
        loading={loading}
        bordered
        scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
      />

      <Modal
        title={editingScenario ? "Sửa kịch bản" : "Thêm kịch bản"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingScenario(null);
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên kịch bản"
            name="scenarioName"
            rules={[{ required: true, message: "Vui lòng nhập tên kịch bản!" }]}
          >
            <Input placeholder="VD: Quy trình nhập kho" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả ngắn về kịch bản" />
          </Form.Item>

          <Form.Item
            label="Bối cảnh (Scene)"
            name="sceneId"
            rules={[{ required: true, message: "Vui lòng chọn bối cảnh!" }]}
          >
            <Select
              placeholder="Chọn bối cảnh"
              showSearch
              optionFilterProp="children"
            >
              {scenes.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.sceneName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tệp đính kèm"
            name="fileUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e?.fileList || []
            }
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn tệp</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScenarioManager;
