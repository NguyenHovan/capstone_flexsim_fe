import { useState } from "react";
import "./signup.css";
import illustration from "../../assets/signup.png";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { Modal, Input } from "antd";
import { toast } from "sonner";

const SignUpPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const {
      userName,
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      agree,
    } = form;

    if (!agree) return toast.warning("Bạn cần đồng ý với điều khoản.");
    if (
      !userName ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    )
      return toast.error("Vui lòng điền đầy đủ thông tin.");
    if (password !== confirmPassword)
      return toast.error("Mật khẩu xác nhận không khớp.");

  
  };

  const handleVerifyOtp = async () => {
    try {
      await AuthService.verifyEmail(otp);
      toast.success("Xác thực email thành công!");
      setIsOtpModalOpen(false);
      navigate("/login");
    } catch (error) {
      toast.error("Mã OTP không hợp lệ!");
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

          <input
            type="text"
            placeholder="Username"
            name="userName"
            value={form.userName}
            onChange={handleChange}
          />

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

      <Modal
        title="Xác thực Email"
        open={isOtpModalOpen}
        onOk={handleVerifyOtp}
        onCancel={() => setIsOtpModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Vui lòng nhập mã OTP đã gửi qua email:</p>
        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập mã OTP"
        />
      </Modal>
    </div>
  );
};

export default SignUpPage;
