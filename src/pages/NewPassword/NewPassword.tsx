import { useState } from "react";
import "./new-password.css";

const NewPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    console.log("Mật khẩu mới:", password);
    alert("Đổi mật khẩu thành công!");
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="custom-wrapper">
      <div className="custom-form-box">
        <h2>Đặt mật khẩu mới</h2>
        <p>Vui lòng nhập mật khẩu mới của bạn bên dưới.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-button">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
