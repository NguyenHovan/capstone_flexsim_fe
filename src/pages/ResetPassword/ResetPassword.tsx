import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { AccountService } from "../../services/account.service";
import "./reset-password.css";

const { Title, Text } = Typography;

const PasswordChecklist: React.FC<{ value: string }> = ({ value }) => {
  const ok = {
    len: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    num: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
  const Item = (b: boolean, label: string) => (
    <li className={`rp-item ${b ? "ok" : "bad"}`}>{label}</li>
  );
  return (
    <ul className="rp-checklist">
      {Item(ok.len, "Minimum 8 characters")}
      {Item(ok.upper, "One uppercase")}
      {Item(ok.lower, "One lowercase")}
      {Item(ok.num, "One number")}
      {Item(ok.special, "One special character")}
    </ul>
  );
};

type FormValues = { newPassword: string; confirmPassword: string };

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const newValue = Form.useWatch("newPassword", form) ?? "";
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (v: FormValues) => {
    if (!token) {
      message.error("Invalid or missing reset token.");
      return;
    }
    if (v.newPassword !== v.confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await AccountService.resetPassword({ token, newPassword: v.newPassword })
      message.success("Password has been reset successfully.");
      navigate("/login");
    } catch (e: any) {
      message.error(e?.message || "Reset password failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-wrapper">
      <Card className="rp-card" bordered={false}>
        <Title level={3} className="rp-title">Reset Password</Title>

        {!token && (
          <Text type="danger" style={{ display: "block", textAlign: "center", marginBottom: 12 }}>
            The reset link is invalid or expired. Please request a new one.
          </Text>
        )}

        <Form<FormValues> layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label={<Text strong>New password</Text>}
            rules={[{ required: true, message: "Required" }, { min: 8, message: "At least 8 characters" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <PasswordChecklist value={newValue} />

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Confirm new password</Text>}
            dependencies={["newPassword"]}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block disabled={!token} loading={loading}>
            Change Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;