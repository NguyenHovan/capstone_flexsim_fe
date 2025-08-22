import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
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
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopicService } from "../../../../services/topic.service";
import { CourseService } from "../../../../services/course.service";
import { SceneService } from "../../../../services/scene.service";
import { toast } from "sonner";
import { LessonService } from "../../../../services/lesson.service";
const { Panel } = Collapse;
const DetailCoures = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleLesson, setIsModalVisibleLesson] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [courseDetail, setCourseDetail] = useState({
    courseName: "",
    instructorFullName: "",
  });
  const [lessonsByTopic, setLessonsByTopic] = useState<{
    [key: string]: any[];
  }>({});
  const [scenes, setScenes] = useState<any[]>([]);
  const [form] = Form.useForm();
  const fetchCourseDetail = async () => {
    try {
      const response = await CourseService.getCourseById(id || "");
      setCourseDetail(response);
    } catch (error) {
      console.log({ error });
    }
  };
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

  // const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList || []);
  useEffect(() => {
    fetchDataTopic();
    fetchCoursesAndScenes();
    fetchCourseDetail();
  }, []);

  return (
    <Spin spinning={loading}>
      <Flex style={{ width: "100%" }} vertical>
        <Flex justify="space-between" style={{ marginBottom: "12px" }}>
          <Typography style={{ fontSize: "30px", fontWeight: "bold" }}>
            {courseDetail?.courseName} - {courseDetail?.instructorFullName}
          </Typography>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add new topic
          </Button>
        </Flex>

        <Collapse
          activeKey={activeKeys}
          style={{
            width: "100%",
            background: "#fafafa",
            borderRadius: "12px",
            padding: "8px",
          }}
          onChange={handleCollapseChange}
        >
          {topics?.map((tp: any) => (
            <Panel
              header={
                <Flex justify="space-between" align="center">
                  <Typography
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      color: "#333",
                    }}
                  >
                    📚 {tp?.topicName}
                  </Typography>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{
                      background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
                      border: "none",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTopic(tp.id);
                      setIsModalVisibleLesson(true);
                    }}
                  >
                    Add Lesson
                  </Button>
                </Flex>
              }
              key={tp.id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                marginBottom: "12px",
                border: "1px solid #eee",
              }}
            >
              {lessonsByTopic[tp.id]?.length ? (
                <>
                  {lessonsByTopic[tp.id].map((lesson) => (
                    <div
                      key={lesson.id}
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "16px",
                        background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
                        boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(-3px)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 6px 14px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform =
                          "translateY(0)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 3px 8px rgba(0,0,0,0.05)";
                      }}
                    >
                      {/* Header: lesson info + actions */}
                      <Flex justify="space-between" align="start">
                        {/* Lesson info */}
                        <div style={{ maxWidth: "75%" }}>
                          <Typography
                            style={{
                              fontWeight: 700,
                              fontSize: "16px",
                              color: "#1890ff",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            🎯 {lesson.lessonName}
                          </Typography>
                          <Typography
                            style={{
                              fontSize: "14px",
                              color: "#555",
                              lineHeight: 1.5,
                            }}
                          >
                            {lesson.description
                              ? lesson.description
                                  .split("\n")
                                  .map((line: any, index: number) => (
                                    <p key={index} style={{ margin: 0 }}>
                                      {line}
                                    </p>
                                  ))
                              : "No description"}
                          </Typography>
                        </div>

                        {/* Action icons */}
                        <div style={{ display: "flex", gap: "12px" }}>
                          <QuestionCircleOutlined
                            style={{
                              color: "#52c41a",
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              ((e.target as HTMLElement).style.color =
                                "#73d13d")
                            }
                            onMouseLeave={(e) =>
                              ((e.target as HTMLElement).style.color =
                                "#52c41a")
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/instructor-quiz/${lesson.id}`);
                            }}
                          />
                          <EditOutlined
                            style={{
                              color: "#1890ff",
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              ((e.target as HTMLElement).style.color =
                                "#40a9ff")
                            }
                            onMouseLeave={(e) =>
                              ((e.target as HTMLElement).style.color =
                                "#1890ff")
                            }
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
                              fontSize: "20px",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              ((e.target as HTMLElement).style.color =
                                "#ff4d4f")
                            }
                            onMouseLeave={(e) =>
                              ((e.target as HTMLElement).style.color = "red")
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id, tp.id);
                            }}
                          />
                        </div>
                      </Flex>

                      {lesson?.quizzes?.length > 0 && (
                        <Table
                          dataSource={lesson.quizzes}
                          columns={[
                            {
                              title: "Câu hỏi",
                              dataIndex: "quizName",
                              key: "quizName",
                            },
                          ]}
                          pagination={false}
                          rowKey="id"
                          style={{ marginTop: "12px" }}
                          onRow={(record: { id: string }) => ({
                            onClick: () => {
                              navigate(`/instructor-quiz-detail/${record.id}`);
                            },
                          })}
                          bordered
                        />
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p
                  style={{
                    color: "#888",
                    fontStyle: "italic",
                    margin: "8px 0",
                  }}
                >
                  ⏳ Loading or no lessons
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

      <Modal
        open={isModalVisibleLesson}
        title={editingLesson ? "Edit lesson" : "Add new lesson"}
        onCancel={() => {
          setIsModalVisibleLesson(false);
          setEditingLesson(null);
        }}
        style={{ marginBottom: 24 }}
        footer={null}
        width={1000}
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
            <Input.TextArea rows={6} placeholder="Nhập mô tả bài học" />
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
