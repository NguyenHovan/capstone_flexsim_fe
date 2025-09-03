import React from "react";
import {
  Card, Form, Input, Button, Typography, message,
} from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { AccountService } from "../../../../services/account.service";
import "./changePassword.css";

const { Title, Text } = Typography;

const Checklist: React.FC<{ value: string }> = ({ value }) => {
  const rule = {
    len: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    num: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
  const Row = (ok: boolean, label: string) => (
    <li className={`cp-item ${ok ? "ok" : "bad"}`}>
      {ok ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <CloseCircleTwoTone twoToneColor="#ff4d4f" />
      )}
      <span>{label}</span>
    </li>
  );
  return (
    <ul className="cp-checklist">
      {Row(rule.len, "Minimum 8 characters")}
      {Row(rule.upper, "One uppercase character")}
      {Row(rule.lower, "One lowercase character")}
      {Row(rule.special, "One special character")}
      {Row(rule.num, "One number")}
    </ul>
  );
};

const AdminChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const newValue = Form.useWatch("newPassword", form) || "";

  const onFinish = async (v: any) => {
    if (v.newPassword !== v.confirmPassword) {
      message.error("Confirm password does not match");
      return;
    }
    try {
      setLoading(true);
      await AccountService.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      message.success("Password updated");
      form.resetFields();
    } catch (e: any) {
      message.error(e?.message || "Change password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-wrapper">
      <Card className="cp-card" variant="outlined">
        <Title level={3} className="cp-title">Change Password</Title>

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label={<Text strong>Old Password</Text>}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<Text strong>New Password</Text>}
            rules={[
              { required: true, message: "Required" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>

          <Checklist value={newValue} />

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Confirm New Password</Text>}
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Change Password
          </Button>
        </Form>

        <Link className="cp-forgot" to="/forgot-password">Forgot Password?</Link>
      </Card>
    </div>
  );
};

export default AdminChangePassword;
