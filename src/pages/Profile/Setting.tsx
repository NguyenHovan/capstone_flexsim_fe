import { Form, Input, Button, Card, Row, Col } from "antd";
import { useState } from "react";

const Setting = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alert("Saved successfully!");
      }, 1000);
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
  };

  return (
    <Card
      title="Account Settings"
      style={{
        maxWidth: 600,
        margin: "0 auto",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Username" name="username">
          <Input />
        </Form.Item>

        <Form.Item label="Fullname" name="fullname">
          <Input />
        </Form.Item>

        <Form.Item label="Organization" name="organization">
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input type="email" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        {/* Optional: Thêm các trường bạn ghi chú */}
        <Form.Item label="Avatar URL" name="avatarUrl">
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

        <Form.Item label="Gender" name="gender">
          <Input />
        </Form.Item>

        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={handleCancel} danger>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              style={{ background: "#00796B", borderColor: "#00796B" }}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Setting;
