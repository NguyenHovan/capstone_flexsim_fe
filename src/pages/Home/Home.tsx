import { Button, Card, Col, Row, Tag, Carousel } from "antd";
import { Typography, message } from "antd"; // ✅ thêm message
import { motion } from "framer-motion";
import {
  ThunderboltFilled,
  SmileFilled,
  RocketFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; 
import imageRightHome from "../../assets/logisimedu.png";
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

const DEMO_URL = "https://www.youtube.com/watch?v=YJgJzyDHZ8o"; 

export default function HomePage() {
  const navigate = useNavigate(); 
const handleStartClick = () => {
    try {
      const raw = localStorage.getItem("currentUser");
      const u = raw ? JSON.parse(raw) : null;
      const isLoggedIn = !!(u && (u.id || u.accountId));

      if (isLoggedIn) {
        navigate("/course-list");
      } else {
        navigate("/login", { state: { toast: "Vui lòng đăng nhập" } });
      }
    } catch {
      navigate("/login", { state: { toast: "Vui lòng đăng nhập" } });
    }
  };

  return (
    <div className="home-wrapper" style={{ overflow: "hidden" }}>
      <section className="hero-section">
        <div className="hero-blob hero-blob--1" />
        <div className="hero-blob hero-blob--2" />

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <motion.div {...fadeUp}>
              <Tag
                color="#f59e0b"
                style={{ padding: "6px 12px", borderRadius: 999 }}
              >
                <RocketFilled /> &nbsp; Nền tảng FlexSim
              </Tag>
              <Title
                level={1}
                style={{ marginTop: 12, fontSize: 44, lineHeight: 1.2 }}
              >
                Thực hành{" "}
                <span className="text-gradient">FlexSim</span> thật dễ dàng
              </Title>
              <Paragraph
                className="description"
                style={{ fontSize: 16, color: "#4b5563" }}
              >
                Chào mừng đến với nền tảng học logistics tiên tiến và mô phỏng FlexSim để giúp giảng viên và học
                viên xây dựng mô hình chân thực một cách nhanh chóng và hiệu
                quả.
              </Paragraph>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button
                  type="primary"
                  size="large"
                  className="btn-gradient"
                  onClick={handleStartClick}  // ✅ dùng handler mới
                >
                  Bắt đầu
                </Button>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="large" icon={<PlayCircleFilled />}>
                    Xem demo
                  </Button>
                </a>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                <Tag color="blue">
                  <ThunderboltFilled /> Dựng mẫu nhanh
                </Tag>
                <Tag color="green">
                  <SmileFilled /> Thân thiện với sinh viên
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
                        alt={`ảnh-hero-${i + 1}`}
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
                  <img src={imageRightHome} alt="Trải nghiệm mô hình chân thực" />
                  <Text>Trải nghiệm mô hình chân thực</Text>
                </div>
                <div className="carousel-slide">
                  <img src={service} alt="Dịch vụ" />
                  <Text>Dịch vụ & đào tạo có thể mở rộng</Text>
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
                Tạo và tuỳ chỉnh kịch bản dễ dàng
              </Title>
              <Paragraph className="description">
                Xây dựng các kịch bản luyện tập logistics chân thực, cho phép thử nghiệm nhanh phù hợp cả môi
                trường giáo dục và doanh nghiệp.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {[
                  "Khối kéo-thả (no-code)",
                  "Luồng quy trình",
                  "Bộ thí nghiệm",
                  "Trực quan 3D",
                ].map((f, i) => (
                  <Col xs={12} key={i}>
                    <Card className="feature-card" bordered={false} hoverable>
                      <Title level={5} style={{ marginBottom: 8 }}>
                        {f}
                      </Title>
                      <Text type="secondary">
                        Lắp ghép và kiểm thử ý tưởng nhanh chóng.
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
              <img src={listedu} alt="danh sách bài học" className="secondary-image" />
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
                alt="Minh hoạ lý do lựa chọn"
                className="secondary-image"
              />
            </motion.div>
          </Col>
          <Col xs={24} md={12}>
            <motion.div {...fadeUp}>
              <Title className="sub-heading">Vì sao chọn dịch vụ của chúng tôi?</Title>
              <Paragraph className="description">
                Học qua thực hành và ứng dụng thực tế—được
                thiết kế cho cả sinh viên và giảng viên.
              </Paragraph>
              <Row gutter={[16, 16]}>
                {[
                  {
                    title: "Phòng lab tương tác",
                    img: logisedu_3,
                  },
                  {
                    title: "Đào tạo có hướng dẫn",
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
                            Nội dung cuốn hút, kết quả vượt trội.
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
            Người dùng nói gì
          </Title>
          <Paragraph
            style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}
          >
            Khám phá cách sinh viên và giảng viên nâng cao kiến thức logistics
            với các mô phỏng.
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
                    cover={<img alt="người dùng" src={user} className="avatar-img" />}
                  >
                    <Card.Meta
                      title="Minh Nguyen"
                      description={
                        <div>
                          <Text type="secondary">
                            Sinh viên Logistics, Đại học Đà Nẵng
                          </Text>
                          <div className="rating">★★★★★</div>
                          <Text>
                            Các mô phỏng giúp mình hiểu hệ thống thực tế
                            nhanh hơn và tự tin hơn.
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
                Sẵn sàng nâng tầm đào tạo logistics?
              </Title>
              <Paragraph>
                Tham gia cùng hàng nghìn người đang sử dụng FlexSim để
                thay đổi cách học và dạy logistics.
              </Paragraph>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button
                  type="primary"
                  size="large"
                  className="btn-gradient"
                  onClick={() => navigate("/course-list")} 
                >
                  Khám phá khoá học
                </Button>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="large" icon={<PlayCircleFilled />}>
                    Xem demo kịch bản
                  </Button>
                </a>
              </div>
            </motion.div>
          </Col>
        </Row>
      </section>
    </div>
  );
}
