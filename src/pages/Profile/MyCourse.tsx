import { Card, Button, Row, Col, Empty } from "antd";
import { useEffect, useState } from "react";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";
import type { Course } from "../../types/course";
import { useNavigate } from "react-router-dom";

const MyCourse = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourse = async () => {
    try {
      const data = localStorage.getItem("currentUser");
      const user = data ? JSON.parse(data) : null;
      const res = await EnrollmentRequestService.enrollmentRequestStudent(
        user.id
      );
      setMyCourses(res?.data || []);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourse();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        My Courses
      </h2>

      {loading ? null : myCourses?.length > 0 ? (
        <Row gutter={[24, 24]}>
          {myCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                style={{ height: 350 }}
                onClick={() => navigate(`/course-detail/${course.id}`)}
                hoverable
                cover={
                  <img
                    alt={course.courseName}
                    src={course.imgUrl}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                }
              >
                <Card.Meta
                  title={course.courseName}
                  description={course.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="You haven't enrolled in any courses yet." />
      )}
    </div>
  );
};

export default MyCourse;
