// src/components/admin/AdminHeader.tsx
import { Avatar } from "antd";
import "./adminHeader.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3251/3251650.png";

const AdminHeader = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const fullName = currentUser?.userName || "ADMIN";

  const avatarUrl =
    currentUser?.avtUrl && currentUser.avtUrl.trim() !== ""
      ? currentUser.avtUrl
      : DEFAULT_AVATAR;

  return (
    <header className="custom-header">
      <div className="logo">
        <span className="logo-orange">LOGISIM</span>
        <span className="logo-teal">EDU</span>
      </div>
      <div className="org-avatar-block">
        <Avatar src={avatarUrl} size={34} />
        <span className="org-name">{fullName}</span>
      </div>
    </header>
  );
};

export default AdminHeader;
