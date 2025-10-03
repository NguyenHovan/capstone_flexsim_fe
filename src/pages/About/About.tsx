import React from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Timeline,
  Divider,
  Button,
  Space,
  Badge,
} from "antd";
import {
  CompassOutlined,
  ExperimentOutlined,
  SolutionOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  BookOutlined,
  CloudServerOutlined,
  SmileOutlined,
  BarChartOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./about.css";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text, Link } = Typography;

const DEMO_URL = "https://www.youtube.com/watch?v=YJgJzyDHZ8o";

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tags?: string[];
};

const missionBullets: string[] = [
  "Đưa đào tạo logistics thực hành đến gần hơn, chi phí hợp lý cho trường học và doanh nghiệp.",
  "Kết nối lý thuyết lớp học với vận hành thực tiễn qua học tập theo kịch bản.",
  "Xây dựng kỹ năng về kho bãi, vận tải và tối ưu chuỗi cung ứng.",
];

const features: Feature[] = [
  {
    icon: <ExperimentOutlined />,
    title: "Thư viện mô phỏng linh hoạt",
    desc: "Các bối cảnh FlexSim tuỳ chỉnh: kho bãi, cảng, cross-dock, nhà máy và hơn thế nữa.",
    tags: ["3D/2D", "Kéo-thả", "Kịch bản"],
  },
  {
    icon: <SolutionOutlined />,
    title: "Khoá học, chủ đề & đánh giá",
    desc: "Thiết kế khoá học gắn với bối cảnh. Thêm phòng lab tương tác, quiz chấm tự động và rubric.",
    tags: ["LMS", "Quiz", "Rubric"],
  },
  {
    icon: <CloudServerOutlined />,
    title: "Triển khai linh hoạt",
    desc: "Cloud hoặc on-prem. Hỗ trợ SSO + tích hợp LMS/SIS qua API an toàn.",
    tags: ["Cloud", "On-prem", "SSO"],
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Phân tích & theo dõi",
    desc: "Log, điểm số theo thời gian gần thực, dashboard cho giảng viên và quản trị tổ chức.",
    tags: ["Analytics", "Realtime"],
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Hiệu năng & mở rộng",
    desc: "Vận hành lớp học lớn và kịch bản nặng nhờ tài nguyên co giãn.",
    tags: ["Scalable", "High-perf"],
  },
  {
    icon: <CustomerServiceOutlined />,
    title: "Nội dung & hỗ trợ bản địa hoá",
    desc: "Phù hợp chương trình VN & quốc tế; hỗ trợ kỹ thuật/học thuật tận tâm.",
    tags: ["Localized", "Support"],
  },
];

const audiences: Feature[] = [
  {
    icon: <BookOutlined />,
    title: "Đại học & Cao đẳng",
    desc: "Các chương trình logistics, kinh doanh, CN công nghiệp cần phòng lab mô phỏng thực hành.",
  },
  {
    icon: <TeamOutlined />,
    title: "Doanh nghiệp",
    desc: "Onboarding & nâng cao kỹ năng kho bãi, vận tải trong kịch bản ảo an toàn.",
  },
  {
    icon: <CompassOutlined />,
    title: "Trung tâm đào tạo",
    desc: "Khoá ngắn hạn & chứng chỉ dựa trên học tập theo kịch bản.",
  },
];

const reasons: Feature[] = [
  {
    icon: <SmileOutlined />,
    title: "Thân thiện người mới",
    desc: "Giao diện trực quan, kịch bản dựng sẵn giúp bắt đầu mô phỏng trong vài phút.",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Kết quả đo lường được",
    desc: "Mọi thao tác được ghi nhận và chấm điểm minh bạch, khách quan.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Tác động thực tiễn",
    desc: "Thử layout, chiến lược picking, quy mô đội xe, quy trình… trước khi đầu tư thật.",
  },
];

const Stat: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="about-stat">
    <div className="about-stat__icon">{icon}</div>
    <div>
      <div className="about-stat__value">{value}</div>
      <div className="about-stat__label">{label}</div>
    </div>
  </div>
);

