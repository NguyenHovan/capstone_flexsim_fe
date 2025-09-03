import { Button, Card, Col, Row, Tag, Carousel } from "antd";
import { Typography } from "antd";
import { motion } from "framer-motion";
import {
  ThunderboltFilled,
  SmileFilled,
  RocketFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import imageRightHome from "../../assets/logisimedu.png";
import robot from "../../assets/robot.png";
import listedu from "../../assets/listedu.png";
import service from "../../assets/services.png";
import logisedu_3 from "../../assets/logisedu_3.png";
import training from "../../assets/training.png";
import user from "../../assets/user.png";
import "./home.css";

const { Title, Text, Paragraph } = Typography;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
};

const heroImages = [
  "https://www.flexsim.com/wp-content/uploads/sites/2/2019/02/automated-warehouse-decision-making.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8XLvC3ci62Gfp8KiiYNX21CgWJ39qc4BRVg&s",
  "https://developer-blogs.nvidia.com/wp-content/uploads/2023/11/manufacturing-conveyor-boxes2.png",
];

export default function HomePage() {
  return (
    <div className="home-wrapper" style={{ overflow: "hidden" }}>
      <section className="hero-section">
        {/* background blobs */}
        <div className="hero-blob hero-blob--1" />
        <div className="hero-blob hero-blob--2" />

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <motion.div {...fadeUp}>
              <Tag
                color="#f59e0b"
                style={{ padding: "6px 12px", borderRadius: 999 }}
              >
                <RocketFilled /> &nbsp; FlexSim + AI Platform
              </Tag>
              <Title
                level={1}
                style={{ marginTop: 12, fontSize: 44, lineHeight: 1.2 }}
              >
                Effortless Practice with{" "}
                <span className="text-gradient">FlexSim</span>
              </Title>
              <Paragraph
                className="description"
                style={{ fontSize: 16, color: "#4b5563" }}
              >
                Welcome to the most advanced logistics learning
                platform—combining artificial intelligence (AI) and FlexSim
                simulation to help educators and students build realistic models
                quickly and efficiently.
              </Paragraph>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button type="primary" size="large" className="btn-gradient">
                  Get Started
                </Button>
                <Button size="large" icon={<PlayCircleFilled />}>
                  Watch Demo
                </Button>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <Tag color="blue">
                  <ThunderboltFilled /> Fast Prototyping
                </Tag>
                <Tag color="green">
                  <SmileFilled /> Student Friendly
                </Tag>
              </div>
            </motion.div>
          </Col>

          <Col xs={24} md={10}>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Card className="hero-card" bordered={false} hoverable>
                <Carousel autoplay effect="fade" autoplaySpeed={4000} dots>
                  {heroImages.map((src, i) => (
                    <div key={i}>
                      <motion.img
                        src={src}
                        alt={`hero-${i + 1}`}
                        style={{
                          width: "100%",
                          height: 320,
                          objectFit: "cover",
                          display: "block",
                        }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  ))}
                </Carousel>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <motion.div {...fadeIn}>
              <Carousel autoplay dots className="hero-carousel">
                <div className="carousel-slide">
                  <img src={imageRightHome} alt="Experience realistic models" />
                  <Text>Experience realistic models</Text>
                </div>
                <div className="carousel-slide">
                  <img src={robot} alt="AI Support Illustration" />
                  <Text>AI-assisted scenario building</Text>
                </div>
                <div className="carousel-slide">
                  <img src={service} alt="Services" />
                  <Text>Services & training that scale</Text>
                </div>
              </Carousel>
            </motion.div>
          </Col>
        </Row>
      </section>

      <section className="section-spacing">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <motion.div {...fadeUp}>
              <Title style={{ fontSize: 32 }}>
                Easily create and customize scenarios
              </Title>
              <Paragraph className="description">
                Build realistic, customizable logistics practice scenarios with
                AI support, enabling rapid experimentation tailored for
                education and industry.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {[
                  "No-code Blocks",
                  "Process Flow",
                  "Experimenter",
                  "3D Visualization",
                ].map((f, i) => (
                  <Col xs={12} key={i}>
                    <Card className="feature-card" bordered={false} hoverable>
                      <Title level={5} style={{ marginBottom: 8 }}>
                        {f}
                      </Title>
                      <Text type="secondary">
                        Quickly assemble and test your ideas.
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </Col>
          <Col xs={24} md={12}>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={listedu} alt="listedu" className="secondary-image" />
            </motion.div>
          </Col>
        </Row>
      </section>

      <section className="section-spacing">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={service}
                alt="Why Choose Illustration"
                className="secondary-image"
              />
            </motion.div>
          </Col>
          <Col xs={24} md={12}>
            <motion.div {...fadeUp}>
              <Title className="sub-heading">Why Choose Our Services?</Title>
              <Paragraph className="description">
                Hands-on learning, AI-powered customization, and real-world
                application designed for both students and educators.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {[
                  {
                    title: "Interactive Labs",
                    img: logisedu_3,
                  },
                  {
                    title: "Guided Training",
                    img: training,
                  },
                ].map((item, idx) => (
                  <Col xs={24} sm={12} key={idx}>
                    <Card
                      hoverable
                      className="mini-card"
                      cover={<img alt={item.title} src={item.img} />}
                    >
                      <Card.Meta
                        title={item.title}
                        description={
                          <Text type="secondary">
                            Engaging content, better outcomes.
                          </Text>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </Col>
        </Row>
      </section>

      <section className="testimonials-section section-spacing">
        <motion.div {...fadeIn}>
          <Title level={2} style={{ textAlign: "center" }}>
            What Our Users Say
          </Title>
          <Paragraph
            style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}
          >
            Discover how students and educators enhance their logistics
            knowledge with AI-powered simulations.
          </Paragraph>
        </motion.div>

        <Row
          gutter={[16, 16]}
          className="testimonials"
          style={{ marginTop: 16 }}
        >
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <motion.div {...fadeUp}>
                  <Card
                    hoverable
                    className="testimonial-card"
                    cover={<img alt="user" src={user} className="avatar-img" />}
                  >
                    <Card.Meta
                      title="Minh Nguyen"
                      description={
                        <div>
                          <Text type="secondary">
                            Logistics Student, University of Danang
                          </Text>
                          <div className="rating">★★★★★</div>
                          <Text>
                            AI-generated simulations helped me understand
                            real-world systems faster and with confidence.
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </motion.div>
              </Col>
            ))}
        </Row>
      </section>

      <section className="cta-section">
        <Row align="middle" gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <motion.div {...fadeUp}>
              <Title level={2}>
                Ready to Level Up Your Logistics Training?
              </Title>
              <Paragraph>
                Join thousands using AI and FlexSim to transform how they learn
                and teach logistics.
              </Paragraph>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button type="primary" size="large" className="btn-gradient">
                  Explore Courses
                </Button>
                <Button size="large" icon={<PlayCircleFilled />}>
                  Watch a Scenario Demo
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>
      </section>
    </div>
  );
}
