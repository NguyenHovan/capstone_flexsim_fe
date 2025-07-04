import "./forgot-password.css";
import lockImage from "../../assets/forgot.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { AuthService } from "../../services/auth.service";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      toast.warning("Please enter your email.");
      return;
    }
    try {
      await AuthService.forgotPassword({ email });
      toast.success("Verification code sent to your email!");
      navigate("/verify-code");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <div className="forgot-left">
          <span className="back" onClick={() => navigate("/login")}>
            &larr; Back to Login
          </span>
          <h2>Forgot your password?</h2>
          <p>
            Don’t worry, happens to all of us. Enter your email below to recover
            your password
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div className="forgot-right">
          <img src={lockImage} alt="Lock illustration" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
