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
  const [showPassword, setShowPassword] = useState(false);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  const redirectByRole = (roleId: number) => {
    if (roleId === 1) navigate("/admin");
    else if (roleId === 2) navigate("/organizationAdmin");
    else if (roleId === 3) navigate("/instructor-course");
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
    toast.info("Mã xác minh đã được gửi đến email của bạn.");
    navigate("/verify-code", { replace: true });
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!userName || !password) {
      toast.warning("Vui lòng nhập cả tên người dùng và mật khẩu.");
      return;
    }

    sessionStorage.setItem("pendingVerify", JSON.stringify({ userName }));

    try {
      setLoading(true);

      const res = await AuthService.login({ userName, password });
      if (!res?.user || !res?.token) {
        toast.error("Tên người dùng hoặc mật khẩu không hợp lệ.");
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
      toast.success("Đăng nhập thành công!");
      redirectByRole(Number(res.user.roleId));
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = getServerMessage(err);

      if (status === 401 && isUnverifiedMsg(serverMsg)) {
        goVerify(userName);
        return;
      }

      toast.error(serverMsg || "Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập của bạn.");
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
          <h2>Chào mừng trở lại LogisimEdu</h2>
          <p>
            Đăng nhập để truy cập vào các mô phỏng, khóa học hậu cần của bạn, <br />
            và theo dõi tiến độ.
          </p>

          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              onMouseDown={(e) => e.preventDefault()}   // tránh mất focus input
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
                /* eye-off */
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17.9 17.9C16.2 19 14.2 19.7 12 19.7 6.5 19.7 2.3 16 1 12c.6-1.7 1.7-3.3 3.1-4.5M12 4.3c5.5 0 9.7 3.7 11 7.7-.5 1.4-1.2 2.6-2.2 3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                /* eye */
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4.5-7 11-7 11 7 11 7-4.5 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>


          <div className="forgot-password" onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
