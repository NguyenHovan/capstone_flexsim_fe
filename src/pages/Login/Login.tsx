import "./login.css";
import illustration from "../../assets/login.png";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const navigate = useNavigate();
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

          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />

          <div
            className="forgot-password"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </div>

          <button className="login-button">Login</button>

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
