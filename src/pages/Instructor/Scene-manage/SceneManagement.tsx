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
    setSelectedSceneId(record.id);
    form.setFieldsValue({
      sceneName: record.sceneName,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xoá bối cảnh này?",
      onOk: async () => {
        try {
          await SceneService.deleteScene(id);
          toast.success("Xoá bối cảnh thành công!");
          fetchScenes();
        } catch (err) {
          toast.error("Xoá bối cảnh thất bại!");
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

      // const imageFile = values.imgUrl?.[0];
      // if (imageFile?.originFileObj) {
      //   // Nếu là ảnh mới
      //   formData.append("imgUrl", imageFile.originFileObj);
      // } else if (imageFile?.url) {
      //   // Nếu là ảnh cũ → fetch ảnh từ URL về dạng blob
      //   const response = await fetch(imageFile.url);
      //   const blob = await response.blob();
      //   const filename = imageFile.name || "existing-image.jpg";
      //   const file = new File([blob], filename, { type: blob.type });
      //   formData.append("imgUrl", file);
      // }

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
    {
      title: "Tên bối cảnh",
      dataIndex: "sceneName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    // {
    //   title: "Ảnh",
    //   dataIndex: "imgUrl",
    //   render: (url: string) => (
    //     <img src={url} alt="scene" width={50} height={50} />
    //   ),
    // },
    {
      title: "Thao tác",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <EditOutlined onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xoá">
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
        <Input.Search placeholder="Tìm kiếm bối cảnh" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm bối cảnh
        </Button>
      </div>

      <Table
        columns={columns as any}
        dataSource={dataSource}
        pagination={{ pageSize: 6 }}
        rowKey="id"
        loading={loading}
        bordered
      />

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
