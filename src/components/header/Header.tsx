import { Input, Avatar, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/login");
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

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
        <Link to="/">Home</Link>
        <Link to={"/course-list"}>Courses</Link>
        <Link to="#">About</Link>
        <Link to="#">Contact</Link>
      </nav>

      <div className="avatar-section">
        {isLoggedIn ? (
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar style={{ backgroundColor: "#1890ff", marginRight: 8 }}>
                {user?.userName?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <span style={{ color: "#fff" }}>{user?.userName}</span>
            </div>
          </Dropdown>
        ) : (
          <Avatar
            icon={<UserAddOutlined />}
            onClick={() => navigate("/login")}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
