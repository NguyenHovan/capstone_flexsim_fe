import "./signup.css";
import illustration from "../../assets/signup.png";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  return (
    <div className="register-container">
      <div className="register-left">
        <img src={illustration} alt="Signup" className="illustration-signup" />
      </div>

      <div className="register-right">
        <div className="form-box">
          <h2>Register for LogiSimEdu</h2>
          <p>
            Let’s get you all set up so you can start learning logistics the
            smart way — with simulation and AI.
          </p>

          <div className="form-grid">
            <input type="text" placeholder="First Name" />
            <input type="text" placeholder="Last Name" />
          </div>

          <div className="form-grid">
            <input type="email" placeholder="Email" />
            <input type="text" placeholder="Phone Number" />
          </div>

          <input type="password" placeholder="Password" />
          <input type="password" placeholder="Confirm Password" />

          <div className="checkbox-row">
            <input type="checkbox" id="agree" />
            <label htmlFor="agree">
              I agree to the <span>Terms</span> and{" "}
              <span>Privacy Policies</span>
            </label>
          </div>

          <button className="create-button">Create Account</button>

          <p className="already-account">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>

          <button className="google-button">
            <GooglePlusOutlined />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
