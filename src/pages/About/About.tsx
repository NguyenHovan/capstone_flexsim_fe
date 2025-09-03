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
import "./about.css";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text, Link } = Typography;

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tags?: string[];
};

const missionBullets: string[] = [
  "Make hands-on logistics training accessible and affordable for schools and companies.",
  "Bridge classroom theory with real operations via scenario-based learning.",
  "Build practical skills in warehousing, transportation, and supply-chain optimization.",
];

const features: Feature[] = [
  {
    icon: <ExperimentOutlined />,
    title: "Flexible Simulation Library",
    desc: "Customizable FlexSim scenes: warehouses, ports, cross-docks, industrial sites, and more.",
    tags: ["3D/2D", "Drag-and-drop", "Scenarios"],
  },
  {
    icon: <SolutionOutlined />,
    title: "Courses, Topics & Assessments",
    desc: "Design courses linked to scenes. Add interactive labs, auto-graded quizzes, and rubrics.",
    tags: ["LMS", "Quiz", "Rubric"],
  },
  {
    icon: <CloudServerOutlined />,
    title: "Deploy Anywhere",
    desc: "Cloud or on-prem. Secure SSO + LMS/SIS integration through APIs.",
    tags: ["Cloud", "On-prem", "SSO"],
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Analytics & Tracking",
    desc: "Near real-time logs, scores, dashboards for instructors and org admins.",
    tags: ["Analytics", "Realtime"],
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Scalable & High Performance",
    desc: "Supports large classes and heavy scenarios with elastic resources.",
    tags: ["Scalable", "High-perf"],
  },
  {
    icon: <CustomerServiceOutlined />,
    title: "Localized Content & Support",
    desc: "Aligned with VN & international curricula; dedicated technical/academic support.",
    tags: ["Localized", "Support"],
  },
];

const audiences: Feature[] = [
  {
    icon: <BookOutlined />,
    title: "Universities & Colleges",
    desc: "Programs in logistics, business, and industrial engineering seeking practical simulation labs.",
  },
  {
    icon: <TeamOutlined />,
    title: "Enterprises",
    desc: "Onboarding and up-skilling for warehouse and transport operations in safe virtual scenarios.",
  },
  {
    icon: <CompassOutlined />,
    title: "Training Centers",
    desc: "Short courses and certificates powered by scenario-based learning.",
  },
];

const reasons: Feature[] = [
  {
    icon: <SmileOutlined />,
    title: "Beginner-Friendly",
    desc: "Intuitive UI and ready-made scenarios let newcomers build and run simulations in minutes.",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Measurable Outcomes",
    desc: "Actions are logged and scored for transparent, objective assessment.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Practical Impact",
    desc: "Test layouts, picking strategies, fleet sizing, and workflows before investing for real.",
  },
];

const Stat: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <div className="about-stat">
    <div className="about-stat__icon">{icon}</div>
    <div>
      <div className="about-stat__value">{value}</div>
      <div className="about-stat__label">{label}</div>
    </div>
  </div>
);

const AboutLogisimEdu: React.FC = () => {
  return (
    <Layout className="about-layout" aria-label="About LogiSimEdu">
      {/* HERO */}
      <Header className="about-hero" role="banner">
        <div className="about-hero__bg" />
        <div className="about-hero__glow" />
        <div className="about-hero__content glass">
          <Badge.Ribbon text="FlexSim-Powered" color="cyan">
            <div>
              <Title level={1} className="about-hero__title gradient-text">
                LogiSimEdu
              </Title>
              <Paragraph className="about-hero__subtitle">
                A Logistics Training Platform Using <b>FlexSim-Based Interactive Scenarios</b>.
              </Paragraph>
              <Space size="middle" wrap>
                <Button type="primary" size="large" className="btn-shadow">
                  Start Free Trial
                </Button>
                <Button size="large" className="btn-ghost">
                  Watch Demo
                </Button>
              </Space>
            </div>
          </Badge.Ribbon>

          <div className="about-stats">
            <Stat icon={<TeamOutlined />} value="10k+" label="Learners" />
            <Stat icon={<DeploymentUnitOutlined />} value="250+" label="Workspaces" />
            <Stat icon={<BarChartOutlined />} value="400+" label="Scenarios" />
          </div>
        </div>
      </Header>

      <Content className="about-content">
        {/* MISSION */}
        <section className="about-section">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2}>Our Mission</Title>
              <Paragraph type="secondary">
                LogiSimEdu enables organizations and learners to “learn by doing” with simulation-based training for
                warehousing and supply chain operations.
              </Paragraph>
              <ul className="about-bullets" aria-label="Mission highlights">
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

        {/* WHAT WE OFFER */}
        <section className="about-section">
          <Title level={2} className="section-title">
            What We Offer
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

        {/* WHO USES */}
        <section className="about-section">
          <Row gutter={[24, 24]} align="top">
            <Col xs={24} md={10}>
              <Title level={2}>Who Uses LogiSimEdu?</Title>
              <Paragraph>
                The platform serves formal education, enterprise training, and professional development providers.
              </Paragraph>
              <Timeline
                className="about-timeline"
                items={[
                  { color: "blue", children: "Pilot rollout in 2–4 weeks" },
                  { color: "green", children: "Secure SSO/LMS integration" },
                  { color: "gray", children: "Expand scenario library to fit your curriculum" },
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
                      <Paragraph className="about-card__desc">{a.desc}</Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </section>

        <Divider className="decor-divider" />

        {/* WHY CHOOSE US */}
        <section className="about-section">
          <Title level={2} className="section-title">Why Choose Us?</Title>
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
                  Ready to transform your logistics training?
                </Title>
                <Text type="secondary">
                  Book a personalized demo and see how LogiSimEdu fits your curriculum or operations.
                </Text>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: "right" }}>
                <Space wrap>
                  <Button type="primary" size="large" className="btn-shadow">
                    Talk to Us
                  </Button>
                  <Button size="large" className="btn-ghost">
                    <Link href="mailto:hello@logisimedu.example">Send Email</Link>
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </section>
      </Content>

      <Footer className="about-footer">
      </Footer>
    </Layout>
  );
};

export default AboutLogisimEdu;
