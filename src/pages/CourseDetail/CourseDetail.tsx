import { Card, Button, Row, Col, Rate, List, Avatar, Tag } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

const lessons = [
  { title: "Create first React project", duration: "43:58 min" },
  { title: "Create first React project", duration: "43:58 min" },
  { title: "Create first React project", duration: "43:58 min" },
  { title: "Create first React project", duration: "43:58 min" },
  { title: "Future of AI", duration: "04:28 min" },
  { title: "The evolution and key milestones", duration: "04:28 min" },
  { title: "Emerging AI technologies", duration: "04:28 min" },
  { title: "The impact of AI on society", duration: "04:28 min" },
];

const CourseDetail = () => {
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
          src="https://cdn-icons-png.flaticon.com/512/10349/10349437.png"
          alt="Thumbnail"
          style={{
            width: 150,
            height: 150,
            objectFit: "contain",
            marginRight: 24,
          }}
        />
        <div>
          <h2 style={{ margin: 0 }}>Quản lí điều phối vận tải</h2>
          <Rate defaultValue={4} disabled style={{ margin: "8px 0" }} />
          <div>Description!!!</div>
          <div>Category!!!!</div>
          <div>Last updated!!!</div>
          <Button type="primary" danger style={{ marginTop: 10 }}>
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
        <Col xs={24} md={14}>
          <img
            src="https://source.unsplash.com/random/800x400?robot"
            alt="Course"
            style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
          />

          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">Tags</Tag>
            <Tag color="green">Overview</Tag>
            <Tag>Author</Tag>
            <Tag>FAQs</Tag>
            <Tag>Announcement</Tag>
            <Tag>Review</Tag>
          </div>

          <h3>About the course</h3>
          <p>
            Artificial intelligence is rapidly transforming industries, shaping
            the way we work, communicate, and innovate. This course explores the
            latest advancements in AI, its impact on society, and what the
            future holds...
          </p>
        </Col>

        <Col xs={24} md={10}>
          <h3>Nội dung sẽ tương tự ảnh</h3>
          <List
            itemLayout="horizontal"
            dataSource={lessons}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<PlayCircleOutlined style={{ fontSize: 20 }} />}
                  title={`${(index + 1).toString().padStart(2, "0")}. ${
                    item.title
                  }`}
                  description={
                    <span style={{ color: "#888" }}>{item.duration}</span>
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
