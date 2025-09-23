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
      toast.warning("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    try {
      setLoading(true);
      await AuthService.forgotPassword({ email: e });
      toast.success("Chúng tôi đã gửi liên kết đặt lại đến email của bạn. Vui lòng kiểm tra hộp thư đến.");

      // // 👉 Điều hướng sang trang reset-password để người dùng dán link/token
      // navigate(`/reset-password?sent=1&email=${encodeURIComponent(e)}`);
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Nhập vào đây") handleSubmit();
  };

  const isValid = emailRegex.test(email.trim());

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <div className="forgot-left">
          <button className="back" onClick={() => navigate("/login")}>
            ← Quay lại trang Đăng Nhập
          </button>

          <h2>Quên mật khẩu?</h2>
          <p>Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.</p>

          <input
            type="email"
            placeholder="Địa chỉ Email"
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
            {loading ? "Sending..." : "Gửi liên kết đặt lại"}
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
