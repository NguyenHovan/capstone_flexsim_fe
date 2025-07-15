import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import AdminHeader from "../../components/header/AdminHeader";
import AdminSidebar from "../../components/sidebar/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="org-app-layout">
      <AdminHeader />
      <div className="org-main-row">
        <AdminSidebar />
        <main className="org-content-area">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
