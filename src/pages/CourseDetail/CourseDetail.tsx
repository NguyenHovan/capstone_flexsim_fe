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
  Tooltip,
} from "antd";
import { PlayCircleOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CourseService } from "../../services/course.service";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";
import { LessonService } from "../../services/lesson.service";
import { CourseProgressService } from "../../services/course-progress.service";
import CourseProgress from "./CourseProgress";
import type { Course } from "../../types/course";
import { TopicService } from "../../services/topic.service";
import { CertificateService } from "../../services/certificate.service";
import ReviewCardList from "./ReviewCardList";
import CourseReviewForm from "./CourseReviewForm";

type TopicBase = {
  id: string;
  topicName: string;
  description?: string;
  orderIndex?: number;
  createdAt?: string;
};

type TopicWithFinish = TopicBase & {
  studentFinish?: string[];
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [courseDetail, setCourseDetail] = useState<Course>();
  const [myProgress, setMyProgress] = useState<any>(null);

  const [selectedTopic, setSelectedTopic] = useState<TopicBase | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [topics, setTopics] = useState<TopicBase[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [topicsWithFinish, setTopicsWithFinish] = useState<TopicWithFinish[]>(
    []
  );

  const userString = localStorage.getItem("currentUser");
  const currentUser = userString ? JSON.parse(userString) : null;

  const navigate = useNavigate();

  const fetchStudentFinish = async () => {
    try {
      if (!id) return;
      const res = await TopicService.studentFinishTopic(id);
      setTopicsWithFinish(res || []);
    } catch (error) {
      console.log({ error });
      setTopicsWithFinish([]);
    }
  };

  const fetchMyCourseProgress = async () => {
    try {
      if (!id || !currentUser?.id) return;
      const response = await CourseProgressService.getMyCourseProgress(
        currentUser.id,
        id
      );
      setMyProgress(response ?? null);
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
      setTopics(res || []);
    } catch (error) {
      console.log({ error });
      setTopics([]);
    }
  };

  const fetchLessonsByTopic = async () => {
    try {
      if (!selectedTopic?.id) return;
      const response = await LessonService.getLessonByTopic(selectedTopic.id);
      setLessons(response || []);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
      setLessons([]);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
    fetchTopicByCourse();
    fetchMyCourseProgress();
    fetchStudentFinish();
  }, [id]);

  useEffect(() => {
    if (selectedTopic) fetchLessonsByTopic();
  }, [selectedTopic?.id]);

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setIsModalVisible(false);
  };

  const handleEnrollRequest = async () => {
    if (!courseDetail || !currentUser?.id)
      return toast.error("Lỗi tải dữ liệu");
    try {
      const res = await EnrollmentRequestService.enrollmentRequest({
        studentId: currentUser.id,
        courseId: courseDetail.id,
      });
      toast.success(res.message);
    } catch {
      toast.error("Học viên đã gửi yêu cầu hoặc đang theo học khóa học này");
    }
  };

  const mergedTopics: TopicWithFinish[] = useMemo(() => {
    const mapFinish = new Map<string, TopicWithFinish>();
    topicsWithFinish.forEach((t) => mapFinish.set(t.id, t));

    const merged = topics.map((t) => {
      const extra = mapFinish.get(t.id);
      return { ...t, ...(extra ?? {}) };
    });

    merged.sort((a, b) => {
      const oiA = a.orderIndex ?? 0;
      const oiB = b.orderIndex ?? 0;
      if (oiA !== oiB) return oiA - oiB;
      const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ca - cb;
    });

    return merged;
  }, [topics, topicsWithFinish]);

  const highestCompletedIdx = useMemo(() => {
    if (!currentUser?.id) return -1;

    let last = -1;
    for (let i = 0; i < mergedTopics.length; i++) {
      const t = mergedTopics[i];
      const done = t.studentFinish?.includes(currentUser.id) ?? false;
      if (done) last = i;
    }
    return last;
  }, [mergedTopics, currentUser?.id]);

  const isTopicUnlocked = (index: number) => {
    return index <= highestCompletedIdx + 1;
  };

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

          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              type="primary"
              danger
              onClick={handleEnrollRequest}
              disabled={!!myProgress}
              style={{ borderRadius: "8px" }}
            >
              Enroll Course
            </Button>

            {myProgress?.status === 3 && (
              <Button
                type="default"
                onClick={async () => {
                  try {
                    const res =
                      await CertificateService.certificateByCourseAndAccount(
                        id ?? ""
                      );
                    window.open(res.fileUrl, "_blank");
                  } catch (error) {
                    console.error(error);
                    toast.error("Your Certificate not found.");
                  }
                }}
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
          <strong style={{ color: "black" }}>
            {courseDetail?.instructorFullName}
          </strong>
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
          <CourseReviewForm />
          <ReviewCardList />
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
                  dataSource={mergedTopics}
                  renderItem={(item: TopicWithFinish, index: number) => {
                    const unlocked = isTopicUnlocked(index);

                    const handleClick = () => {
                      if (unlocked) {
                        navigate(`/topic-detail/${item.id}`);
                      }
                    };

                    return (
                      <List.Item
                        onClick={handleClick}
                        style={{
                          padding: "12px 8px",
                          borderBottom: "1px solid #eee",
                          cursor: unlocked ? "pointer" : "not-allowed",
                          opacity: unlocked ? 1 : 0.55,
                          userSelect: "none",
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            unlocked ? (
                              <PlayCircleOutlined
                                style={{ fontSize: 20, color: "#1890ff" }}
                              />
                            ) : (
                              <Tooltip title="Hoàn thành topic trước để mở">
                                <LockOutlined style={{ fontSize: 20 }} />
                              </Tooltip>
                            )
                          }
                          title={`${(index + 1).toString().padStart(2, "0")}. ${
                            item.topicName
                          }`}
                          description={item.description}
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </>
          )}
        </Col>

        <Modal
          open={isModalVisible}
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
