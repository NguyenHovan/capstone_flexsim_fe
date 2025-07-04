import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login/Login";
import SignUpPage from "../pages/Signup/Signup";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "../pages/VerifyCode/VerifyCode";
import LayoutMain from "../layouts/Student";
import HomePage from "../pages/Home/Home";
import OrganizationLayout from "../layouts/Organization/OrganizationLayout";
import HomeOrganization from "../pages/Organization/Home/HomeOrganization";
import Contact from "../pages/Contact/Contact";
import NewPasswordPage from "../pages/NewPassword/NewPassword";
import InstructorLayout from "../layouts/Instructor/InstructorLayout";
import Overview from "../pages/Instructor/Overview";
import ProfilePage from "../pages/Profile/Profile";

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
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Organization layout - dùng nested routes */}
      <Route element={<OrganizationLayout />}>
        <Route path="/organization" element={<HomeOrganization />} />
        {/* Nếu có các page con cho org: */}
        {/* <Route path="/organization/xxx" element={<PageXxx />} /> */}
      </Route>

      <Route element={<InstructorLayout />}>
        <Route path="/instructor" element={<Overview />} />
      </Route>
    </Routes>
  );
};

export default MainRoute;
