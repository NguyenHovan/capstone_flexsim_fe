import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/Login";
import SignUpPage from "../pages/Signup/Signup";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "../pages/VerifyCode/VerifyCode";
import LayoutMain from "../layouts/Student";
import HomePage from "../pages/Home/Home";
import OrganizationLayout from "../layouts/Organization/OrganizationLayout";
import HomeOrganization from "../pages/Organization/Home/OrganizationHome";
import OrganizationCourses from "../pages/Organization/Courses/OrganizationCourses";
import OrganizationClasses from "../pages/Organization/Classes/OrganizationClasses";
import OrganizationWorkspace from "../pages/Organization/Workspace/OrganizationWorkspace";
import Contact from "../pages/Contact/Contact";
import NewPasswordPage from "../pages/NewPassword/NewPassword";

const MainRoute = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />

      {/* Guest/Student layout */}
      <Route element={<LayoutMain />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
      </Route>

      {/* Organization layout with nested routes */}
      <Route path="/organization" element={<OrganizationLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="/" element={<HomeOrganization />} />
        <Route path="courses" element={<OrganizationCourses />} />
        <Route path="classes" element={<OrganizationClasses />} />
        <Route path="workspace" element={<OrganizationWorkspace />} />
      </Route>
    </Routes>
  );
};

export default MainRoute;
