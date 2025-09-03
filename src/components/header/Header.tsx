import { Avatar, Dropdown, Menu } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { AccountService } from "../../services/account.service";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 lấy pathname
  const { user, isLoggedIn } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  const fetchUserCurrent = async () => {
    if (user) {
      const response = await AccountService.getAccountById(user.id);
      setAvatar(response?.avtUrl || null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/login");
  };

  useEffect(() => {
    fetchUserCurrent();
  }, []);

  const menu = (
    <Menu
      style={{
        borderRadius: 10,
        padding: "8px 0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
        style={{ transition: "all 0.3s" }}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ transition: "all 0.3s" }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Menu links
  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Category", to: "/course-list" },
    { name: "AI Quiz", to: "/ai-quiz" },
    { name: "About", to: "/about" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(90deg, #059769, #feb47b)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          fontSize: 22,
          padding: "12px 32px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <span
          style={{
            color: "#fff",
            textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          LOGISIM
        </span>
        <span
          style={{
            color: "#222",
            background: "#fff",
            padding: "2px 8px",
            borderRadius: 6,
            marginLeft: 4,
            fontWeight: "bold",
          }}
        >
          EDU
        </span>
      </div>

      <nav style={{ display: "flex", gap: 68 }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: isActive ? "#222" : "#fff",
                fontSize: 20,
                fontWeight: isActive ? 700 : 500,
                background: isActive ? "rgba(255,255,255,0.7)" : "transparent",
                padding: "10px 10px",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.3s",
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Avatar / Login */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 32px",
        }}
      >
        {isLoggedIn ? (
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                src={avatar}
                style={{
                  backgroundColor: "#1890ff",
                  marginRight: 8,
                  border: "2px solid #fff",
                }}
              >
                {(!avatar && user?.userName?.[0]?.toUpperCase()) || "U"}
              </Avatar>
              <span style={{ color: "#fff", fontWeight: "500" }}>
                {user?.userName}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Avatar
            icon={<UserAddOutlined />}
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "#ff5722",
              cursor: "pointer",
              border: "2px solid #fff",
            }}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
