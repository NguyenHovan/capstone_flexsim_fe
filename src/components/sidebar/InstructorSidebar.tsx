import {
  BookOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import "./instructorSidebar.css";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    key: "Dashboard",
    icon: <AppstoreOutlined />,
    label: "Trang tổng quan",
    url: "/instructor-dashboard",
  },
  {
    key: "Courses",
    icon: <BookOutlined />,
    label: "Khóa học",
    url: "/instructor-course",
  },
  {
    key: "Categories",
    icon: <TagsOutlined />,
    label: "Danh mục khóa học",
    url: "/instructor-category",
  },

  // {
  //   key: "Enroll Request",
  //   icon: <AppstoreOutlined />,
  //   label: "Enroll Request",
  //   url: "/instructor-enroll-request",
  // },
  // {
  //   key: "Classes",
  //   icon: <UserOutlined />,
  //   label: "Classes",
  //   url: "/instructor-class",
  // },
  // {
  //   key: "Topics",
  //   icon: <TeamOutlined />,
  //   label: "Topics",
  //   url: "/instructor-topic",
  // },
  {
    key: "Scenarios",
    icon: <DollarOutlined />,
    label: "Kịch bản",
    url: "/instructor-scenario",
  },
  {
    key: "Scene",
    icon: <InfoCircleOutlined />,
    label: "Mô hình mô phỏng",
    url: "/instructor-scene",
  },
  {
    key: "ChangePassword",
    icon: <SettingOutlined />,
    label: "Đổi mật khẩu",
    url: "/instructor-change-password",
  },

  {
    key: "ChangeEmail",
    icon: <SettingOutlined />,
    label: "Thay đổi email",
    url: "/instructor-change-email",
  },
  // {
  //   key: "Support / Help",
  //   icon: <UserOutlined />,
  //   label: "Support / Help",
  //   url: "/instructor",
  // },
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
            <span className="org-sidebar-label">Đăng xuất</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
