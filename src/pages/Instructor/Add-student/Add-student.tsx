import { Row, Col, Card, List, Button, Avatar, Flex, Typography, Empty } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { EnrollmentRequestService } from "../../../services/enrollment-request.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const { Title } = Typography;

const AddStudentPage = () => {
  const navigate = useNavigate();
  const { id, courseId } = useParams();

  const [studentEnroll, setStudentEnroll] = useState<any[]>([]);
  const [studentEnrollCourse, setStudentEnrollCourse] = useState<any[]>([]);
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchStudentsEnroll = async () => {
    try {
      setLoadingClass(true);
      const response = await EnrollmentRequestService.getStudentsEnrollClass(id ?? "");
      setStudentEnroll(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(error);
      setStudentEnroll([]);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchStudentsEnrollClassCourse = async () => {
    try {
      setLoadingEnroll(true);
      const response = await EnrollmentRequestService.getStudentsEnrollClassCourse(courseId ?? "");
      setStudentEnrollCourse(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(error);
      setStudentEnrollCourse([]);
    } finally {
      setLoadingEnroll(false);
    }
  };

  const handleJoinClass = async (studentId: string) => {
    try {
      if (!id) return;
      setAssigningId(studentId);
      await EnrollmentRequestService.assignStudentToClass(studentId, id);
      await Promise.all([fetchStudentsEnroll(), fetchStudentsEnrollClassCourse()]);
      toast.success("Thêm học viên vào lớp thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thêm học viên vào lớp thất bại");
    } finally {
      setAssigningId(null);
    }
  };

  useEffect(() => {
    fetchStudentsEnroll();
    fetchStudentsEnrollClassCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, courseId]);

  return (
    <div style={{ padding: 20 }}>
      <Button onClick={() => navigate(-1)}>Quay lại</Button>

      <Title level={3} style={{ marginTop: 12, color: "#000" }}>
        Thêm học viên vào lớp
      </Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Trong lớp" bordered loading={loadingClass}>
            {studentEnroll.length === 0 ? (
              <Empty description="Chưa có học viên trong lớp" />
            ) : (
              <List
                dataSource={studentEnroll}
                renderItem={(student: any) => (
                  <List.Item key={student?.id || student?.email}>
                    <Flex align="center" gap={16}>
                      <Avatar
                        size={56}
                        src={
                          student?.avtUrl ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU7ukgfgh3h397fTWEGFf9ZtmU7jY6wbDY1Q&s"
                        }
                        alt={student?.fullName || "avatar"}
                      />
                      <span style={{ fontSize: 16 }}>
                        {student?.fullName} — {student?.email}
                      </span>
                    </Flex>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Yêu cầu ghi danh" bordered loading={loadingEnroll}>
            {studentEnrollCourse.length === 0 ? (
              <Empty description="Không có yêu cầu ghi danh nào" />
            ) : (
              <List
                dataSource={studentEnrollCourse}
                renderItem={(student: any) => (
                  <List.Item
                    key={student?.id}
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleJoinClass(student.id)}
                        loading={assigningId === student.id}
                        disabled={assigningId === student.id}
                      >
                        Thêm vào lớp
                      </Button>,
                    ]}
                  >
                    {student?.account?.fullName || student?.fullName || "Không rõ tên"}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddStudentPage;
