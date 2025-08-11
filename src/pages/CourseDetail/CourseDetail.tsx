import { Card, Button, Row, Col, Rate, List, Avatar, Tag } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { CourseService } from "../../services/course.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Course } from "../../types/course";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";
import { LessonService } from "../../services/lesson.service";

const CourseDetail = () => {
  const { id } = useParams();
  const [courseDetail, setCourseDetail] = useState<Course>();
  const [lessons, setLessons] = useState([]);
  const fetchCourseDetail = async () => {
    try {
      if (!id) {
        return toast.error("Lỗi tải dữ liệu");
      }
      const res = await CourseService.getCourseById(id);
      setCourseDetail(res);
    } catch (error) {
      console.log({ error });
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await LessonService.getAllLessons();
      setLessons(response);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);
  const handleErollRequest = async () => {
    const data = localStorage.getItem("currentUser");
    const user = data ? JSON.parse(data) : null;
    if (!courseDetail) {
      return toast.error("Lỗi tải dữ liệu");
    }
    try {
      const res = await EnrollmentRequestService.enrollmentRequest({
        studentId: user?.id,
        courseId: courseDetail?.id,
      });
      toast.success(res.message);
    } catch {
      toast.error("Học viên đã gửi yêu cầu hoặc đang theo học khóa học này");
    }
  };
  useEffect(() => {
    fetchCourseDetail();
  }, []);
  return (
    <div style={{ padding: 24 }} className="container">
      <Card
        bodyStyle={{
          padding: 24,
          display: "flex",
          alignItems: "center",
          background: "#e0e0e0",
        }}
      >
        <img
          src={courseDetail?.imgUrl}
          alt="Thumbnail"
          style={{
            width: 150,
            height: 150,
            objectFit: "contain",
            marginRight: 24,
          }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{courseDetail?.courseName}</h2>
          <Rate
            value={Number(courseDetail?.ratingAverage)}
            disabled
            style={{ margin: "8px 0" }}
          />

          <div>{courseDetail?.createdAt}</div>
          <Button
            type="primary"
            danger
            style={{ marginTop: 10 }}
            onClick={() => handleErollRequest()}
          >
            Enroll courses
          </Button>
        </div>
      </Card>

      <div
        style={{
          margin: "24px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Avatar src="https://cdn-icons-png.flaticon.com/512/706/706830.png" />
        <span>
          <strong>Instructor A</strong>
        </span>
      </div>

      <Row gutter={24}>
        <Col xs={24} md={14} style={{ color: "black" }}>
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">Tags</Tag>
            <Tag color="green">Overview</Tag>
            <Tag>Author</Tag>
            <Tag>FAQs</Tag>
            <Tag>Announcement</Tag>
            <Tag>Review</Tag>
          </div>

          <h3>About the course</h3>
          <p>{courseDetail?.description}</p>
        </Col>

        <Col xs={24} md={10}>
          <h3>Nội dung sẽ tương tự ảnh</h3>
          <List
            itemLayout="horizontal"
            dataSource={lessons}
            renderItem={(item: any, index: number) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<PlayCircleOutlined style={{ fontSize: 20 }} />}
                  title={`${(index + 1).toString().padStart(2, "0")}. ${
                    item.title
                  }`}
                  description={
                    <span style={{ color: "#888" }}>{item.description}</span>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetail;
