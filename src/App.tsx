import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutMain from "./layouts/Student";
import LoginPage from "./pages/Login/Login";
import SignUpPage from "./pages/Signup/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "./pages/VerifyCode/VerifyCode";
import HomePage from "./pages/Home/Home";
import OrganizationLayout from "./layouts/Organization/OrganizationLayout";
import OranizationHome from "./pages/Organization/Home/OrganizationHome";
import OrganizationWorkspace from "./pages/Organization/Workspace/OrganizationWorkspace";
import OrganizationUser from "./pages/Organization/User/OrganizationUser";
import OrganizationOrder from "./pages/Organization/Order/OrganizationOrder";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailure from "./pages/Payment/PaymentFailure";

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
          <Route path="/organization" element={<OranizationHome />} />
          <Route path="/organization/workspace" element={<OrganizationWorkspace/>} />
          <Route path="/organization/user" element={<OrganizationUser/>} />
          <Route path="/organization/order" element={<OrganizationOrder/>} />
          

        
        </Route>
        <Route path="/organization/order/paymentsuccess" element={<PaymentSuccess/>} />
        <Route path="/organization/order/paymentfail" element={<PaymentFailure/>} />
      </Routes>
    </BrowserRouter>
    <>
      <Toaster position="top-right" richColors closeButton expand={true} />
      <BrowserRouter>
        <MainRoute />
      </BrowserRouter>
    </>
  );
}

export default App;
