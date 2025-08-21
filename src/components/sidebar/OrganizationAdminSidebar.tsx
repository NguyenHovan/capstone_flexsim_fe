import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  QuestionCircleOutlined,
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

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "Overview",          icon: <HomeOutlined />,           path: "/organizationAdmin/" },
    { label: "User Manager",      icon: <TeamOutlined />,           path: "/organizationAdmin/user-manager" },
    { label: "Workspace Manager", icon: <AppstoreOutlined />,       path: "/organizationAdmin/workspace-manager" },
    { label: "Subscription Plan", icon: <CrownOutlined />,          path: "/organizationAdmin/subscription" },
    { label: "Order Manager",     icon: <ShoppingCartOutlined />,   path: "/organizationAdmin/order-manager" },
    { label: "Support & Help",    icon: <QuestionCircleOutlined />, path: "/organizationAdmin/support" },
    { label: "Logout",            icon: <LogoutOutlined />,         path: "/organizationAdmin/logout", onClick: handleLogout },
  ];

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
      </ul>
    </div>
  );
};

export default OrganizationAdminSidebar;
