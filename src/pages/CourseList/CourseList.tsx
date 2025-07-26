import { Input, Tabs, Row, Col, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CourseCard from "../../components/courseCard/CourseCard";
import { CourseService } from "../../services/course.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      setDataSource(data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);
  console.log({ dataSource });
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
        {dataSource && dataSource.length > 0 ? (
          dataSource.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <CourseCard {...course} />
            </Col>
          ))
        ) : (
          <Col span={24} style={{ textAlign: "center", padding: "20px 0" }}>
            <Empty description="No courses" />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CourseList;
