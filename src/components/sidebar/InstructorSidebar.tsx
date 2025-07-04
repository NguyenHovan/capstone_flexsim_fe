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
  { key: "Overview", icon: <HomeOutlined />, label: "Overview" },
  { key: "Courses", icon: <BookOutlined />, label: "Courses" },
  { key: "Classes", icon: <AppstoreOutlined />, label: "Workspaces" },
  { key: "Topics", icon: <TeamOutlined />, label: "Users" },
  {
    key: "Scenarios",
    icon: <DollarOutlined />,
    label: "Packages & Subscription",
  },
  {
    key: "Scene",
    icon: <InfoCircleOutlined />,
    label: "Organization Profile",
  },
  { key: "Quizzes", icon: <SettingOutlined />, label: "Settings" },
  { key: "Reviews", icon: <UserOutlined />, label: "Support / Help" },
  { key: "Setting", icon: <SettingOutlined />, label: "Support / Help" },
  { key: "Support / Help", icon: <UserOutlined />, label: "Support / Help" },
];

const InstructorSidebar = () => (
  <aside className="org-sidebar">
    <div className="org-sidebar-title">
      <span className="logo-main">Instructor</span>
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

export default InstructorSidebar;
