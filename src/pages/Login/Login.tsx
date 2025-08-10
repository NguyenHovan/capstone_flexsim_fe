import "./login.css";
import illustration from "../../assets/login.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthService } from "../../services/auth.service";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const loginTime = localStorage.getItem("loginTime");
    if (token && loginTime) {
      const now = Date.now();
      const diffHours = (now - Number(loginTime)) / (1000 * 60 );
      if (diffHours >= 1) {
        localStorage.clear();
        toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        // Nếu còn hạn thì điều hướng đúng role luôn
        const roleId = Number(localStorage.getItem("roleId"));
        redirectByRole(roleId);
      }
    }
  }, []);

  const redirectByRole = (roleId: number) => {
    if (roleId === 1) {
      navigate("/admin");
    } else if (roleId === 2) {
      navigate("/organizationAdmin");
    } else if (roleId === 3) {
      navigate("/instructor");
    } else if (roleId === 4) {
      navigate("/");
    } else {
      toast.error("Unknown role, cannot login.");
    }
  };

  const handleLogin = async () => {
    if (!userName || !password) {
      toast.warning("Please enter both username and password.");
      return;
    }

    try {
      const response = await AuthService.login({ userName, password });

      if (response?.user) {
        const roleId = response.user.roleId;
        localStorage.setItem("roleId", roleId);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
      }

      if (response?.token) {
        localStorage.setItem("accessToken", response.token);
        localStorage.setItem("loginTime", Date.now().toString()); 
        toast.success("Login successful!");

        redirectByRole(Number(response.user.roleId));
      } else {
        toast.error("Invalid username or password.");
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
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
