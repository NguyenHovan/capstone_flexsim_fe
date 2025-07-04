import { NavLink, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./organizationSidebar.css";

const OrganizationSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Overview",
      icon: <HomeOutlined />,
      path: "/organization/",
    },
    {
      label: "Workspace",
      icon: <FolderOpenOutlined />,
      path: "/organization/workspace",
    },
    {
      label: "User",
      icon: <TeamOutlined />,
      path: "/organization/user",
    },
    {
      label: "Order",
      icon: <AppstoreOutlined />,
      path: "/organization/order",
    },
    {
      label: "Profile",
      icon: <UserOutlined />,
      path: "/organization/profile",
    },
    {
      label: "Settings",
      icon: <SettingOutlined />,
      path: "/organization/setting",
    },
    {
      label: "Support & Help",
      icon: <QuestionCircleOutlined />,
      path: "/organization/support",
    },
  ];

  return (
    <div className="org-sidebar">
      <div className="sidebar-section-title">ORGANIZATION</div>
      <ul className="org-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `org-sidebar-item ${isActive ? "active" : ""}`
              }
              end
            >
              {item.icon}
              <span className="org-sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrganizationSidebar;
