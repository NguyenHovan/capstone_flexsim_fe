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
      toast.warning("Session expired. Please login again.");
      navigate("/login", { replace: true });
      return;
    }
    setUserName(data.userName);
  }, [navigate]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.warning("Please enter the verification code.");
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
      toast.success("Email verified successfully! Please login again.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Invalid or expired code.";
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    try {
      await AuthService.resendVerify(userName); 
      toast.success("Verification code has been resent.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Failed to resend code.";
      toast.error(msg);
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        <div className="verify-left">
          <span className="back" onClick={() => navigate("/login")}>&larr; Back to Login</span>
          <h2>Verify code</h2>
          <p>An authentication code has been sent to your email.</p>

          <input
            type="text"
            placeholder="Enter code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />

          <p className="resend-text">
            Didn’t receive a code? <span className="resend" onClick={handleResend}>Resend</span>
          </p>

          <button className="verify-btn" onClick={handleVerify}>Verify</button>
        </div>
        <div className="verify-right">
          <img src={verifyImg} alt="Verify" />
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;
