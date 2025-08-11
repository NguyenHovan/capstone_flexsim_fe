import { Table, Input, Button, Space, Tooltip, Modal, Form } from "antd";
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
  const [form] = Form.useForm();

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      setLoading(true);
      const res = await SceneService.getAllScenes();
      setDataSource(res);
    } catch (e) {
      toast.error("Lỗi khi tải scene");
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
    setSelectedSceneId(record.id);
    form.setFieldsValue({
      sceneName: record.sceneName,
      description: record.description,
      imgUrl: [
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: record.imgUrl,
        },
      ],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa scene này?",
      onOk: async () => {
        try {
          await SceneService.deleteScene(id);
          toast.success("Xóa thành công!");
          fetchScenes();
        } catch (err) {
          toast.error("Xóa thất bại!");
        }
      },
    });
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("sceneName", values.sceneName);
      formData.append("description", values.description);

      const imageFile = values.imgUrl?.[0];
      if (imageFile?.originFileObj) {
        // Nếu là ảnh mới
        formData.append("imgUrl", imageFile.originFileObj);
      } else if (imageFile?.url) {
        // Nếu là ảnh cũ → fetch ảnh từ URL về dạng blob
        const response = await fetch(imageFile.url);
        const blob = await response.blob();
        const filename = imageFile.name || "existing-image.jpg";
        const file = new File([blob], filename, { type: blob.type });
        formData.append("imgUrl", file);
      }

      if (isEditing && selectedSceneId) {
        await SceneService.updateScene(selectedSceneId, formData);
        toast.success("Cập nhật scene thành công!");
      } else {
        await SceneService.createScene(formData);
        toast.success("Tạo scene thành công!");
      }
      setIsModalVisible(false);
      fetchScenes();
    } catch (e) {
      toast.error("Có lỗi xảy ra khi lưu scene!");
    }
  };

  const columns = [
    {
      title: "Tên Scene",
      dataIndex: "sceneName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Ảnh",
      dataIndex: "imgUrl",
      render: (url: string) => (
        <img src={url} alt="scene" width={50} height={50} />
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <EditOutlined onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: "red" }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList || []);

  return (
    <div>
      <div className="header-section" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Tìm scene" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Scene
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 6 }}
        rowKey="id"
        loading={loading}
        bordered
      />

      <Modal
        open={isModalVisible}
        title={isEditing ? "Cập nhật Scene" : "Tạo Scene"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên Scene"
            name="sceneName"
            rules={[{ required: true, message: "Vui lòng nhập tên scene" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          {/* <Form.Item
            label="Ảnh đại diện"
            name="imgUrl"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default SceneManagement;
