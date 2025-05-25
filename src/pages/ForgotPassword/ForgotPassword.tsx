import "./forgot-password.css";
import lockImage from "../../assets/forgot.png";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
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
          <input type="email" placeholder="Email" />
          <button
            className="submit-btn"
            onClick={() => navigate("/verify-code")}
          >
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
