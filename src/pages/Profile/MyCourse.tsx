import { Card, Button, Row, Col, Empty } from "antd";
import { useEffect, useState } from "react";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";
import type { Course } from "../../types/course";

const MyCourse = () => {
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
                hoverable
                cover={
                  <img
                    alt={course.courseName}
                    src={course.imgUrl}
                    style={{ height: 160, objectFit: "cover" }}
                  />
                }
              >
                <Card.Meta
                  title={course.courseName}
                  description={course.description}
                />
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <Button type="primary">View</Button>
                </div>
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
