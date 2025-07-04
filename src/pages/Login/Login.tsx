import "./login.css";
import illustration from "../../assets/login.png";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthService } from "../../services/auth.service";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warning("Please enter both email and password.");
      return;
    }

    try {
      const response = await AuthService.login({ email, password });

      console.log({ response });

      if (response?.token) {
        // Lưu token
        localStorage.setItem("accessToken", response.token);

        // Lưu thông tin user
        localStorage.setItem("currentUser", JSON.stringify(response.user));

        toast.success("Login successful!");
        navigate("/"); // hoặc chuyển hướng vào dashboard, etc.
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={illustration} alt="Login Visual" className="illustration" />
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Welcome Back to LogisimEdu</h2>
          <p>
            Log in to access your logistics simulations, courses, <br />
            and progress tracking.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>

          <button className="login-button" onClick={handleLogin}>
            Login
          </button>

          <button className="google-button">
            <GooglePlusOutlined />
            Continue with Google
          </button>

          <p className="signup-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Signup</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
