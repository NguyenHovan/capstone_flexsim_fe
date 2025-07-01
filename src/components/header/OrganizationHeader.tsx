import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./organizationHeader.css";

const ORGANIZATION_NAME = "FPT Education";

const OrganizationHeader = () => (
  <header className="custom-header">
    <div className="logo">
      <span className="logo-orange">LOGISIM</span>
      <span className="logo-teal">EDU</span>
    </div>
    <div className="org-avatar-block">
      <Avatar icon={<UserOutlined />} size={34} />
      <span className="org-name">{ORGANIZATION_NAME}</span>
    </div>
  </header>
);

export default OrganizationHeader;
