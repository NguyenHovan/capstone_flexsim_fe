import { Avatar, Dropdown, Button, Drawer } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { AccountService } from "../../services/account.service";
import "./header.css"; 

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchUserCurrent = async () => {
      if (!user?.id) return;
      const response = await AccountService.getAccountById(user.id);
      setAvatar(response?.avtUrl || null);
    };
    fetchUserCurrent();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const navLinks = [
    { name: "Trang chủ", to: "/" },
    { name: "Danh mục khóa học", to: "/course-list" },
    { name: "AI Quiz", to: "/ai-quiz" },
    { name: "Giới thiệu", to: "/about" },
    { name: "Flexsim Web", to: "/flexsim-web" },
  ];

  return (
    <header className="site-header">
      <button
        className="site-logo"
        onClick={() => navigate("/")}
        aria-label="Trang chủ"
      >
        <img
          src="https://res.cloudinary.com/dsfrqevvg/image/upload/v1756926674/d2477089b0b74afdaf66e73fe2c218f4-free_ewplwi.png"
          className="site-logo__img"
          alt="LOGISIM EDU logo"
        />
        <span className="site-logo__brand">
          <span className="site-logo__brand--white">LOGISIM</span>
          <span className="site-logo__brand-badge">EDU</span>
        </span>
      </button>

      <nav className="site-nav desktop-only" aria-label="Chính">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`site-nav__link ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="site-actions desktop-only">
        {isLoggedIn ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <button className="user-chip" aria-label="Tài khoản">
              <Avatar
                size={40}
                src={
                  avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : undefined
                }
                style={{ border: "2px solid #fff", background: "#fff" }}
              >
                {(!avatar && user?.userName?.[0]?.toUpperCase()) || "U"}
              </Avatar>
              <span className="user-chip__name">{user?.userName}</span>
            </button>
          </Dropdown>
        ) : (
          location.pathname !== "/login" && (
            <Button
              shape="round"
              size="large"
              ghost
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              className="login-btn"
              aria-label="Đăng nhập"
            >
              Đăng nhập
            </Button>
          )
        )}
      </div>

      <button
        className="mobile-menu-btn mobile-only"
        aria-label="Mở menu"
        onClick={() => setMobileOpen(true)}
      >
        <MenuOutlined />
      </button>

      <Drawer
        placement="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        className="site-drawer"
        title={
          <div className="drawer-head">
            <span>Menu</span>
          </div>
        }
      >
        <nav className="drawer-nav" aria-label="Menu di động">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="drawer-nav__item"
              onClick={() => setMobileOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="drawer-actions">
          {isLoggedIn ? (
            <>
              <button
                className="drawer-action"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/profile");
                }}
              >
                <UserOutlined /> &nbsp; Thông tin cá nhân
              </button>
              <button
                className="drawer-action danger"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                <LogoutOutlined /> &nbsp; Đăng xuất
              </button>
            </>
          ) : (
            location.pathname !== "/login" && (
              <button
                className="drawer-action primary"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                <LoginOutlined /> &nbsp; Đăng nhập
              </button>
            )
          )}
        </div>
      </Drawer>
    </header>
  );
};

export default Header;
