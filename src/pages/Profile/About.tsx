import { Card, Avatar, Row, Col } from "antd";

const About = () => {
  const user = {
    avatar: "/avatar.png", // bạn thay bằng URL thật hoặc local trong public/
    fullName: "Nguyen Van A",
    email: "abc@gmail.com",
    phone: "0123456789",
    address: "123/5 .....",
    organization: "FPTU",
    gender: "Male",
    joinDate: "01/01/2025",
  };

  return (
    <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12 }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#e0e0e0",
          textAlign: "center",
          padding: "20px 0",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 500 }}>
          Welcom to LogiSimEdu, Ha Bie
        </div>
        <Avatar src={user.avatar} size={80} style={{ marginTop: 10 }} />
      </div>

      {/* Info */}
      <div style={{ padding: "24px 32px" }}>
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Address:</strong> {user.address}
            </p>
            <p>
              <strong>Organization:</strong> {user.organization}
            </p>
          </Col>

          <Col xs={24} md={12}>
            <p>
              <strong>Full name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Gender:</strong> {user.gender}
            </p>
            <p>
              <strong>Joinning Date:</strong> {user.joinDate}
            </p>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default About;