const AboutLogisimEdu: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/course-list");
    } else {
      toast.info("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
    }
  };

  const handleExplore = () => {
    const token = localStorage.getItem("accessToken");
    navigate(token ? "/course-list" : "/login");
    if (!token) toast.info("Vui lòng đăng nhập để tiếp tục");
  };

  return (
    <Layout className="about-layout" aria-label="Giới thiệu LogiSimEdu">
      <Header className="about-hero" role="banner">
        <div className="about-hero__bg" />
        <div className="about-hero__glow" />
        <div className="about-hero__content glass">
          <Badge.Ribbon text="Nền tảng FlexSim" color="cyan">
            <div>
              <Title
                level={1}
                className="about-hero__title gradient-text"
                style={{ color: "white" }}
              >
                LogiSimEdu
              </Title>
              <Paragraph className="about-hero__subtitle">
                Nền tảng đào tạo logistics với{" "}
                <b>kịch bản tương tác dựa trên FlexSim</b>.
              </Paragraph>
              <Space size="middle" wrap>
                <Button type="primary" size="large" className="btn-shadow" onClick={handleStart}>
                  Bắt đầu dùng thử
                </Button>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="large" className="btn-ghost">Xem Demo</Button>
                </a>
              </Space>
            </div>
          </Badge.Ribbon>

          <div className="about-stats">
            <Stat icon={<TeamOutlined />} value="10k+" label="Học viên" />
            <Stat icon={<DeploymentUnitOutlined />} value="250+" label="Workspace" />
            <Stat icon={<BarChartOutlined />} value="400+" label="Kịch bản" />
          </div>
        </div>
      </Header>

      <Content className="about-content">
        {/* SỨ MỆNH */}
        <section className="about-section">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2}>Sứ mệnh của chúng tôi</Title>
              <Paragraph type="secondary">
                LogiSimEdu giúp tổ chức và người học “học qua thực hành”
                bằng mô phỏng cho nghiệp vụ kho bãi và chuỗi cung ứng.
              </Paragraph>
              <ul className="about-bullets" aria-label="Điểm nhấn sứ mệnh">
                {missionBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <Space size={[8, 8]} wrap>
                <Tag color="blue">#LogisticsSimulation</Tag>
                <Tag color="geekblue">#SkillBased</Tag>
                <Tag color="cyan">#DataDriven</Tag>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Card
                className="about-illustration gradient-border"
                bodyStyle={{ display: "none" }}
                cover={<div className="about-hero__image" aria-hidden="true" />}
              />
            </Col>
          </Row>
        </section>

        <Divider className="decor-divider" />

        {/* CHÚNG TÔI CUNG CẤP */}
        <section className="about-section">
          <Title level={2} className="section-title">
            Chúng tôi cung cấp
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((f, idx) => (
              <Col key={idx} xs={24} sm={12} lg={8}>
                <Card className="about-card lift glow-on-hover" hoverable>
                  <div className="about-card__icon pulse">{f.icon}</div>
                  <Title level={4} className="about-card__title">
                    {f.title}
                  </Title>
                  <Paragraph className="about-card__desc">{f.desc}</Paragraph>
                  {f.tags && (
                    <Space size={[6, 6]} wrap>
                      {f.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </Space>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="decor-divider" />

        {/* AI SỬ DỤNG LOGISIMEDU? */}
        <section className="about-section">
          <Row gutter={[24, 24]} align="top">
            <Col xs={24} md={10}>
              <Title level={2}>Ai sử dụng LogiSimEdu?</Title>
              <Paragraph>
                Nền tảng phục vụ giáo dục chính quy, đào tạo doanh nghiệp
                và các đơn vị phát triển nghề nghiệp.
              </Paragraph>
              <Timeline
                className="about-timeline"
                items={[
                  { color: "blue", children: "Thí điểm trong 2–4 tuần" },
                  { color: "green", children: "Tích hợp SSO/LMS an toàn" },
                  { color: "gray", children: "Mở rộng thư viện kịch bản phù hợp chương trình" },
                ]}
              />
            </Col>
            <Col xs={24} md={14}>
              <Row gutter={[24, 24]}>
                {audiences.map((a, i) => (
                  <Col key={i} xs={24} sm={12}>
                    <Card className="about-card about-card--soft lift" hoverable>
                      <div className="about-card__icon">{a.icon}</div>
                      <Title level={4} className="about-card__title">
                        {a.title}
                      </Title>
                      <Paragraph className="about-card__desc">
                        {a.desc}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </section>

        <Divider className="decor-divider" />

        {/* VÌ SAO CHỌN CHÚNG TÔI? */}
        <section className="about-section">
          <Title level={2} className="section-title">
            Vì sao chọn chúng tôi?
          </Title>
          <Row gutter={[24, 24]}>
            {reasons.map((r, i) => (
              <Col key={i} xs={24} md={8}>
                <Card className="about-card about-card--border lift" hoverable>
                  <div className="about-card__icon">{r.icon}</div>
                  <Title level={4} className="about-card__title">
                    {r.title}
                  </Title>
                  <Paragraph className="about-card__desc">{r.desc}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="about-cta glass" bordered={false}>
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Title level={3} style={{ marginBottom: 8 }}>
                  Sẵn sàng nâng tầm đào tạo logistics?
                </Title>
                <Text type="secondary">
                  Đặt lịch demo phù hợp và xem LogiSimEdu hoà hợp với chương trình đào tạo của bạn.
                </Text>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: "right" }}>
                <Space wrap>
                  <Button type="primary" size="large" className="btn-shadow" onClick={handleExplore}>
                    Khám phá khoá học
                  </Button>
                  <Button size="large" className="btn-ghost">
                    <Link href="mailto:contact@logisim.edu.vn">Gửi email</Link>
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </section>
      </Content>

      <Footer className="about-footer" />
    </Layout>
  );
};

export default AboutLogisimEdu;
