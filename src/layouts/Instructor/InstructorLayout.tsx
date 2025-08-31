import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import "./instructorLayout.css";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";
import InstructorAdminHeader from "../../components/header/InstructorAdminHeader";

export default function InstructorLayout() {
  return (
    <div className="org-app-layout">
      <InstructorAdminHeader />
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
