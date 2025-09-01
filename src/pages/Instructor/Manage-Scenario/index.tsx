import React, { useEffect, useState } from "react";
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

const ScenarioManager: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [form] = Form.useForm();

  // Load danh sách Scenario
  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await ScenarioService.getScenarios();
      setScenarios(data);
    } catch {
      message.error("Không tải được danh sách Scenario!");
    } finally {
      setLoading(false);
    }
  };

  // Load Scene cho Select
  const fetchScenes = async () => {
    try {
      const data = await SceneService.getAllScenes();
      setScenes(data);
    } catch {
      message.error("Không tải được Scene!");
    }
  };

  useEffect(() => {
    fetchScenarios();
    fetchScenes();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("scenarioName", values.scenarioName);
      formData.append("description", values.description);
      formData.append("sceneId", values.sceneId);
      if (values.fileUrl && values.fileUrl[0]) {
        formData.append("fileUrl", values.fileUrl[0].originFileObj);
      }

      if (editingScenario) {
        await ScenarioService.updateScenario(editingScenario.id, formData);
        message.success("Cập nhật Scenario thành công!");
      } else {
        await ScenarioService.createScenario(formData);
        message.success("Tạo Scenario thành công!");
      }

      setModalVisible(false);
      setEditingScenario(null);
      form.resetFields();
      fetchScenarios();
    } catch {
      message.error("Thao tác thất bại!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ScenarioService.deleteScenario(id);
      message.success("Xóa thành công!");
      fetchScenarios();
    } catch {
      message.error("Xóa thất bại!");
    }
  };

  const columns = [
    { title: "Scenario Name", dataIndex: "scenarioName", key: "scenarioName" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => {
        if (!text) return "—";
        return (
          <Tooltip title={text}>
            <Typography.Paragraph
              style={{ margin: 0, maxWidth: 420 }}
              ellipsis={{ rows: 2, expandable: false }}
            >
              {text}
            </Typography.Paragraph>
          </Tooltip>
        );
      },
    },

    {
      title: "Scene",
      dataIndex: "sceneId",
      key: "sceneId",
      render: (id: string) => {
        const scene = scenes.find((s) => s.id === id || s.id === id);
        return scene ? scene.sceneName : id;
      },
    },
    {
      title: "File",
      dataIndex: "fileUrl",
      key: "fileUrl",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            Xem file
          </a>
        ) : (
          "Không có"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setEditingScenario(record);
              setModalVisible(true);
              form.setFieldsValue({
                scenarioName: record.scenarioName,
                description: record.description,
                sceneId: record.sceneId,
              });
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa scenario?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Quản lý Scenario</h2>

      <Button
        type="primary"
        onClick={() => {
          setEditingScenario(null);
          setModalVisible(true);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        + Add Scenario
      </Button>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={scenarios}
        loading={loading}
      />

      <Modal
        title={editingScenario ? "Sửa Scenario" : "Thêm Scenario"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingScenario(null);
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Scenario Name"
            name="scenarioName"
            rules={[{ required: true, message: "Nhập scenarioName!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Nhập description!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Scene"
            name="sceneId"
            rules={[{ required: true, message: "Chọn scene!" }]}
          >
            <Select placeholder="Chọn scene">
              {scenes.map((scene) => (
                <Select.Option key={scene.id} value={scene.id}>
                  {scene.sceneName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="File"
            name="fileUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScenarioManager;
