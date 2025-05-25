import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer">
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
    </footer>
  );
};

export default Footer;
