import { Input, Avatar } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="custom-header">
      <div className="logo">
        <span className="logo-orange">LOGISIM</span>
        <span className="logo-teal">EDU</span>
      </div>
      <div className="search-box">
        <Input
          placeholder="Search courses"
          prefix={<SearchOutlined />}
          className="search-input"
        />
      </div>
      <nav className="nav-links">
        <Link to="#">Home</Link>
        <Link to="#">Courses</Link>
        <Link to="#">About</Link>
        <Link to="#">Contact</Link>
      </nav>
      <div className="avatar-section">
        <Avatar icon={<UserAddOutlined />} onClick={() => navigate("/login")} />
      </div>
    </header>
  );
};

export default Header;
