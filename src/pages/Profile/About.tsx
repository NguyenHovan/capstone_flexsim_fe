import { useEffect, useState } from "react";
import { Card, Avatar, Row, Col, Form, Input, Button, message } from "antd";
import { AccountService } from "../../services/account.service";
import { toast } from "sonner";

const About = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const { id: userId, roleId, organizationId, userName } = currentUser;

  useEffect(() => {
    if (userId) {
      AccountService.getAccountById(userId)
        .then((res) => {
          setUser(res);
          form.setFieldsValue(res);
        })
        .catch(() => {
          message.error("Không thể tải thông tin user");
        });
    }
  }, [userId, form]);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        userName,
        organizationId,
        roleId,
      };
      await AccountService.updateAccount(userId, payload);
      toast.success("Cập nhật thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại!");
    }
    setLoading(false);
  };

  return (
    <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12 }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#e0e0e0",
          textAlign: "center",
          padding: "20px 0",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 500 }}>
          Welcome to LogiSimEdu, {user?.fullName}
        </div>
        <Avatar
          src={user?.avatar || "/avatar.png"}
          size={80}
          style={{ marginTop: 10 }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "24px 32px" }}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={[32, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Full name">
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Password">
                <Input.Password placeholder="Nhập mật khẩu mới (nếu muốn đổi)" />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật
          </Button>
        </Form>
      </div>
    </Card>
  );
};

export default About;
