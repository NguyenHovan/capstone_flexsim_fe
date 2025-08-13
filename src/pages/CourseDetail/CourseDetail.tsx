import {
  Card,
  Button,
  Row,
  Col,
  Rate,
  List,
  Avatar,
  Tag,
  Modal,
  Flex,
} from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CourseService } from "../../services/course.service";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";
import { LessonService } from "../../services/lesson.service";
import { CourseProgressService } from "../../services/course-progress.service";
import CourseProgress from "./CourseProgress";
import type { Course } from "../../types/course";
import { TopicService } from "../../services/topic.service";

const CourseDetail = () => {
  const { id } = useParams();
  const [courseDetail, setCourseDetail] = useState<Course>();
  const [myProgress, setMyProgress] = useState<any>();
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const userString = localStorage.getItem("currentUser");
  const currentUser = userString ? JSON.parse(userString) : null;

  const fetchMyCourseProgress = async () => {
    try {
      const response = await CourseProgressService.getMyCourseProgress(
        currentUser.id,
        id || ""
      );
      setMyProgress(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      if (!id) return toast.error("Lỗi tải dữ liệu");
      const res = await CourseService.getCourseById(id);
      setCourseDetail(res);
    } catch (error) {
      console.log({ error });
    }
  };

  const fetchTopicByCourse = async () => {
    try {
      if (!id) return toast.error("Lỗi tải dữ liệu");
      const res = await TopicService.getTopicByCourse(id);
      setTopics(res);
    } catch (error) {
      console.log({ error });
    }
  };

  const fetchLessonsByTopic = async () => {
    try {
      const response = await LessonService.getLessonByTopic(selectedTopic.id);
      setLessons(response);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };
  const handleOpenModal = (topic: any) => {
    setSelectedTopic(topic);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setIsModalVisible(false);
  };
  useEffect(() => {
    fetchCourseDetail();
    fetchTopicByCourse();
    fetchMyCourseProgress();
  }, []);

  const handleEnrollRequest = async () => {
    if (!courseDetail) return toast.error("Lỗi tải dữ liệu");

    try {
      const res = await EnrollmentRequestService.enrollmentRequest({
        studentId: currentUser?.id,
        courseId: courseDetail?.id,
      });
      toast.success(res.message);
    } catch {
      toast.error("Học viên đã gửi yêu cầu hoặc đang theo học khóa học này");
    }
  };
  useEffect(() => {
    if (selectedTopic) {
      fetchLessonsByTopic();
    }
  }, [selectedTopic]);
  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <Card
        bodyStyle={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: 24,
          borderRadius: 8,
          backgroundColor: "#f5f5f5",
        }}
      >
        <img
          src={courseDetail?.imgUrl}
          alt="Thumbnail"
          style={{
            width: 180,
            height: 180,
            objectFit: "cover",
            borderRadius: 8,
            marginRight: 32,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>{courseDetail?.courseName}</h2>
          <Rate
            value={Number(courseDetail?.ratingAverage)}
            disabled
            style={{ marginBottom: 8 }}
          />
          <div style={{ color: "#555", marginBottom: 16 }}>
            Created at: {courseDetail?.createdAt}
          </div>
          <Button type="primary" danger onClick={handleEnrollRequest}>
            Enroll Course
          </Button>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <Avatar src="https://cdn-icons-png.flaticon.com/512/706/706830.png" />
        <div>
          <strong>Instructor A</strong>
          <div style={{ fontSize: 12, color: "#888" }}>Lead Instructor</div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">Tags</Tag>
            <Tag color="green">Overview</Tag>
            <Tag color="purple">Author</Tag>
            <Tag color="orange">FAQs</Tag>
            <Tag color="red">Announcement</Tag>
            <Tag color="gold">Review</Tag>
          </div>

          <h3>About the Course</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            {courseDetail?.description || "No description available."}
          </p>
        </Col>

        <Col xs={24} md={10}>
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 8,
              backgroundColor: "#fafafa",
            }}
          >
            <h4 style={{ marginBottom: 16 }}>Your Progress</h4>
            {myProgress && <CourseProgress data={myProgress} />}
          </Card>

          <Card
            title="Lessons"
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 12 }}
          >
            <List
              itemLayout="horizontal"
              dataSource={topics}
              renderItem={(item: any, index: number) => (
                <List.Item
                  style={{
                    padding: "12px 8px",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => handleOpenModal(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <PlayCircleOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />
                    }
                    title={`${(index + 1).toString().padStart(2, "0")}. ${
                      item.topicName
                    }`}
                    description={
                      <Flex vertical>
                        <span style={{ color: "#888" }}>
                          {item.description}
                        </span>
                        <img
                          src={item.imgUrl}
                          alt={item.topicName}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </Flex>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Modal
          visible={isModalVisible}
          title={selectedTopic?.topicName || "Lesson Details"}
          onCancel={handleCloseModal}
          footer={null}
          width={1000}
        >
          {selectedTopic && (
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Description chung của topic */}
              {selectedTopic.description && (
                <p style={{ marginBottom: 16 }}>{selectedTopic.description}</p>
              )}

              {lessons && lessons.length > 0 && (
                <List
                  header={<strong>Lessons</strong>}
                  itemLayout="horizontal"
                  dataSource={lessons}
                  renderItem={(lesson: any, index: number) => (
                    <List.Item
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <List.Item.Meta
                        title={`${(index + 1).toString().padStart(2, "0")}. ${
                          lesson.lessonName
                        }`}
                        description={lesson.description}
                      />
                    </List.Item>
                  )}
                />
              )}

              {(!lessons || lessons.length === 0) && (
                <p>No lessons available.</p>
              )}
            </div>
          )}
        </Modal>
      </Row>
    </div>
  );
};

export default CourseDetail;
