import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Skeleton,
  Empty,
  Button,
  Typography,
  Input,
  message,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardService } from "../../../services/dashboard.service";

const { Title, Text } = Typography;

// ===== Types khớp API =====
interface PerCourse {
  courseId: string;
  courseName: string;
  studentCount: number;
}
interface PerClass {
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  studentCount: number;
}
interface DashboardResponse {
  totalCourses: number;
  totalClasses: number;
  totalStudentsDistinct: number;
  perCourse: PerCourse[];
  perClass: PerClass[];
  courseChart: { labels: string[]; data: number[] };
  classChart: { labels: string[]; data: number[] };
}

const toChartRows = (labels: string[] = [], data: number[] = []) =>
  labels.map((name, i) => ({ name, value: data[i] ?? 0 }));

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function cardStyle(accent: string): React.CSSProperties {
  return {
    borderRadius: 16,
    background: `linear-gradient(180deg, ${accent}18, #ffffff)`,
    boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
  };
}
const pillStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "0 8px",
  height: 24,
  display: "inline-flex",
  alignItems: "center",
};

export default function InstructorDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await DashboardService.getDashboardInstructor();

      setData(res);
    } catch (e) {
      console.error(e);
      message.error("Failed to load dashboard data (showing sample)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const courseRows = useMemo(() => {
    const rows = data?.perCourse ?? [];
    if (!q) return rows;
    return rows.filter((r) =>
      r.courseName.toLowerCase().includes(q.toLowerCase())
    );
  }, [data, q]);

  const classRows = useMemo(() => {
    const rows = data?.perClass ?? [];
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.className.toLowerCase().includes(q.toLowerCase()) ||
        r.courseName.toLowerCase().includes(q.toLowerCase())
    );
  }, [data, q]);

  const courseChartData = useMemo(
    () => toChartRows(data?.courseChart?.labels, data?.courseChart?.data),
    [data]
  );
  const classChartData = useMemo(
    () => toChartRows(data?.classChart?.labels, data?.classChart?.data),
    [data]
  );

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <span
              style={{
                background: "linear-gradient(90deg,#6366f1,#22c55e)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Instructor Dashboard
            </span>
          </Title>
          <Text type="secondary">Courses, Classes & Enrollment overview</Text>
        </Col>
        <Col>
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search course/class"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 260 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card style={cardStyle("#6366F1")}>
              <Space
                align="start"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Statistic
                  title="Total Courses"
                  value={data?.totalCourses ?? 0}
                  prefix={<BookOutlined />}
                />
                <Tag color="purple" style={pillStyle}>
                  Active
                </Tag>
              </Space>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={8}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card style={cardStyle("#22C55E")}>
              <Space
                align="start"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Statistic
                  title="Total Classes"
                  value={data?.totalClasses ?? 0}
                  prefix={<AppstoreOutlined />}
                />
                <Tag color="green" style={pillStyle}>
                  Live
                </Tag>
              </Space>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={8}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card style={cardStyle("#F59E0B")}>
              <Space
                align="start"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Statistic
                  title="Distinct Students"
                  value={data?.totalStudentsDistinct ?? 0}
                  prefix={<TeamOutlined />}
                />
                <Tag color="gold" style={pillStyle}>
                  Unique
                </Tag>
              </Space>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card
              title={
                <span>
                  <BarChartOutlined />
                  &nbsp;Students per Course
                </span>
              }
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : courseChartData.length ? (
                <div style={{ width: "100%", height: 360 }}>
                  <ResponsiveContainer>
                    <BarChart
                      layout="vertical"
                      data={courseChartData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={220}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip labelFormatter={(label) => label} />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Students"
                        fill="#6366F1"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty description="No course data" />
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={12}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card
              title={
                <span>
                  <BarChartOutlined />
                  &nbsp;Students per Class
                </span>
              }
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : classChartData.length ? (
                <div style={{ width: "100%", height: 360 }}>
                  <ResponsiveContainer>
                    <BarChart
                      layout="vertical"
                      data={classChartData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={220}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip labelFormatter={(label) => label} />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Students"
                        fill="#22C55E"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty description="No class data" />
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card title="Per Course">
              <Table
                size="middle"
                rowKey={(r) => r.courseId}
                dataSource={courseRows}
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: "Course",
                    dataIndex: "courseName",
                    key: "courseName",
                    render: (t: string) => (
                      <span style={{ fontWeight: 600 }}>{t}</span>
                    ),
                  },
                  {
                    title: "Students",
                    dataIndex: "studentCount",
                    key: "studentCount",
                    width: 120,
                    render: (v: number) => (
                      <Tag color={v > 0 ? "green" : "default"}>{v}</Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={12}>
          <motion.div initial={fadeUp.initial} animate={fadeUp.animate}>
            <Card title="Per Class">
              <Table
                size="middle"
                rowKey={(r) => r.classId}
                dataSource={classRows}
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: "Class",
                    dataIndex: "className",
                    key: "className",
                    render: (t: string) => (
                      <span style={{ fontWeight: 600 }}>{t}</span>
                    ),
                  },
                  {
                    title: "Course",
                    dataIndex: "courseName",
                    key: "courseName",
                    render: (t: string) => <Tag color="blue">{t}</Tag>,
                  },
                  {
                    title: "Students",
                    dataIndex: "studentCount",
                    key: "studentCount",
                    width: 120,
                    render: (v: number) => (
                      <Tag color={v > 0 ? "green" : "default"}>{v}</Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
