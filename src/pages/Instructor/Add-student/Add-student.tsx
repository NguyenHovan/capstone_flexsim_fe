import { Row, Col, Card, List, Button } from "antd";
import { useNavigate } from "react-router-dom";

const studentsInClass = [
  { id: 1, name: "Nguyễn Văn A" },
  { id: 2, name: "Trần Thị B" },
];

const studentsWithoutClass = [
  { id: 3, name: "Lê Văn C" },
  { id: 4, name: "Phạm Thị D" },
];

const AddStudentPage = () => {
  const navigate = useNavigate();
  const handleJoinClass = (studentId: number) => {
    console.log("Join class:", studentId);
    // Gọi API thêm vào class
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button onClick={() => navigate(-1)}>Quay lại</Button>
      <h2 style={{ color: "black" }}>Add Student</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Class" bordered>
            <List
              dataSource={studentsInClass}
              renderItem={(student) => <List.Item>{student.name}</List.Item>}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Enroll Request" bordered>
            <List
              dataSource={studentsWithoutClass}
              renderItem={(student) => (
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
                  {student.name}
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
