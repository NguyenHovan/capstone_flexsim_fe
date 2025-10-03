import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  KeyOutlined,
  MailOutlined,
  DownOutlined,
  RightOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import React from "react";
import "./adminSidebar.css";

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  const menuItems = [
    { label: "Thống kê",              icon: <HomeOutlined />,       path: "/admin/" },
    { label: "Quản lý Tổ chức",  icon: <TeamOutlined />,       path: "/admin/organization-manager" },
    { label: "Quản lý Người dùng",          icon: <UserOutlined />,       path: "/admin/user-manager" },
    { label: "Quản lý Không gian làm việc",     icon: <AppstoreOutlined />,   path: "/admin/workspace-manager" },
    { label: "Quản lý Gói đăng ký",   icon: <SettingOutlined />,    path: "/admin/subscriptionPlan-manager" },
    { label: "Quản lý Đơn hàng",         icon: <SettingOutlined />,    path: "/admin/order-manager" },
    // { label: "Scene Manager",         icon: <SettingOutlined />,    path: "/admin/scene-manager" },
    // { label: "Scenario Manager",      icon: <SettingOutlined />,    path: "/admin/scenario-manager" },
    // { label: "Support & Help",        icon: <QuestionCircleOutlined />, path: "/admin/support" },
  ] as const;

  const isSettingsChildActive = [
    "/admin/admin-profile",
    "/admin/admin-change-password",
    "/admin/admin-change-email",
  ].some((p) => location.pathname.startsWith(p));

  const [openSettings, setOpenSettings] = React.useState<boolean>(isSettingsChildActive);
  React.useEffect(() => setOpenSettings(isSettingsChildActive), [isSettingsChildActive]);

  return (
    <div className="admin-sidebar" role="navigation" aria-label="Admin sidebar">
      <div className="sidebar-section-title">SYSTEM ADMIN</div>

      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `admin-sidebar-item ${isActive ? "active" : ""}`
              }
              end={item.path === "/admin/"} 
            >
              {item.icon}
              <span className="admin-sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}

        <li>
          <div
            role="button"
            aria-expanded={openSettings}
            className={`admin-sidebar-item ${isSettingsChildActive ? "active" : ""}`}
            onClick={() => setOpenSettings((v) => !v)}
          >
            <SettingOutlined />
            <span className="admin-sidebar-label">Cài đặt</span>
            <span style={{ marginLeft: "auto" }}>
              {openSettings ? <DownOutlined /> : <RightOutlined />}
            </span>
          </div>

          {openSettings && (
            <ul className="admin-submenu">
              <li>
                <NavLink
                  to="/admin/admin-profile"
                  className={({ isActive }) =>
                    `admin-sidebar-item admin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <UserOutlined />
                  <span className="admin-sidebar-label">Thông tin cá nhân</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/admin-change-password"
                  className={({ isActive }) =>
                    `admin-sidebar-item admin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <KeyOutlined />
                  <span className="admin-sidebar-label">Đổi mật khẩu</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/admin-change-email"
                  className={({ isActive }) =>
                    `admin-sidebar-item admin-submenu-item ${isActive ? "active" : ""}`
                  }
                >
                  <MailOutlined />
                  <span className="admin-sidebar-label">Thay đổi email</span>
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Logout */}
        <li>
          <NavLink
            to="/admin/logout"
            className="admin-sidebar-item"
            onClick={(e) => handleLogout(e)}
          >
            <LogoutOutlined />
            <span className="admin-sidebar-label">Đăng xuất</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
