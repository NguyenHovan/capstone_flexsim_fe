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
      {Row(rule.len, "Tối thiểu 8 ký tự")}
      {Row(rule.upper, "Ít nhất 1 chữ hoa")}
      {Row(rule.lower, "Ít nhất 1 chữ thường")}
      {Row(rule.special, "Ít nhất 1 ký tự đặc biệt")}
      {Row(rule.num, "Ít nhất 1 chữ số")}
    </ul>
  );
};

const AdminChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const newValue = Form.useWatch("newPassword", form) || "";

  const onFinish = async (v: any) => {
    if (v.newPassword !== v.confirmPassword) {
      message.error("Xác nhận mật khẩu không khớp");
      return;
    }
    try {
      setLoading(true);
      await AccountService.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      form.resetFields();
    } catch (e: any) {
      message.error(e?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-wrapper">
      <Card className="cp-card" variant="outlined">
        <Title level={3} className="cp-title">Đổi mật khẩu</Title>

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label={<Text strong>Mật khẩu hiện tại</Text>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<Text strong>Mật khẩu mới</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Ít nhất 8 ký tự" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>

          <Checklist value={newValue} />

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Xác nhận mật khẩu mới</Text>}
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form>

        <Link className="cp-forgot" to="/forgot-password">Quên mật khẩu?</Link>
      </Card>
    </div>
  );
};

export default AdminChangePassword;
