import { Input, Tabs, Row, Col, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CourseCard from "../../components/courseCard/CourseCard";
import { CourseService } from "../../services/course.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryService } from "../../services/category.service";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

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
  const fetchCourseByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await CourseService.getCourseByCategoryId(categoryId);
      setDataSource(data);
    } catch (error) {
      toast.error("Failed to fetch courses for category");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const handleTabChange = (key: string) => {
    if (key === "all") {
      fetchCourses();
    } else {
      fetchCourseByCategory(key);
    }
  };
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

          <Tabs
            defaultActiveKey="all"
            style={{ flex: 1 }}
            onChange={handleTabChange}
          >
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
