import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutMain from "./layouts/Student";
import LoginPage from "./pages/Login/Login";
import SignUpPage from "./pages/Signup/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "./pages/VerifyCode/VerifyCode";
import HomePage from "./pages/Home/Home";
import OrganizationLayout from "./layouts/Organization/OrganizationLayout";
import HomeOrganization from "./pages/Organization/Home/HomeOrganization";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />

        {/* Guest/Student layout */}
        <Route element={<LayoutMain />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Organization layout - dùng nested routes */}
        <Route element={<OrganizationLayout />}>
          <Route path="/organization" element={<HomeOrganization />} />
          {/* Nếu có các page con cho org: */}
          {/* <Route path="/organization/xxx" element={<PageXxx />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
