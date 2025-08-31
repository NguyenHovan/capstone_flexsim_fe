import "./login.css";
import illustration from "../../assets/login.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AuthService } from "../../services/auth.service";
import { toast } from "sonner";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const isUnverifiedMsg = (m: string) => {
  const s = (m || "").toLowerCase();
  return s.includes("xác thực") || s.includes("chua xac thuc") || s.includes("verify") || s.includes("unverified");
};
const getServerMessage = (err: any) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  return err?.message || "";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const logoutTimerRef = useRef<number | null>(null);

  const redirectByRole = (roleId: number) => {
    if (roleId === 1) navigate("/admin");
    else if (roleId === 2) navigate("/organizationAdmin");
    else if (roleId === 3) navigate("/instructor");
    else navigate("/");
  };

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleAutoLogout = (msLeft: number) => {
    clearLogoutTimer();
    logoutTimerRef.current = window.setTimeout(() => {
      localStorage.clear();
      toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    }, Math.max(msLeft, 0));
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const loginTimeRaw = localStorage.getItem("loginTime");
    const cachedUserRaw = localStorage.getItem("currentUser");

    if (token && loginTimeRaw) {
      const loginTime = Number(loginTimeRaw);
      const elapsed = Date.now() - loginTime;

      if (elapsed >= TOKEN_TTL_MS) {
        localStorage.clear();
        toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (cachedUserRaw) {
        scheduleAutoLogout(TOKEN_TTL_MS - elapsed);
        const u = JSON.parse(cachedUserRaw);
        if (u?.isEmailVerify === false) {
          sessionStorage.setItem("pendingVerify", JSON.stringify({ userName: u?.userName }));
          navigate("/verify-code", { replace: true });
          return;
        }
        redirectByRole(Number(u?.roleId));
      }
    }

    return clearLogoutTimer; 
  }, []);

  const goVerify = (uName: string) => {
    sessionStorage.setItem("pendingVerify", JSON.stringify({ userName: uName }));
    toast.info("A verification code has been sent to your email.");
    navigate("/verify-code", { replace: true });
  };

  const handleLogin = async () => {
    if (loading) return; 
    if (!userName || !password) {
      toast.warning("Please enter both username and password.");
      return;
    }

    sessionStorage.setItem("pendingVerify", JSON.stringify({ userName }));

    try {
      setLoading(true);

      const res = await AuthService.login({ userName, password });
      if (!res?.user || !res?.token) {
        toast.error("Invalid username or password.");
        sessionStorage.removeItem("pendingVerify");
        return;
      }

      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("loginTime", String(Date.now()));
      localStorage.setItem("roleId", String(res.user.roleId));
      localStorage.setItem("currentUser", JSON.stringify(res.user));

      // Đặt hẹn giờ tự logout sau 2 giờ
      scheduleAutoLogout(TOKEN_TTL_MS);

      // Chưa verify?
      if (res.user.isEmailVerify === false) {
        goVerify(res.user.userName || userName);
        return;
      }

      sessionStorage.removeItem("pendingVerify");
      toast.success("Login successful!");
      redirectByRole(Number(res.user.roleId));
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = getServerMessage(err);

      if (status === 401 && isUnverifiedMsg(serverMsg)) {
        goVerify(userName);
        return;
      }

      toast.error(serverMsg || "Login failed. Please check your credentials.");
      sessionStorage.removeItem("pendingVerify");
    } finally {
      setLoading(false);
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <div className="forgot-password" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
