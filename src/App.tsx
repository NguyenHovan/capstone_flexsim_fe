import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutMain from "./components/layouts";
import LoginPage from "./pages/Login/Login";
import SignUpPage from "./pages/Signup/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "./pages/VerifyCode/VerifyCode";
import HomePage from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route element={<LayoutMain />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
