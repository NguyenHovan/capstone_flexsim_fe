import { Row, Col, Card, Button, Tag, Modal, List, Avatar } from "antd";
import { useEffect, useState } from "react";
import { ClassService } from "../../services/class.service";
import { EnrollmentRequestService } from "../../services/enrollment-request.service";

const MyClass = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [currentClass, setCurrentClass] = useState<any>(null);

  const fetchData = async () => {
    try {
      const response = await ClassService.getClassByStudent();
      setClasses(response);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewClass = async (cls: any) => {
    try {
      setCurrentClass(cls);
      const res = await EnrollmentRequestService.getStudentsEnrollClass(cls.id);
      setStudents(res);
      setModalVisible(true);
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Lớp học của tôi
      </h2>
      <Row gutter={[24, 24]}>
        {classes.map((cls) => (
          <Col xs={24} sm={12} md={8} lg={6} key={cls.id}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s",
              }}
              cover={
                <img
                  alt={cls.course?.courseName}
                  src={cls.course?.imgUrl}
                  style={{ height: 180, objectFit: "cover" }}
                />
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Card.Meta
                title={
                  <div style={{ fontWeight: 600 }}>
                    {cls.className} - {cls.course?.courseName}
                  </div>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 14, color: "#555", minHeight: 40 }}>
                      {cls.course?.description || "Không có mô tả"}
                    </p>
                    <Tag color="blue">{cls.numberOfStudent} học viên</Tag>
                  </div>
                }
              />
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Button
                  style={{
                    background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
                    border: "none",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: "6px 20px",
                  }}
                  onClick={() => handleViewClass(cls)}
                >
                  Xem danh sách
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={currentClass ? `${currentClass.className} - Học viên` : "Học viên"}
        open={modalVisible} // nếu dùng AntD v4 thì đổi về `visible={modalVisible}`
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          itemLayout="horizontal"
          dataSource={students}
          renderItem={(student) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={student.avtUrl || undefined} />}
                title={student.fullName}
                description={student.email}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default MyClass;
