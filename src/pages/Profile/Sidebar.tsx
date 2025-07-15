import { useNavigate, useLocation } from "react-router-dom";
import { Avatar } from "antd";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "About", path: "/about" },
    { label: "My Course", path: "/my-course" },
    { label: "My Class", path: "/my-class" },
    { label: "Setting", path: "/setting" },
  ];

  return (
    <div
      style={{
        width: 220,
        background: "#fff",
        paddingTop: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      {/* Avatar */}
      <Avatar
        src="/avatar.png" // hoặc thay bằng ảnh từ props hoặc URL khác
        size={64}
        style={{ marginBottom: 32 }}
      />

      {/* Menu */}
      <div style={{ width: "100%", padding: "0 20px" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: "12px",
                marginBottom: 16,
                textAlign: "center",
                borderRadius: 12,
                backgroundColor: isActive ? "#00796B" : "#F5F5F5",
                color: isActive ? "white" : "#444",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
