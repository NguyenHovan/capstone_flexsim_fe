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

const OrgAdminChangeEmail: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [sent, setSent] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [loadingSend, setLoadingSend] = React.useState(false);
  const [loadingConfirm, setLoadingConfirm] = React.useState(false);
  const [currentEmail, setCurrentEmail] = React.useState<string>("");

  // show current email từ localStorage để người dùng dễ nhận diện
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      const me = raw ? JSON.parse(raw) : null;
      setCurrentEmail(me?.email || "");
    } catch {
      setCurrentEmail("");
    }
  }, []);

  // đếm ngược nút resend
  React.useEffect(() => {
    if (!sent || count <= 0) return;
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [sent, count]);

  const onSendCode = async () => {
    try {
      const v = await form.validateFields(["newEmail", "password"]);
      if (!EMAIL_RE.test(v.newEmail)) {
        message.error("Please enter a valid email.");
        return;
      }
      setLoadingSend(true);
      await AccountService.requestChangeEmail({
        newEmail: v.newEmail,
        password: v.password,
      });
      message.success("Verification code has been sent to your new email.");
      setSent(true);
      setCount(60); // cooldown 60s
    } catch (e: any) {
      message.error(e?.message || "Failed to send verification code.");
    } finally {
      setLoadingSend(false);
    }
  };

  const onConfirm = async () => {
    try {
      const v = await form.validateFields(["code", "newEmail"]);
      setLoadingConfirm(true);
      await AccountService.confirmChangeEmail(v.code);
      message.success("Email changed successfully!");

      // cập nhật localStorage để UI phản chiếu ngay
      try {
        const raw = localStorage.getItem("currentUser");
        if (raw) {
          const me = JSON.parse(raw);
          localStorage.setItem("currentUser", JSON.stringify({ ...me, email: v.newEmail }));
          setCurrentEmail(v.newEmail);
        }
      } catch {}

      // reset trạng thái form/code
      form.resetFields(["password", "code"]);
      setSent(false);
      setCount(0);
    } catch (e: any) {
      message.error(e?.message || "Confirm code failed.");
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="ce-wrapper">
      <Card bordered={false} className="ce-card">
        <Title level={3} className="ce-title">Change Email</Title>

        {currentEmail && (
          <Descriptions size="small" column={1} className="ce-desc">
            <Descriptions.Item label="Current email">{currentEmail}</Descriptions.Item>
          </Descriptions>
        )}

        <Form<FormValues> form={form} layout="vertical" className="ce-form">
          <Form.Item
            name="newEmail"
            label={<Text strong>New email</Text>}
            rules={[
              { required: true, message: "Email is required" },
              {
                validator: (_, v) =>
                  !v || EMAIL_RE.test(v) ? Promise.resolve() : Promise.reject(new Error("Invalid email")),
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.new@email.com"
              disabled={sent && count > 0}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Current password</Text>}
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Your current password"
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
              {count > 0 ? `Resend in ${count}s` : "Send verification code"}
            </Button>
            {count > 0 && (
              <Button onClick={() => setCount(0)} icon={<RedoOutlined />}>
                Enable Resend
              </Button>
            )}
          </Space>

          {sent && (
            <>
              <Form.Item
                name="code"
                label={<Text strong>Verification code</Text>}
                rules={[{ required: true, message: "Please enter the code sent to your email" }]}
                style={{ marginTop: 16 }}
              >
                <Input maxLength={8} placeholder="e.g. 174444" />
              </Form.Item>

              <Button
                type="primary"
                block
                size="large"
                onClick={onConfirm}
                loading={loadingConfirm}
              >
                Confirm Change Email
              </Button>
            </>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default OrgAdminChangeEmail;
