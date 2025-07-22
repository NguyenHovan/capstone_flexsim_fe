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
    key: "Classes",
    icon: <AppstoreOutlined />,
    label: "Classes",
    url: "/instructor-class",
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
        </ul>
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
