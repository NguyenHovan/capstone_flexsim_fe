import { Avatar } from "antd";
import "./organizationHeader.css";

const ORGANIZATION_NAME = "FPT Education";
const AVATAR_URL = "https://fpt-corp.com/asset/uploads/fpt.webp";

const OrganizationHeader = () => (
  <header className="custom-header">
    <div className="logo">
      <span className="logo-orange">LOGISIM</span>
      <span className="logo-teal">EDU</span>
    </div>
    <div className="org-avatar-block">
      <Avatar src={AVATAR_URL} size={34} />
      <span className="org-name">{ORGANIZATION_NAME}</span>
    </div>
  </header>
);

export default OrganizationHeader;
