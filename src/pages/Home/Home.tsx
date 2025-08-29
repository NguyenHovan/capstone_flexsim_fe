import { Button, Card, Col, Row } from "antd";
import "./home.css";
import imageLeftHome from "../../assets/left-home.png";
import imageRightHome from "../../assets/logisimedu.png";
import robot from "../../assets/robot.png";
import listedu from "../../assets/listedu.png";
import service from "../../assets/services.png";
import logisedu_3 from "../../assets/logisedu_3.png";
import training from "../../assets/training.png";
import user from "../../assets/user.png";
import { Typography } from "antd";
const { Title, Text } = Typography;
export default function HomePage() {
  return (
    <div className="container">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Typography style={{ fontSize: "32px" }}>
            Effortless Practice with FlexSim
          </Typography>
          <p className="description">
            Welcome to the most advanced logistics learning platform, combining
            artificial intelligence (AI) technology and FlexSim simulation,
            helping educators and students effortlessly build and practice
            realistic logistics models quickly and efficiently.
          </p>
          <Button type="primary" className="get-started-btn">
            Get Started
          </Button>

          <div>
            <img src={imageRightHome} alt="Experience" />
            <p>Experience realistic models</p>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <img
            src={imageLeftHome}
            alt="FlexSim Simulation"
            className="main-image"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="section-spacing">
        <Col xs={24} md={12}>
          <Typography style={{ fontSize: "32px" }}>
            Easily create and customize practice scenarios supported by Flexsim
          </Typography>
          <p className="description">
            Easily create realistic, customizable logistics practice scenarios
            with advanced AI support, enhancing practical skills and allowing
            effortless simulation and rapid experimentation tailored to
            educational and professional needs.
          </p>

          <div>
            <img src={listedu} alt="listedu" />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <img
            src={robot}
            alt="AI Support Illustration"
            className="main-image"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="section-spacing">
        <Col xs={24} md={12}>
          <Typography className="sub-heading">
            Why Choose Our Services?
          </Typography>
          <p className="description">
            Discover why our course stands out in logistics education. With a
            focus on hands-on experience, AI-powered customization, and
            real-world application, this program is designed for both students
            and educators. Whether you're a student or an educator, our course
            makes learning logistics smarter and more effective than ever.
          </p>

          <div>
            <img src={logisedu_3} alt="logisedu_3" />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <img
            src={service}
            alt="Why Choose Illustration"
            className="main-image"
          />
        </Col>
      </Row>

      <Row>
        <div className="testimonials-section">
          <Title level={2}>What Our Users Say</Title>
          <Text>
            Discover how students and educators are enhancing their logistics
            knowledge through FlexSim AI-powered simulations and hands-on
            practice with FlexSim.
          </Text>
          <Row gutter={[16, 16]} className="testimonials">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <Col key={index} xs={24} sm={12} md={6}>
                  <Card
                    cover={
                      <img alt="user" src={user} style={{ width: "50px" }} />
                    }
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
                            Learning logistics was never this engaging. The
                            AI-generated simulations helped me understand
                            real-world systems faster and with more confidence.
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
          </Row>
        </div>

        <div className="cta-section">
          <div>
            <Title level={2}>Ready to Level Up Your Logistics Training?</Title>
            <Text>
              Join thousands of educators and students using AI and FlexSim to
              transform the way they learn and teach logistics. Let's build
              smarter, faster, and more practical logistics skills—together.
            </Text>
            <div className="cta-buttons">
              <Button
                type="primary"
                size="large"
                style={{ background: "#f4a261", borderColor: "#f4a261" }}
              >
                Explore Courses
              </Button>
              <Button
                type="default"
                size="large"
                style={{ marginLeft: "16px" }}
              >
                Watch a Scenario Demo
              </Button>
            </div>
          </div>
          <div className="cta-image">
            <img src={training} alt="logistics training" />
          </div>
        </div>
      </Row>
    </div>
  );
}
