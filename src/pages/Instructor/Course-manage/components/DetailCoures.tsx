import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Collapse,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TopicService } from "../../../../services/topic.service";
import { CourseService } from "../../../../services/course.service";
import { SceneService } from "../../../../services/scene.service";
import { toast } from "sonner";
import { LessonService } from "../../../../services/lesson.service";
const { Panel } = Collapse;
const DetailCoures = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleLesson, setIsModalVisibleLesson] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonsByTopic, setLessonsByTopic] = useState<{
    [key: string]: any[];
  }>({});
  const [scenes, setScenes] = useState<any[]>([]);
  const [form] = Form.useForm();
  const fetchDataTopic = async () => {
    try {
      if (!id) {
        return null;
      }
      const res = await TopicService.getTopicByCourse(id);
      setTopics(res);
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };
  const fetchCoursesAndScenes = async () => {
    const [, sceneRes] = await Promise.all([
      CourseService.getAllCourses(),
      SceneService.getAllScenes(),
    ]);

    setScenes(sceneRes);
  };
  const fetchLessons = async (topicId: string) => {
    try {
      const res = await LessonService.getLessonByTopic(topicId);
      setLessonsByTopic((prev) => ({ ...prev, [topicId]: res || [] }));
    } catch (error) {
      console.log(error);
    }
  };
  const handleCollapseChange = (keys: string | string[]) => {
    const openKeys = Array.isArray(keys) ? keys : [keys];
    setActiveKeys(openKeys);

    const topicId = openKeys[openKeys.length - 1];
    if (topicId && !lessonsByTopic[topicId]) {
      fetchLessons(topicId);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };
  const handleSubmitTopic = async () => {
    if (!id) {
      return;
    }
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("topicName", values.topicName);
      formData.append("description", values.description);
      formData.append("courseId", id);
      formData.append("sceneId", values.sceneId);
      if (values.imgUrl?.[0]?.originFileObj) {
        formData.append("imgUrl", values.imgUrl[0].originFileObj);
      }

      //   if (isEditing && selectedTopicId) {
      //     await TopicService.updateTopic(selectedTopicId, formData);
      //     toast.success("Cập nhật topic thành công!");
      //   } else {
      await TopicService.createTopic(formData);
      toast.success("Tạo topic thành công!");
      //   }
      setIsModalVisible(false);
      fetchDataTopic();
    } catch (e) {
      toast.error("Có lỗi xảy ra khi lưu topic!");
    }
  };

  const handleDeleteLesson = async (lessonId: string, topicId: string) => {
    const isConfirmed = window.confirm("Bạn có chắc muốn xóa lesson này?");
    if (!isConfirmed) return;

    try {
      await LessonService.deleteLesson(lessonId);
      toast.success("Xóa lesson thành công");

      setLessonsByTopic((prev) => ({
        ...prev,
        [topicId]: prev[topicId].filter((l) => l.id !== lessonId),
      }));
    } catch (error) {
      console.log(error);
      toast.error("Xóa lesson thất bại");
    }
  };

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      topicId: selectedTopic,
      status: 1,
    };
    if (!selectedTopic) return;
    try {
      if (editingLesson) {
        await LessonService.updateLesson(editingLesson.id, payload);
        toast.success("Cập nhật lesson thành công");

        setLessonsByTopic((prev) => ({
          ...prev,
          [selectedTopic]: prev[selectedTopic].map((l) =>
            l.id === editingLesson.id ? { ...l, ...payload } : l
          ),
        }));
      } else {
        const res = await LessonService.createLesson(payload);
        toast.success("Tạo bài học thành công");

        setLessonsByTopic((prev) => ({
          ...prev,
          [selectedTopic]: [...(prev[selectedTopic] || []), res],
        }));
      }

      setIsModalVisibleLesson(false);
      setEditingLesson(null);
      setSelectedTopic(null);
      form.resetFields();
    } catch (err) {
      console.error(err);
      toast.error(editingLesson ? "Cập nhật thất bại" : "Tạo thất bại");
    }
  };

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList || []);
  useEffect(() => {
    fetchDataTopic();
    fetchCoursesAndScenes();
  }, []);

  return (
    <Spin spinning={loading}>
      <Flex style={{ width: "100%" }} vertical>
        <Flex justify="space-between" style={{ marginBottom: "12px" }}>
          <Typography style={{ fontSize: "30px", fontWeight: "bold" }}>
            ABC - Nguyen Van A
          </Typography>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add new topic
          </Button>
        </Flex>

        <Collapse
          activeKey={activeKeys}
          style={{ width: "100%" }}
          onChange={handleCollapseChange}
        >
          {topics?.map((tp: any) => (
            <Panel
              header={
                <Flex justify="space-between" align="center">
                  <Typography style={{ fontWeight: "bold", fontSize: "18px" }}>
                    {" "}
                    {tp?.topicName}
                  </Typography>
                  <Button
                    style={{ background: "tomato", color: "white" }}
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTopic(tp.id);
                      setIsModalVisibleLesson(true);
                    }}
                  >
                    Add new lesson
                  </Button>
                </Flex>
              }
              key={tp.id}
            >
              {lessonsByTopic[tp.id]?.length ? (
                lessonsByTopic[tp.id].map((lesson) => (
                  <div
                    key={lesson.id}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      marginBottom: "12px",
                      background: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 2px 6px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div>
                      <Typography
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          color: "#1890ff",
                          marginBottom: "4px",
                        }}
                      >
                        {lesson.lessonName}
                      </Typography>
                      <Typography style={{ fontSize: "14px", color: "#555" }}>
                        {lesson.description || "No description"}
                      </Typography>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <EditOutlined
                        style={{
                          color: "#1890ff",
                          fontSize: "18px",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTopic(tp.id);
                          setEditingLesson(lesson);
                          setIsModalVisibleLesson(true);
                        }}
                      />
                      <DeleteOutlined
                        style={{
                          color: "red",
                          fontSize: "18px",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id, tp.id);
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  Loading or no lessons
                </p>
              )}
            </Panel>
          ))}
        </Collapse>
      </Flex>
      <Modal
        open={isModalVisible}
        title={"Add new topic"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitTopic}
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

      <Modal
        open={isModalVisibleLesson}
        title={editingLesson ? "Edit lesson" : "Add new lesson"}
        onCancel={() => {
          setIsModalVisibleLesson(false);
          setEditingLesson(null);
        }}
        style={{ marginBottom: 24 }}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={editingLesson || {}}
        >
          <Form.Item
            label="Tên bài học"
            name="lessonName"
            rules={[{ required: true, message: "Nhập tên bài học" }]}
          >
            <Input placeholder="VD: Bài học 1" />
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Nhập tiêu đề" }]}
          >
            <Input placeholder="VD: Giới thiệu bài học" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả bài học" />
          </Form.Item>
          {editingLesson && (
            <Form.Item
              label="Thứ tự bài giảng"
              name="orderIndex"
              rules={[{ required: true, message: "Thứ tự bài giảng" }]}
            >
              <InputNumber placeholder="Thứ tự bài giảng" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingLesson ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default DetailCoures;
