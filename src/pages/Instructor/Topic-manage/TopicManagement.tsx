import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  Form,
  Upload,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopicService } from "../../../services/topic.service";
import { CourseService } from "../../../services/course.service";
import { SceneService } from "../../../services/scene.service";

const TopicManagement = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTopics();
    fetchCoursesAndScenes();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await TopicService.getAllTopics();
      setDataSource(res);
    } catch (e) {
      toast.error("Lỗi khi tải topics");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndScenes = async () => {
    const [courseRes, sceneRes] = await Promise.all([
      CourseService.getAllCourses(),
      SceneService.getAllScenes(),
    ]);
    setCourses(courseRes);
    setScenes(sceneRes);
  };

  const handleAdd = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setSelectedTopicId(record.id);
    form.setFieldsValue({
      topicName: record.topicName,
      description: record.description,
      courseId: record.course?.id,
      sceneId: record.scene?.id,
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
    try {
      await TopicService.deleteTopic(id);
      toast.success("Xóa thành công!");
      fetchTopics();
    } catch (err) {
      toast.error("Xóa thất bại!");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("topicName", values.topicName);
      formData.append("description", values.description);
      formData.append("courseId", values.courseId);
      formData.append("sceneId", values.sceneId);
      if (values.imgUrl?.[0]?.originFileObj) {
        formData.append("imgUrl", values.imgUrl[0].originFileObj);
      }

      if (isEditing && selectedTopicId) {
        await TopicService.updateTopic(selectedTopicId, formData);
        toast.success("Cập nhật topic thành công!");
      } else {
        await TopicService.createTopic(formData);
        toast.success("Tạo topic thành công!");
      }
      setIsModalVisible(false);
      fetchTopics();
    } catch (e) {
      toast.error("Có lỗi xảy ra khi lưu topic!");
    }
  };

  const columns = [
    {
      title: "Tên topic",
      dataIndex: "topicName",
    },
    {
      title: "Khóa học",
      dataIndex: ["course", "courseName"],
    },
    {
      title: "Scene",
      dataIndex: ["scene", "sceneName"],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Ảnh",
      dataIndex: "imgUrl",
      render: (url: string) => (
        <img src={url} alt="topic" width={50} height={50} />
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

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList || []);

  return (
    <div>
      <div className="header-section">
        <Input.Search placeholder="Search topic" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Topic
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
        title={isEditing ? "Cập nhật topic" : "Tạo topic"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên Topic"
            name="topicName"
            rules={[{ required: true, message: "Vui lòng nhập tên topic" }]}
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

          <Form.Item
            label="Khóa học"
            name="courseId"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.courseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Scene"
            name="sceneId"
            rules={[{ required: true, message: "Bắt buộc" }]}
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
            label="Ảnh đại diện"
            name="imgUrl"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicManagement;
