import { Input, Tabs, Row, Col, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CourseCard from "../../components/courseCard/CourseCard";
import { CourseService } from "../../services/course.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryService } from "../../services/category.service";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      setCategories(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);
  return (
    <Spin spinning={loading}>
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
            {categories?.map((cate) => (
              <TabPane tab={cate.categoryName} key={cate.id} />
            ))}
          </Tabs>
        </div>

        <Row gutter={[24, 24]}>
          {dataSource && dataSource.length > 0 ? (
            dataSource.map((course) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={course.id}
                onClick={() => navigate(`/course-detail/${course.id}`)}
              >
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
    </Spin>
  );
};

export default CourseList;
