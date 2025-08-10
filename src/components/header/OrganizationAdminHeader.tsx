import { Avatar } from "antd";
import "./organizationAdminHeader.css";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

const OrganizationAdminHeader = () => {
  const currentUser = getCurrentUser();

  const userName =
    currentUser?.fullName || currentUser?.userName || "Organization Admin";

  const avatarUrl =
    currentUser?.avtUrl?.trim() ? currentUser.avtUrl : DEFAULT_AVATAR;

  return (
    <header className="custom-header">
      <div className="logo">
        <span className="logo-orange">LOGISIM</span>
        <span className="logo-teal">EDU</span>
      </div>

      <div className="org-avatar-block">
        <Avatar src={avatarUrl} size={36} />
        <span className="org-name">{userName}</span>
      </div>
    </header>
  );
};

export default OrganizationAdminHeader;
