import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./instructorSidebar.css";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    key: "Overview",
    icon: <HomeOutlined />,
    label: "Overview",
    url: "/instructor",
  },
  {
    key: "Courses",
    icon: <BookOutlined />,
    label: "Courses",
    url: "/instructor-course",
  },
  {
    key: "Lessons",
    icon: <AppstoreOutlined />,
    label: "Lessons",
    url: "/instructor-lesson",
  },
  {
    key: "Enroll Request",
    icon: <AppstoreOutlined />,
    label: "Enroll Request",
    url: "/instructor-enroll-request",
  },
  {
    key: "Topics",
    icon: <TeamOutlined />,
    label: "Topics",
    url: "/instructor-topic",
  },
  {
    key: "Scenarios",
    icon: <DollarOutlined />,
    label: "Scenarios",
    url: "/instructor",
  },
  {
    key: "Scene",
    icon: <InfoCircleOutlined />,
    label: "Scene",
    url: "/instructor-scene",
  },
  {
    key: "Quizzes",
    icon: <SettingOutlined />,
    label: "Quizzes",
    url: "/instructor-quiz",
  },
  {
    key: "Reviews",
    icon: <UserOutlined />,
    label: "Reviews",
    url: "/instructor-review",
  },
  {
    key: "Setting",
    icon: <SettingOutlined />,
    label: "Setting",
    url: "/instructor",
  },
  {
    key: "Support / Help",
    icon: <UserOutlined />,
    label: "Support / Help",
    url: "/instructor",
  },
];

const InstructorSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/login");
  };

  return (
    <aside className="org-sidebar">
      <div className="org-sidebar-title">
        <span className="logo-main">Instructor</span>
      </div>
      <nav>
        <ul className="org-sidebar-menu">
          {sidebarItems.map((item) => (
            <li
              key={item.key}
              className="org-sidebar-item"
              onClick={() => navigate(item.url)}
            >
              {item.icon}
              <span className="org-sidebar-label">{item.label}</span>
            </li>
          ))}

          {/* Logout */}
          <li
            className="org-sidebar-item logout-item"
            onClick={handleLogout}
            style={{ color: "red", marginTop: "auto" }}
          >
            <LogoutOutlined />
            <span className="org-sidebar-label">Logout</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
