import "./verify-code.css";
import verifyImg from "../../assets/verify.png";
import { useNavigate } from "react-router-dom";

const VerifyCodePage = () => {
  const navigate = useNavigate();
  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        <div className="verify-left">
          <span className="back" onClick={() => navigate("/login")}>
            &larr; Back to Login
          </span>
          <h2>Verify code</h2>
          <p>An authentication code has been sent to your email.</p>
          <input type="text" placeholder="Enter code" />
          <p className="resend-text">
            Didn’t receive a code? <span className="resend">Resend</span>
          </p>
          <button className="verify-btn">Verify</button>
        </div>
        <div className="verify-right">
          <img src={verifyImg} alt="Verify" />
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;
