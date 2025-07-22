import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import OrganizationAdminHeader from "../../components/header/OrganizationAdminHeader";
import OrganizationAdminSidebar from "../../components/sidebar/OrganizationAdminSidebar";

export default function OrganizationAdminLayout() {
  return (
    <div className="org-app-layout">
      <OrganizationAdminHeader />
      <div className="org-main-row">
        <OrganizationAdminSidebar />
        <main className="org-content-area">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
