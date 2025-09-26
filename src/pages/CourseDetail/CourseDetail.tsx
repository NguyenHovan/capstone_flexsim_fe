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
      if (!id) return toast.error("Không tải được dữ liệu.");
      const res = await CourseService.getCourseById(id);
      setCourseDetail(res);
    } catch (error) {
      console.log({ error });
      toast.error("Không tải được dữ liệu khóa học.");
    }
  };

  const fetchTopicByCourse = async () => {
    try {
      if (!id) return toast.error("Không tải được dữ liệu.");
      const res = await TopicService.getTopicByCourse(id);
      setTopics(res || []);
    } catch (error) {
      console.log({ error });
      setTopics([]);
      toast.error("Không tải được danh sách chủ đề.");
    }
  };

  const fetchLessonsByTopic = async () => {
    try {
      if (!selectedTopic?.id) return;
      const response = await LessonService.getLessonByTopic(selectedTopic.id);
      setLessons(response || []);
    } catch (error) {
      console.error("Tải bài học thất bại", error);
      setLessons([]);
      toast.error("Không tải được danh sách bài học.");
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
      return toast.error("Không tải được dữ liệu.");
    try {
      const res = await EnrollmentRequestService.enrollmentRequest({
        studentId: currentUser.id,
        courseId: courseDetail.id,
      });
      // res.message có thể là tiếng Anh; ta vẫn hiển thị nếu backend trả về. 
      toast.success(res?.message || "Gửi yêu cầu đăng ký thành công.");
    } catch {
      toast.error("Bạn đã gửi yêu cầu hoặc đang học khóa này.");
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

  const isTopicUnlocked = (index: number) => index <= highestCompletedIdx + 1;

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
          alt="Ảnh khóa học"
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
              Đăng ký khóa học
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
                    toast.error("Không tìm thấy chứng chỉ.");
                  }
                }}
                style={{
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #36d1dc, #5b86e5)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Xem chứng chỉ
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
          <div style={{ fontSize: 12, color: "#888" }}>Giảng viên phụ trách</div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <div style={{ marginBottom: 16 }}>
            <Tag color="green">Tổng quan</Tag>
            <Tag color="purple">Giảng viên</Tag>
            <Tag color="orange">Câu hỏi thường gặp</Tag>
            <Tag color="gold">Đánh giá</Tag>
          </div>

          <h3>Giới thiệu về khóa học</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            {courseDetail?.description || "Chưa có mô tả."}
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
                <h4 style={{ marginBottom: 16 }}>Tiến độ học tập</h4>
                {myProgress && <CourseProgress data={myProgress} />}
              </Card>

              <Card
                title="Chủ đề / Bài học"
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
                              <Tooltip title="Hoàn thành chủ đề trước để mở">
                                <LockOutlined style={{ fontSize: 20 }} />
                              </Tooltip>
                            )
                          }
                          title={`${(index + 1)
                            .toString()
                            .padStart(2, "0")}. ${item.topicName}`}
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
          title={selectedTopic?.topicName || "Chi tiết chủ đề"}
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
                  header={<strong>Danh sách bài học</strong>}
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
                          title={`${(index + 1)
                            .toString()
                            .padStart(2, "0")}. ${lesson.lessonName}`}
                          description={lesson.description}
                        />
                        <Button
                          style={{ marginTop: 24, width: 120 }}
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Học ngay
                        </Button>
                      </Flex>
                    </List.Item>
                  )}
                />
              )}

              {(!lessons || lessons.length === 0) && (
                <p>Chưa có bài học.</p>
              )}
            </div>
          )}
        </Modal>
      </Row>
    </div>
  );
};

export default CourseDetail;
