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
      {Item(ok.len, "Tối thiểu 8 ký tự")}
      {Item(ok.upper, "Ít nhất 1 chữ hoa")}
      {Item(ok.lower, "Ít nhất 1 chữ thường")}
      {Item(ok.num, "Ít nhất 1 chữ số")}
      {Item(ok.special, "Ít nhất 1 ký tự đặc biệt")}
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
      message.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }
    if (v.newPassword !== v.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setLoading(true);
      await AccountService.resetPassword({ token, newPassword: v.newPassword });
      message.success("Đặt lại mật khẩu thành công.");
      navigate("/login");
    } catch (e: any) {
      message.error(e?.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-wrapper">
      <Card className="rp-card" bordered={false}>
        <Title level={3} className="rp-title">Đặt lại mật khẩu</Title>

        {!token && (
          <Text type="danger" style={{ display: "block", textAlign: "center", marginBottom: 12 }}>
            Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.
          </Text>
        )}

        <Form<FormValues> layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label={<Text strong>Mật khẩu mới</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Tối thiểu 8 ký tự" },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <PasswordChecklist value={newValue} />

          <Form.Item
            name="confirmPassword"
            label={<Text strong>Xác nhận mật khẩu mới</Text>}
            dependencies={["newPassword"]}
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block disabled={!token} loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
