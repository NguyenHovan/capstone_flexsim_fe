import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./adminSidebar.css";

const AdminSidebar = () => {
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
      path: "/admin/",
    },
    {
      label: "Organization Manager",
      icon: <TeamOutlined />,
      path: "/admin/organization-manager",
    },
    {
      label: "User Manager",
      icon: <UserOutlined />,
      path: "/admin/user-manager",
    },
    {
      label: "Workspace Manager",
      icon: <SettingOutlined />,
      path: "/admin/workspace-manager",
    },
    {
      label: "Subcription Manager",
      icon: <SettingOutlined />,
      path: "/admin/subscriptionPlan-manager",
    },
    {
      label: "Order Manager",
      icon: <SettingOutlined />,
      path: "/admin/order-manager",
    },
    {
      label: "Scene Manager",
      icon: <SettingOutlined />,
      path: "/admin/scene-manager",
    },
    {
      label: "Scenario Manager",
      icon: <SettingOutlined />,
      path: "/admin/scenario-manager",
    },
    {
      label: "Support & Help",
      icon: <QuestionCircleOutlined />,
      path: "/admin/support",
    },
    {
      label: "Logout",
      icon: <LogoutOutlined />,
      path: "/admin/logout",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-section-title">SYSTEM ADMIN</div>
      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `admin-sidebar-item ${isActive ? "active" : ""}`
              }
              end
              onClick={(e) => item.onClick && item.onClick(e)}
            >
              {item.icon}
              <span className="admin-sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
