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
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();

  const fetchMyCourseProgress = async () => {
    try {
      const response = await CourseProgressService.getMyCourseProgress(
        currentUser.id,
        id || ""
      );
      setMyProgress(response);
    } catch (error) {
      console.log(error);
      setMyProgress(null);
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

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setIsModalVisible(false);
  };

  useEffect(() => {
    fetchCourseDetail();
    fetchTopicByCourse();
    fetchMyCourseProgress();
  }, []);

  useEffect(() => {
    if (selectedTopic) fetchLessonsByTopic();
  }, [selectedTopic]);

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

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Course Info + My Certificate */}
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
          className="course-thumbnail"
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

          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              type="primary"
              danger
              onClick={handleEnrollRequest}
              disabled={myProgress}
              style={{ borderRadius: "8px" }}
            >
              Enroll Course
            </Button>

            {myProgress?.status === 3 && (
              <Button
                type="default"
                onClick={() =>
                  window.open(
                    "https://res.cloudinary.com/dsfrqevvg/raw/upload/v1755755739/LogiSimEdu_Certificates/certificate_d648765e-aea2-4241-8f04-a1ff25bc423e_edd533fd-2a81-46e7-a32b-22c598e07397.pdf",
                    "_blank"
                  )
                }
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #36d1dc, #5b86e5)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Show Certificate
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Instructor info */}
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
          {myProgress && (
            <>
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
                      onClick={() => navigate(`/topic-detail/${item.id}`)}
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
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </>
          )}
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
                      onClick={() => navigate(`/quiz-test/${lesson.id}`)}
                    >
                      <Flex vertical style={{ width: "100%" }}>
                        <List.Item.Meta
                          title={`${(index + 1).toString().padStart(2, "0")}. ${
                            lesson.lessonName
                          }`}
                          description={lesson.description}
                        />
                        <Button
                          style={{ marginTop: 24, width: 120 }}
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(lesson.id);
                          }}
                        >
                          Learning
                        </Button>
                      </Flex>
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
