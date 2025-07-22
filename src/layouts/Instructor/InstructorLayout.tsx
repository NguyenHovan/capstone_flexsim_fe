import { Outlet } from "react-router-dom";
import OrganizationAdminHeader from "../../components/header/OrganizationAdminHeader";
import Footer from "../../components/footer/Footer";
import "./instructorLayout.css";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";

export default function InstructorLayout() {
  return (
    <div className="org-app-layout">
      <OrganizationAdminHeader />
      <div className="org-main-row">
        <InstructorSidebar />
        <main className="org-content-area">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
