import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./adminsidebar.css";

const AdminSidebar = () => {
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
      label: "Support & Help",
      icon: <QuestionCircleOutlined />,
      path: "/adminsupport",
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
