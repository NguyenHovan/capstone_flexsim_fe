import { Input, Tabs, Row, Col, Empty, Spin, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CourseCard from "../../components/courseCard/CourseCard";
import { CourseService } from "../../services/course.service";
import { CategoryService } from "../../services/category.service";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

// Lấy orgId từ localStorage
function getStudentOrgIdFromStorage(): string | null {
  const rawOrgId = localStorage.getItem("orgId");
  if (rawOrgId) return rawOrgId;

  const rawUser = localStorage.getItem("currentUser");
  if (!rawUser) return null;
  try {
    const obj = JSON.parse(rawUser);
    return obj?.organizationId ?? obj?.organization?.id ?? null;
  } catch {
    return null;
  }
}

const CourseList = () => {
  const navigate = useNavigate();
  const studentOrgId = useMemo(getStudentOrgIdFromStorage, []);

  // ⚠️ Guest → toast + redirect
  useEffect(() => {
    if (!studentOrgId) {
      toast.error("Vui lòng đăng nhập để xem khóa học");
      setTimeout(() => navigate("/login", { replace: true }), 500);
    }
  }, [studentOrgId, navigate]);

  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // lọc theo org của student
  const filterByOrg = (courses: any[]) => {
    if (!studentOrgId) return [];
    return courses.filter(
      (c) => c?.instructor?.organizationId === studentOrgId
    );
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      const filtered = filterByOrg(data);
      setAllCourses(filtered);
      setDataSource(filtered);
    } catch {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      setCategories(response);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (studentOrgId) {
      fetchCourses();
      fetchCategories();
    }
  }, [studentOrgId]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    if (!value.trim()) {
      setDataSource(allCourses);
    } else {
      const kw = value.toLowerCase();
      const filtered = allCourses.filter((c) =>
        (c.courseName || "").toLowerCase().includes(kw)
      );
      setDataSource(filtered);
    }
  };

  const handleTabChange = (key: string) => {
    setSearchKeyword("");
    setCurrentPage(1);
    if (key === "all") {
      setDataSource(allCourses);
    } else {
      const filtered = allCourses.filter((c) => c.categoryId === key);
      setDataSource(filtered);
    }
  };

  // Nếu guest thì không render UI list
  if (!studentOrgId) return null;

  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Spin spinning={loading}>
      <div className="container">
        {/* Search + Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm khóa học"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ maxWidth: 300, background: "#f5eaea", borderRadius: 20 }}
            allowClear
          />
          <Tabs defaultActiveKey="all" style={{ flex: 1 }} onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="all" />
            {categories?.map((cate) => (
              <TabPane tab={cate.categoryName} key={cate.id} />
            ))}
          </Tabs>
        </div>

        {/* Courses */}
        <Row gutter={[48, 48]}>
          {paginatedData.length > 0 ? (
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
              <Empty description="Không có khóa học nào" />
            </Col>
          )}
        </Row>

        {/* Pagination */}
        {dataSource.length > pageSize && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
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
