import { Form, Input, Button, Card, Row, Col } from "antd";
import { useState } from "react";

const Setting = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Giá trị form:", values);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alert("Lưu cài đặt thành công!");
      }, 1000);
    } catch (err) {
      console.log("Xác thực không hợp lệ:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
  };

  return (
    <Card
      title="Cài đặt tài khoản"
      style={{
        maxWidth: 600,
        margin: "0 auto",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Tên đăng nhập" name="username">
          <Input placeholder="Nhập tên đăng nhập" />
        </Form.Item>

        <Form.Item label="Họ và tên" name="fullname">
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item label="Tổ chức" name="organization">
          <Input placeholder="Nhập tên tổ chức" />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input type="email" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input placeholder="Ví dụ: 0987 654 321" />
        </Form.Item>

        <Form.Item label="Ảnh đại diện (URL)" name="avatarUrl">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender">
          <Input placeholder="Nam/Nữ/Khác" />
        </Form.Item>

        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={handleCancel} danger>
              Hủy
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              style={{ background: "#00796B", borderColor: "#00796B" }}
            >
              Lưu
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Setting;
