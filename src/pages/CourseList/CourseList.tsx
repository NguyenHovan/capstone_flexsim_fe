import { Input, Tabs, Row, Col, Empty, Spin, Pagination } from "antd";
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
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      setAllCourses(data);
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
      setAllCourses(data);
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

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1); // reset về trang 1 khi search
    if (!value.trim()) {
      setDataSource(allCourses);
    } else {
      const filtered = allCourses.filter((course) =>
        course.courseName.toLowerCase().includes(value.toLowerCase())
      );
      setDataSource(filtered);
    }
  };

  const handleTabChange = (key: string) => {
    setSearchKeyword("");
    setCurrentPage(1);
    if (key === "all") {
      fetchCourses();
    } else {
      fetchCourseByCategory(key);
    }
  };

  // data hiển thị theo trang
  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
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

        <Row gutter={[48, 48]}>
          {paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((course) => (
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

        {dataSource.length > pageSize && (
          <div
            style={{
              display: "flex",
              textAlign: "center",
              marginTop: 24,
              justifyContent: "center",
            }}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={dataSource.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Spin>
  );
};

export default CourseList;
