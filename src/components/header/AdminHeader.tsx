// AdminHeader.tsx
import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AccountService } from "../../services/account.service";
import { useEffect, useState, useCallback } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  const fetchUserCurrent = useCallback(async () => {
    if (!user) return;
    const response = await AccountService.getAccountById(user.id);
    setAvatar(response?.avtUrl || null);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  useEffect(() => {
    fetchUserCurrent();
  }, [fetchUserCurrent]);

  useEffect(() => {
    const refetch = () => fetchUserCurrent();
    window.addEventListener("user:updated", refetch);
    window.addEventListener("storage", refetch);
    return () => {
      window.removeEventListener("user:updated", refetch);
      window.removeEventListener("storage", refetch);
    };
  }, [fetchUserCurrent]);

  const items: MenuProps["items"] = [
    {
      key: "Admin-profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") return handleLogout();
    if (key === "Admin-profile") return navigate("/Admin/admin-profile");
  };

  return (
    <header className="custom-header">
      <div className="logo" onClick={() => navigate("/")}>
        <span className="logo-orange">LOGISIM</span>
        <span className="logo-teal">EDU</span>
      </div>

      <div className="avatar-section">
        {isLoggedIn ? (
          <Dropdown
            menu={{ items, onClick: onMenuClick }}
            placement="bottomRight"
            arrow
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                src={avatar || undefined}
                style={{ backgroundColor: "#1890ff", marginRight: 8 }}
              >
                {(!avatar && user?.fullName?.[0]?.toUpperCase()) || "U"}
              </Avatar>
              <span style={{ color: "#363636" }}>{user?.fullName}</span>
            </div>
          </Dropdown>
        ) : (
          <Avatar
            icon={<UserAddOutlined />}
            onClick={() => navigate("/login")}
          />
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
