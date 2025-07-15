import { Input, Tabs, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CourseCard from "../../components/courseCard/CourseCard";

const { TabPane } = Tabs;

const fakeCourses = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  title: "Khóa học A",
  organization: "FPTU",
  students: 40,
  lessons: 19,
  image: "https://source.unsplash.com/featured/400x200?ship",
}));

const CourseList = () => {
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search Course"
          style={{ maxWidth: 300, background: "#f5eaea", borderRadius: 20 }}
        />

        <Tabs defaultActiveKey="all" style={{ flex: 1 }}>
          <TabPane tab="All" key="all" />
          <TabPane tab="Category 1" key="1" />
          <TabPane tab="Category 2" key="2" />
          <TabPane tab="Category 3" key="3" />
          <TabPane tab="Category 4" key="4" />
        </Tabs>
      </div>

      <Row gutter={[24, 24]}>
        {fakeCourses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <CourseCard {...course} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CourseList;
