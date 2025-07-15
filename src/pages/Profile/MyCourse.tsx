import { Card, Button, Row, Col } from "antd";

const courses = [
  {
    id: 1,
    title: "React for Beginners",
    description: "Learn the basics of React and build dynamic UIs.",
    image: "https://source.unsplash.com/random/400x200?react",
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Deep dive into closures, scopes, and prototypes.",
    image: "https://source.unsplash.com/random/400x200?javascript",
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    description: "Design better interfaces with usability in mind.",
    image: "https://source.unsplash.com/random/400x200?design",
  },
  {
    id: 4,
    title: "Data Structures in JS",
    description: "Master arrays, trees, and graphs with JavaScript.",
    image: "https://source.unsplash.com/random/400x200?code",
  },
];

const MyCourse = () => {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        My Courses
      </h2>
      <Row gutter={[24, 24]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={course.title}
                  src={course.image}
                  style={{ height: 160, objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={course.title}
                description={course.description}
              />
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <Button type="primary">View</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyCourse;
