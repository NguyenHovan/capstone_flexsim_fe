import { Avatar } from "antd";
import "./adminHeader.css";

const ADMIN_NAME = "ADMIN";
const AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/3251/3251650.png";

const AdminHeader = () => (
  <header className="custom-header">
    <div className="logo">
      <span className="logo-orange">LOGISIM</span>
      <span className="logo-teal">EDU</span>
    </div>
    <div className="org-avatar-block">
      <Avatar src={AVATAR_URL} size={34} />
      <span className="org-name">{ADMIN_NAME}</span>
    </div>
  </header>
);

export default AdminHeader;
