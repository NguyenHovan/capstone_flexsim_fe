import { Row, Col, Card, Button } from "antd";

const MyClass = () => {
  const classes = [
    {
      id: 1,
      title: "Class 1",
      description: "Class description 1",
      image: "https://source.unsplash.com/random/400x200?react",
    },
    {
      id: 2,
      title: "Class 2",
      description: "Class description 2",
      image: "https://source.unsplash.com/random/400x200?javascript",
    },
    {
      id: 3,
      title: "Class 3",
      description: "Class description 3",
      image: "https://source.unsplash.com/random/400x200?design",
    },
    {
      id: 4,
      title: "Class 4",
      description: "Class description 4",
      image: "https://source.unsplash.com/random/400x200?code",
    },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        My Classes
      </h2>
      <Row gutter={[24, 24]}>
        {classes.map((course) => (
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

export default MyClass;
