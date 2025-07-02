import { useState } from "react";
import "./new-password.css";

const NewPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    console.log("New Password:", password);
    alert("Password changed successfully!");
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="custom-wrapper">
      <div className="custom-form-box">
        <h2>Set New Password</h2>
        <p>Please enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
