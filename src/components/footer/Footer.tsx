import { Link } from "react-router-dom";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./footer.css";

const DEMO_URL = "https://www.youtube.com/watch?v=YJgJzyDHZ8o";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      {/* Lưới chính */}
      <div className="custom-footer">
        <div className="footer-col logo-section">
          <div className="logo">
            <span className="logo-orange">LOGISIM</span>
            <span className="logo-teal">EDU</span>
          </div>
          <p>
            Học logistics một cách thông minh. <br />
            Mô phỏng, luyện tập và làm chủ các hệ thống <br />
            chuỗi cung ứng thực tế.
          </p>
          <div className="contact-info">
            <p>
              <EnvironmentOutlined /> 268 Lý Thường Kiệt, TP. Hồ Chí Minh
            </p>
            <p>
              <MailOutlined /> contact@logisim.edu.vn
            </p>
            <p>
              <PhoneOutlined /> +84 123 456 789
            </p>
          </div>
        </div>

        <div className="footer-col">
          <h4>Nền tảng</h4>
          <ul>
            <li>
              <Link to="/course-list">Khoá học</Link>
            </li>
            <li>
              <Link to="#">Kịch bản</Link>
            </li>
            <li>
              <Link to="#">Bảng giá</Link>
            </li>
            <li>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Xem Demo
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>
              <Link to="#">Trung tâm trợ giúp</Link>
            </li>
            <li>
              <Link to="#">Câu hỏi thường gặp</Link>
            </li>
            <li>
              <Link to="#">Liên hệ hỗ trợ</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Đối tác</h4>
          <ul>
            <li>
              <Link to="/login">Trở thành Giảng viên</Link>
            </li>
            <li>
              <Link to="/login">Trở thành Đối tác</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Chân dưới */}
      <div className="footer-bottom">
        <p>© 2025 LOGISIM EDU. Đã đăng ký mọi quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;
