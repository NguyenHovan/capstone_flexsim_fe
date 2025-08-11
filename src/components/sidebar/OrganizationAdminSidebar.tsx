import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./organizationAdminSidebar.css";

const OrganizationAdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  const menuItems = [
    {
      label: "Overview",
      icon: <HomeOutlined />,
      path: "/organizationAdmin/",
    },

    {
      label: "User Manager",
      icon: <UserOutlined />,
      path: "/organizationAdmin/user-manager",
    },
    {
      label: "Workspace Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/workspace-manager",
    },
    {
      label: "Class Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/class-manager",
    },
    {
      label: "Lesson Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/lesson-manager",
    },
    {
      label: "Topic Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/topic-manager",
    },
    {
      label: "Category Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/category-manager",
    },

    {
      label: "Order Manager",
      icon: <SettingOutlined />,
      path: "/organizationAdmin/order-manager",
    },
    {
      label: "Support & Help",
      icon: <QuestionCircleOutlined />,
      path: "/organizationAdmin/support",
    },
    {
      label: "Logout",
      icon: <LogoutOutlined />,
      path: "/organizationAdmin/logout",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="organizationAdmin-sidebar">
      <div className="sidebar-section-title">ORGANIZATION ADMIN</div>
      <ul className="organizationAdmin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `organizationAdmin-sidebar-item ${isActive ? "active" : ""}`
              }
              end
              onClick={(e) => item.onClick && item.onClick(e)}
            >
              {item.icon}
              <span className="organizationAdmin-sidebar-label">
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrganizationAdminSidebar;
