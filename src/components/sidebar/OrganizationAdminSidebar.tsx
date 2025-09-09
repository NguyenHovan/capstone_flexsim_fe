import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  KeyOutlined,
  DownOutlined,
  RightOutlined,
  MailOutlined,
 
} from "@ant-design/icons";
import React from "react";
import "./organizationAdminSidebar.css";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

const OrganizationAdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "Tổng quan",          icon: <HomeOutlined />,           path: "/organizationAdmin/" },
    { label: "Quản lí người dùng",      icon: <TeamOutlined />,           path: "/organizationAdmin/user-manager" },
    { label: "Quản lí không gian làm việc", icon: <AppstoreOutlined />,       path: "/organizationAdmin/workspace-manager" },
    { label: "Quản lý gói đăng ký", icon: <CrownOutlined />,          path: "/organizationAdmin/subscription" },
    { label: "Quản lí đơn hàng",     icon: <ShoppingCartOutlined />,   path: "/organizationAdmin/order-manager" },
    // { label: "Support & Help",    icon: <QuestionCircleOutlined />, path: "/organizationAdmin/support" },
  ];

  const isSettingsChildActive = [
    "/organizationAdmin/orgAdmin-profile",
    "/organizationAdmin/orgAdmin-change-password",
    "/organizationAdmin/orgAdmin-change-email",
  ].some(p => location.pathname.startsWith(p));

  const [openSettings, setOpenSettings] = React.useState<boolean>(isSettingsChildActive);
  React.useEffect(() => setOpenSettings(isSettingsChildActive), [isSettingsChildActive]);

  return (
    <div className="organizationAdmin-sidebar" role="navigation" aria-label="Organization admin sidebar">
      <div className="sidebar-section-title">ORGANIZATION ADMIN</div>

      <ul className="organizationAdmin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `organizationAdmin-sidebar-item ${isActive ? "active" : ""}`
              }
              end={item.path === "/organizationAdmin/"} 
              onClick={(e) => item.onClick?.(e)}
            >
              {item.icon}
              <span className="organizationAdmin-sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* ===== Settings ===== */}
        <li>
          <div
            role="button"
            aria-expanded={openSettings}
            className={`organizationAdmin-sidebar-item ${isSettingsChildActive ? "active" : ""}`}
            onClick={() => setOpenSettings(v => !v)}
          >
            <SettingOutlined />
            <span className="organizationAdmin-sidebar-label">Cài đặt</span>
            <span style={{ marginLeft: "auto" }}>
              {openSettings ? <DownOutlined /> : <RightOutlined />}
            </span>
          </div>

          {openSettings && (
            <ul className="organizationAdmin-submenu">
              <li>
                <NavLink
                  to="/organizationAdmin/orgAdmin-profile"
                  className={({ isActive }) =>
                    `organizationAdmin-sidebar-item organizationAdmin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <UserOutlined />
                  <span className="organizationAdmin-sidebar-label">Thông tin cá nhân</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/organizationAdmin/orgAdmin-change-password"
                  className={({ isActive }) =>
                    `organizationAdmin-sidebar-item organizationAdmin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <KeyOutlined />
                  <span className="organizationAdmin-sidebar-label">Đổi mật khẩu</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/organizationAdmin/orgAdmin-change-email"
                  className={({ isActive }) =>
                    `organizationAdmin-sidebar-item organizationAdmin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <MailOutlined />
                  <span className="organizationAdmin-sidebar-label">Thay đổi email</span>
                </NavLink>
              </li>

            </ul>
          )}
        </li>

        {/* Logout */}
        <li>
          <NavLink
            to="/organizationAdmin/logout"
            className="organizationAdmin-sidebar-item"
            onClick={(e) => handleLogout(e)}
          >
            <LogoutOutlined />
            <span className="organizationAdmin-sidebar-label">Đăng xuất</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default OrganizationAdminSidebar;
