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

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await ScenarioService.getScenarios();
      setScenarios(data || []);
    } catch {
      message.error("Không tải được danh sách kịch bản!");
    } finally {
      setLoading(false);
    }
  };

  const fetchScenes = async () => {
    try {
      const data = await SceneService.getAllScenes();
      setScenes(data || []);
    } catch {
      message.error("Không tải được danh sách bối cảnh (Scene)!");
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
        message.success("Cập nhật kịch bản thành công!");
      } else {
        await ScenarioService.createScenario(formData);
        message.success("Tạo kịch bản thành công!");
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
      message.success("Xoá kịch bản thành công!");
      fetchScenarios();
    } catch {
      message.error("Xoá kịch bản thất bại!");
    }
  };

  const columns = [
    { title: "Tên kịch bản", dataIndex: "scenarioName", key: "scenarioName" },
    {
      title: "Mô tả",
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
      title: "Bối cảnh (Scene)",
      dataIndex: "sceneId",
      key: "sceneId",
      render: (id: string) => {
        const scene = scenes.find((s: any) => s.id === id || s._id === id);
        return scene ? scene.sceneName : id;
      },
    },
    {
      title: "Tệp",
      dataIndex: "fileUrl",
      key: "fileUrl",
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
      title: "Thao tác",
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
                fileUrl: record.fileUrl
                  ? [
                      {
                        uid: "-1",
                        name: record.fileUrl.split("/").pop() || "file",
                        status: "done",
                        url: record.fileUrl,
                      },
                    ]
                  : [],
              });
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá kịch bản?"
            okText="Xoá"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small">
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Quản lý Kịch bản (Scenario)</h2>

      <Button
        type="primary"
        onClick={() => {
          setEditingScenario(null);
          setModalVisible(true);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        + Thêm kịch bản
      </Button>

      <Table
        rowKey={(r: any) => r?.id ?? r?._id}
        columns={columns as any}
        dataSource={scenarios}
        loading={loading}
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
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên kịch bản"
            name="scenarioName"
            rules={[{ required: true, message: "Vui lòng nhập tên kịch bản!" }]}
          >
            <Input placeholder="VD: Kịch bản xử lý đơn hàng" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về kịch bản" />
          </Form.Item>

          <Form.Item
            label="Bối cảnh (Scene)"
            name="sceneId"
            rules={[{ required: true, message: "Vui lòng chọn bối cảnh!" }]}
          >
            <Select placeholder="Chọn bối cảnh">
              {scenes.map((scene: any) => (
                <Select.Option key={scene.id || scene._id} value={scene.id || scene._id}>
                  {scene.sceneName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tệp đính kèm"
            name="fileUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList || [])}
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
