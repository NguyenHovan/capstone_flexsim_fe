import { Link } from "react-router-dom";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      {/* Main grid layout */}
      <div className="custom-footer">
        <div className="footer-col logo-section">
          <div className="logo">
            <span className="logo-orange">LOGISIM</span>
            <span className="logo-teal">EDU</span>
          </div>
          <p>
            Learn logistics the smart way. <br />
            Simulate, practice, and master real- <br />
            world supply chain systems.
          </p>
          <div className="contact-info">
            <p>
              <EnvironmentOutlined /> 268 Lý Thường Kiệt, HCM
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
          <h4>Platform</h4>
          <ul>
            <li>
              <Link to="#">Courses</Link>
            </li>
            <li>
              <Link to="#">Scenarios</Link>
            </li>
            <li>
              <Link to="#">Pricing</Link>
            </li>
            <li>
              <Link to="#">Try a Demo</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li>
              <Link to="#">Help Center</Link>
            </li>
            <li>
              <Link to="#">FAQs</Link>
            </li>
            <li>
              <Link to="#">Contact Support</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Partners</h4>
          <ul>
            <li>
              <Link to="#">Institutions</Link>
            </li>
            <li>
              <Link to="#">Become a Partner</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <p>© 2025 LOGISIM EDU. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
