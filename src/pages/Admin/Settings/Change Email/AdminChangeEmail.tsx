import React from "react";
import { Card, Form, Input, Button, Typography, Space, message, Descriptions } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { AccountService } from "../../../../services/account.service";
import "./changeEmail.css";

const { Title, Text } = Typography;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormValues = {
  newEmail: string;
  password: string;
  code: string;
};

const AdminChangeEmail: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [sent, setSent] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [loadingSend, setLoadingSend] = React.useState(false);
  const [loadingConfirm, setLoadingConfirm] = React.useState(false);
  const [currentEmail, setCurrentEmail] = React.useState<string>("");

  // Hiển thị email hiện tại từ localStorage để người dùng dễ nhận diện
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      const me = raw ? JSON.parse(raw) : null;
      setCurrentEmail(me?.email || "");
    } catch {
      setCurrentEmail("");
    }
  }, []);

  // Đếm ngược cho nút gửi lại
  React.useEffect(() => {
    if (!sent || count <= 0) return;
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [sent, count]);

  const onSendCode = async () => {
    try {
      const v = await form.validateFields(["newEmail", "password"]);
      if (!EMAIL_RE.test(v.newEmail)) {
        message.error("Vui lòng nhập email hợp lệ.");
        return;
      }
      setLoadingSend(true);
      await AccountService.requestChangeEmail({
        newEmail: v.newEmail,
        password: v.password,
      });
      message.success("Mã xác minh đã được gửi tới email mới của bạn.");
      setSent(true);
      setCount(60); // cooldown 60s
    } catch (e: any) {
      message.error(e?.message || "Gửi mã xác minh thất bại.");
    } finally {
      setLoadingSend(false);
    }
  };

  const onConfirm = async () => {
    try {
      const v = await form.validateFields(["code", "newEmail"]);
      setLoadingConfirm(true);
      await AccountService.confirmChangeEmail(v.code);
      message.success("Đổi email thành công!");

      // Cập nhật localStorage để UI phản chiếu ngay
      try {
        const raw = localStorage.getItem("currentUser");
        if (raw) {
          const me = JSON.parse(raw);
          localStorage.setItem("currentUser", JSON.stringify({ ...me, email: v.newEmail }));
          setCurrentEmail(v.newEmail);
        }
      } catch {}

      // Reset trạng thái form/code
      form.resetFields(["password", "code"]);
      setSent(false);
      setCount(0);
    } catch (e: any) {
      message.error(e?.message || "Xác minh mã thất bại.");
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="ce-wrapper">
      <Card bordered={false} className="ce-card">
        <Title level={3} className="ce-title">Đổi email</Title>

        {currentEmail && (
          <Descriptions size="small" column={1} className="ce-desc">
            <Descriptions.Item label="Email hiện tại">{currentEmail}</Descriptions.Item>
          </Descriptions>
        )}

        <Form<FormValues> form={form} layout="vertical" className="ce-form">
          <Form.Item
            name="newEmail"
            label={<Text strong>Email mới</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              {
                validator: (_, v) =>
                  !v || EMAIL_RE.test(v)
                    ? Promise.resolve()
                    : Promise.reject(new Error("Email không hợp lệ")),
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="email.moi@vidu.com"
              disabled={sent && count > 0}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Mật khẩu hiện tại</Text>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={sent && count > 0}
            />
          </Form.Item>

          <Space className="ce-actions">
            <Button
              type="primary"
              onClick={onSendCode}
              loading={loadingSend}
              icon={<SafetyCertificateOutlined />}
              disabled={count > 0}
            >
              {count > 0 ? `Gửi lại sau ${count}s` : "Gửi mã xác minh"}
            </Button>
            {count > 0 && (
              <Button onClick={() => setCount(0)} icon={<RedoOutlined />}>
                Bật gửi lại ngay
              </Button>
            )}
          </Space>

          {sent && (
            <>
              <Form.Item
                name="code"
                label={<Text strong>Mã xác minh</Text>}
                rules={[{ required: true, message: "Vui lòng nhập mã được gửi tới email của bạn" }]}
                style={{ marginTop: 16 }}
              >
                <Input maxLength={8} placeholder="vd: 174444" />
              </Form.Item>

              <Button
                type="primary"
                block
                size="large"
                onClick={onConfirm}
                loading={loadingConfirm}
              >
                Xác nhận đổi email
              </Button>
            </>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default AdminChangeEmail;
