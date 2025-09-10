import "./verify-code.css";
import verifyImg from "../../assets/verify.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthService } from "../../services/auth.service";
import { toast } from "sonner";

const VerifyCodePage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingVerify");
    const data = raw ? JSON.parse(raw) : null;
    if (!data?.userName) {
      toast.warning("Phiên xác thực đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
      return;
    }
    setUserName(data.userName);
  }, [navigate]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.warning("Vui lòng nhập mã xác thực.");
      return;
    }
    try {
      await AuthService.verifyEmail(otp.trim());
      const rawU = localStorage.getItem("currentUser");
      if (rawU) {
        try {
          const u = JSON.parse(rawU);
          u.isEmailVerify = true;
          localStorage.setItem("currentUser", JSON.stringify(u));
        } catch {}
      }
      sessionStorage.removeItem("pendingVerify");
      toast.success("Xác thực email thành công! Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Mã xác thực không hợp lệ hoặc đã hết hạn.";
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    try {
      await AuthService.resendVerify(userName);
      toast.success("Mã xác thực đã được gửi lại.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Gửi lại mã thất bại.";
      toast.error(msg);
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        <div className="verify-left">
          <span className="back" onClick={() => navigate("/login")}>
            &larr; Quay lại đăng nhập
          </span>
          <h2>Xác minh mã</h2>
          <p>Một mã xác thực đã được gửi tới email của bạn.</p>

          <input
            type="text"
            placeholder="Nhập mã xác thực"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />

          <p className="resend-text">
            Chưa nhận được mã?{" "}
            <span className="resend" onClick={handleResend}>
              Gửi lại
            </span>
          </p>

          <button className="verify-btn" onClick={handleVerify}>
            Xác minh
          </button>
        </div>
        <div className="verify-right">
          <img src={verifyImg} alt="Xác minh" />
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;
