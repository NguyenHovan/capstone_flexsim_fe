import { Row, Col, Card, List, Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { EnrollmentRequestService } from "../../../services/enrollment-request.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AddStudentPage = () => {
  const navigate = useNavigate();
  const { id, courseId } = useParams();
  const [studentEnroll, setStudentEnroll] = useState();
  const [studentEnrollCourse, setStudentEnrollCourse] = useState();
  const fetchStudentsEnroll = async () => {
    try {
      const response = await EnrollmentRequestService.getStudentsEnrollClass(
        id ?? ""
      );
      setStudentEnroll(response);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchStudentsEnrollClassCourse = async () => {
    try {
      const response =
        await EnrollmentRequestService.getStudentsEnrollClassCourse(
          courseId ?? ""
        );
      setStudentEnrollCourse(response);
    } catch (error) {
      console.log(error);
    }
  };
  const handleJoinClass = async (studentId: string) => {
    try {
      if (!id) {
        return;
      }
      await EnrollmentRequestService.assignStudentToClass(studentId, id);
      fetchStudentsEnroll();
      fetchStudentsEnrollClassCourse();
      toast.success("Thêm học sinh vào lớp thành công");
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Thêm học sinh vào lớp thất bại"
      );
    }
  };
  useEffect(() => {
    fetchStudentsEnroll();
    fetchStudentsEnrollClassCourse();
  }, []);
  return (
    <div style={{ padding: "20px" }}>
      <Button onClick={() => navigate(-1)}>Quay lại</Button>
      <h2 style={{ color: "black" }}>Add Student</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Class" bordered>
            <List
              dataSource={studentEnroll}
              renderItem={(student: any) => (
                <List.Item>{student?.fullName}</List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Enroll Request" bordered>
            <List
              dataSource={studentEnrollCourse}
              renderItem={(student: any) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleJoinClass(student.id)}
                    >
                      Add
                    </Button>,
                  ]}
                >
                  {student?.account?.fullName}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddStudentPage;
