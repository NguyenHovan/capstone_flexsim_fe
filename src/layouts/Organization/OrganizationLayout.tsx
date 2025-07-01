import { Outlet } from "react-router-dom";
import OrganizationHeader from "../../components/header/OrganizationHeader";
import OrganizationSidebar from "../../components/sidebar/OrganizationSidebar";
import Footer from "../../components/footer/Footer";
import "./organizationLayout.css";

export default function OrganizationLayout() {
  return (
    <div className="org-app-layout">
      <OrganizationHeader />
      <div className="org-main-row">
        <OrganizationSidebar />
        <main className="org-content-area">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
