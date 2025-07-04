import { useState } from "react";
import "./signup.css";
import illustration from "../../assets/signup.png";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service"; // đường dẫn đúng
import { message } from "antd";
import { toast } from "sonner";

const SignUpPage = () => {
  const navigate = useNavigate();

  // State lưu thông tin người dùng
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.agree) {
      message.warning("You must agree to the terms and privacy policies.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    const payload = {
      userName: form.email.split("@")[0],
      fullName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    try {
      await AuthService.register(payload);
      toast.success("Verify Email!");
      // navigate("/login");
    } catch (error) {
      message.error("Registration failed!");
      console.error(error);
    }
  };

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
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="agree"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <label htmlFor="agree">
              I agree to the <span>Terms</span> and{" "}
              <span>Privacy Policies</span>
            </label>
          </div>

          <button className="create-button" onClick={handleSubmit}>
            Create Account
          </button>

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
