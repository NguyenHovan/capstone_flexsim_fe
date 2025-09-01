import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
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
  Table,
  Typography,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopicService } from "../../../../services/topic.service";
import { CourseService } from "../../../../services/course.service";
import { SceneService } from "../../../../services/scene.service";
import { toast } from "sonner";
import { LessonService } from "../../../../services/lesson.service";
import { ScenarioService } from "../../../../services/scenario.service";

const { Panel } = Collapse;

const DetailCoures = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleLesson, setIsModalVisibleLesson] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [courseDetail, setCourseDetail] = useState({
    courseName: "",
    instructorFullName: "",
  });

  const [lessonsByTopic, setLessonsByTopic] = useState<{
    [key: string]: any[];
  }>({});
  const [, setScenes] = useState<any[]>([]);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
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

  const fetchScenairios = async () => {
    try {
      const res = await ScenarioService.getScenarios();
      setScenarios(res);
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
  // const handleOpenCreateTopic = () => {
  //   form.resetFields();
  //   setEditingTopic(null);
  //   setIsModalVisible(true);
  // };

  const handleOpenEditTopic = (tp: any) => {
    setEditingTopic(tp);
    setIsModalVisible(true);
    form.setFieldsValue({
      topicName: tp.topicName,
      description: tp.description,
      orderIndex: tp.orderIndex,
    });
  };
  const handleSubmitTopic = async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("topicName", values.topicName);
      formData.append("description", values.description);
      formData.append("orderIndex", values.orderIndex);
      formData.append("courseId", id);

      if (values.imgUrl?.[0]?.originFileObj) {
        formData.append("imgUrl", values.imgUrl[0].originFileObj);
      }

      if (editingTopic) {
        await TopicService.updateTopic(editingTopic.id, formData);
        toast.success("Cập nhật topic thành công!");
      } else {
        await TopicService.createTopic(formData);
        toast.success("Tạo topic thành công!");
      }

      setIsModalVisible(false);
      setEditingTopic(null);
      fetchDataTopic();
    } catch (e) {
      toast.error(
        editingTopic ? "Có lỗi khi cập nhật topic!" : "Có lỗi khi tạo topic!"
      );
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
    if (!selectedTopic) return;

    try {
      const fd = new FormData();
      fd.append("topicId", String(selectedTopic));
      fd.append("status", "1");
      fd.append("description", values.description);
      fd.append("lessonName", values.lessonName);
      fd.append("title", values.title);

      // Chỉ append orderIndex nếu có (tránh undefined khi tạo mới)
      if (values.orderIndex !== undefined && values.orderIndex !== null) {
        fd.append("orderIndex", String(values.orderIndex));
      }

      const fileList = Array.isArray(values.fileUrl) ? values.fileUrl : [];
      const fileObj: File | undefined = fileList[0]?.originFileObj;

      // Video là tùy chọn: chỉ append khi người dùng chọn
      if (fileObj) {
        fd.append("fileUrl", fileObj);
      }

      if (editingLesson) {
        await LessonService.updateLesson(editingLesson.id, fd);
        toast.success("Cập nhật lesson thành công");
      } else {
        await LessonService.createLesson(fd);
        toast.success("Tạo bài học thành công");
      }

      form.resetFields();
      setIsModalVisibleLesson(false);
      setEditingLesson(null);
      setSelectedTopic(null);
    } catch (err) {
      console.error(err);
      toast.error(editingLesson ? "Cập nhật thất bại" : "Tạo thất bại");
    }
  };

  const mappedInitialValues = React.useMemo(() => {
    if (!editingLesson) return { fileUrl: [] };
    const { fileUrl, ...rest } = editingLesson;
    return {
      ...rest,
      fileUrl: fileUrl
        ? [
            {
              uid: "-1",
              name: fileUrl.split("/").pop() || "video.mp4",
              status: "done",
              url: fileUrl,
            },
          ]
        : [],
    };
  }, [editingLesson]);

  useEffect(() => {
    fetchDataTopic();
    fetchCoursesAndScenes();
    fetchCourseDetail();
    fetchScenairios();
  }, []);

  return (
    <Spin spinning={loading}>
      <Flex style={{ width: "100%" }} vertical>
        <Flex justify="space-between" style={{ marginBottom: "12px" }}>
          <Typography style={{ fontSize: "30px", fontWeight: "bold" }}>
            {courseDetail?.courseName} - {courseDetail?.instructorFullName}
          </Typography>
          <Flex gap={12}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add new topic
            </Button>
          </Flex>
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
                  <Flex gap={12}>
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditTopic(tp);
                      }}
                    >
                      Edit Topic
                    </Button>

                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      style={{
                        background:
                          "linear-gradient(90deg, #ff7e5f, #ff0000ff)",
                        border: "none",
                        color: "white",
                        fontWeight: 600,
                        borderRadius: "8px",
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await TopicService.deleteTopic(tp.id);
                        fetchDataTopic();
                      }}
                    >
                      Delete Topic
                    </Button>
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
                          {lesson.fileUrl && (
                            <video
                              style={{
                                width: "80%",
                                maxWidth: "720px",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              }}
                              controls
                              src={lesson.fileUrl}
                            />
                          )}
                          {lesson.scenario && (
                            <Flex
                              justify="space-between"
                              style={{
                                marginTop: "8px",
                                padding: "10px",
                                border: "2px dashed #b6b6b6ff",
                                borderRadius: "8px",
                                background: "#fafafa",
                                width: 400,
                              }}
                            >
                              <Flex vertical>
                                <Typography
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#722ed1",
                                    marginBottom: "4px",
                                  }}
                                >
                                  📌 Scenario: {lesson.scenario.scenarioName}
                                </Typography>
                                <Typography
                                  style={{
                                    fontSize: "13px",
                                    color: "#555",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {lesson.scenario.description ||
                                    "No description"}
                                </Typography>
                                {lesson.scenario.fileUrl && (
                                  <a
                                    href={lesson.scenario.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      fontSize: "13px",
                                      color: "#1890ff",
                                    }}
                                  >
                                    📂 Xem file Scenario
                                  </a>
                                )}
                              </Flex>
                              <Button
                                onClick={() =>
                                  navigate(
                                    `/instructor-lesson-submission/${lesson.id}`
                                  )
                                }
                              >
                                View submit
                              </Button>
                            </Flex>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                          {lesson?.quizzes?.length === 0 && (
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
                                navigate(`/instructor-quiz/${lesson.id}/${id}`);
                              }}
                            />
                          )}

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

                              form.setFieldsValue({
                                ...lesson,
                                fileUrl: lesson.fileUrl
                                  ? [
                                      {
                                        uid: "-1",
                                        name:
                                          lesson.fileUrl.split("/").pop() ||
                                          "video.mp4",
                                        status: "done",
                                        url: lesson.fileUrl,
                                      },
                                    ]
                                  : [],
                              });
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
        title={editingTopic ? "Edit topic" : "Add new topic"}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTopic(null);
        }}
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
            label="Thứ tự"
            name="orderIndex"
            rules={[
              { required: true, message: "Vui lòng nhập thứ tự bài giảng" },
            ]}
          >
            <InputNumber min={1} />
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
        width={1000}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={mappedInitialValues}
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

          <Form.Item label="Scenario" name="scenarioId">
            <Select placeholder="Chọn scenarioId">
              {scenarios.map((scene) => (
                <Select.Option key={scene.id} value={scene.id}>
                  {scene.scenarioName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Video tùy chọn */}
          <Form.Item
            label="Video bài học (không bắt buộc)"
            name="fileUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList ? e.fileList : [];
            }}
          >
            <Upload accept="video/*" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn video (tuỳ chọn)</Button>
            </Upload>
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
