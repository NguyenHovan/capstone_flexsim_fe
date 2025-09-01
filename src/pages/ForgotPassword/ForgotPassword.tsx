import "./forgot-password.css";
import lockImage from "../../assets/forgot.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { AuthService } from "../../services/auth.service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const e = email.trim();
    if (!emailRegex.test(e)) {
      toast.warning("Please enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      await AuthService.forgotPassword({ email: e });
      toast.success("We’ve sent a reset link to your email. Please check your inbox.");

      // 👉 Điều hướng sang trang reset-password để người dùng dán link/token
      navigate(`/reset-password?sent=1&email=${encodeURIComponent(e)}`);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") handleSubmit();
  };

  const isValid = emailRegex.test(email.trim());

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <div className="forgot-left">
          <button className="back" onClick={() => navigate("/login")}>
            ← Back to Login
          </button>

          <h2>Forgot your password?</h2>
          <p>Enter your email and we’ll email you a link to reset your password.</p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Email address"
          />

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            aria-disabled={loading || !isValid}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>

        <div className="forgot-right">
          <img src={lockImage} alt="Reset password illustration" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
