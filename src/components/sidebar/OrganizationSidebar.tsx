import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./organizationSidebar.css";

const sidebarItems = [
  { key: "overview", icon: <HomeOutlined />, label: "Overview" },
  { key: "workspaces", icon: <AppstoreOutlined />, label: "Workspaces" },
  { key: "users", icon: <TeamOutlined />, label: "Users" },
  { key: "courses", icon: <BookOutlined />, label: "Courses" },
  { key: "packages", icon: <DollarOutlined />, label: "Packages & Subscription" },
  { key: "org-profile", icon: <InfoCircleOutlined />, label: "Organization Profile" },
  { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  { key: "help", icon: <UserOutlined />, label: "Support / Help" },
];

const OrganizationSidebar = () => (
  <aside className="org-sidebar">
    <div className="org-sidebar-title">
      <span className="logo-main">ORGANIZATION</span>
    </div>
    <nav>
      <ul className="org-sidebar-menu">
        {sidebarItems.map((item) => (
          <li key={item.key} className="org-sidebar-item">
            {item.icon}
            <span className="org-sidebar-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default OrganizationSidebar;
