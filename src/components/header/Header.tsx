import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { UserAddOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { AccountService } from "../../services/account.service";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  const fetchUserCurrent = async () => {
    if (!user?.id) return;
    const response = await AccountService.getAccountById(user.id);
    setAvatar(response?.avtUrl || null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/login");
  };

  useEffect(() => {
    fetchUserCurrent();
    // re-fetch if user id changes (login/logout)
  }, [user?.id]);

  // AntD v5: dùng menu.items thay cho overlay/Menu cũ
  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: handleLogout,
    },
  ];

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
          display: "flex",
          alignItems: "center",
          fontSize: 22,
          padding: "12px 32px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <img
          src="https://res.cloudinary.com/dsfrqevvg/image/upload/v1756926674/d2477089b0b74afdaf66e73fe2c218f4-free_ewplwi.png"
          style={{ width: 50, height: 50, marginRight: 12 }}
        />
        <div>
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

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 32px" }}>
        {isLoggedIn ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Avatar
                size={40}
                className="header-avatar"
                src={
                  avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : undefined
                }
                style={{ border: "2px solid #fff", background: "#fff" }}
              >
                {(!avatar && user?.userName?.[0]?.toUpperCase()) || "U"}
              </Avatar>
              <span style={{ color: "#fff", fontWeight: 400 }}>{user?.userName}</span>
            </div>
          </Dropdown>
        ) : (
          <Avatar
            size={40}
            icon={<UserAddOutlined />}
            onClick={() => navigate("/login")}
            style={{ backgroundColor: "#ff5722", cursor: "pointer", border: "2px solid #fff" }}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
