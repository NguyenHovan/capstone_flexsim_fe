import { Avatar } from "antd";
import "./organizationAdminHeader.css";

const ORGANIZATION_NAME = "FPT";
const AVATAR_URL = "https://media.licdn.com/dms/image/v2/C560BAQFRxbxHAl5oew/company-logo_200_200/company-logo_200_200/0/1630668147018/fpt_corporation_logo?e=2147483647&v=beta&t=WW03ljSGZoL6rHvwTqGDIlWDqttr8Jii1yHjHnFm8Xk";

const OrganizationAdminHeader = () => (
  <header className="custom-header">
    <div className="logo">
      <span className="logo-orange">LOGISIM</span>
      <span className="logo-teal">EDU</span>
    </div>
    <div className="orgAdmin-avatar-block">
      <Avatar src={AVATAR_URL} size={34} />
      <span className="orgAdmin-name">{ORGANIZATION_NAME}</span>
    </div>
  </header>
);

export default OrganizationAdminHeader;
