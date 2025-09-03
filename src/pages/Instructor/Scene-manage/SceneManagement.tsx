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
      toast.error("Error loading scene");
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
      title: "Are you sure you want to delete this scene?",
      onOk: async () => {
        try {
          await SceneService.deleteScene(id);
          toast.success("Deleted successfully!");
          fetchScenes();
        } catch (err) {
          toast.error("Delete failed!");
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
        toast.success("Scene update successful!");
      } else {
        await SceneService.createScene(formData);
        toast.success("Scene creation successful!");
      }
      setIsModalVisible(false);
      fetchScenes();
    } catch (e) {
      toast.error("An error occurred while saving the scene!");
    }
  };

  const columns = [
    {
      title: "Scene Name",
      dataIndex: "sceneName",
    },
    {
      title: "Description",
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
      title: "Action",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit">
            <EditOutlined onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
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
        <Input.Search placeholder="Search Scene" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Scene
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
        title={isEditing ? "Edit Scene" : "Add Scene"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Edit" : "Create New Scene"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Scene Name"
            name="sceneName"
            rules={[{ required: true, message: "Please enter Scene Name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter Discription" }]}
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
