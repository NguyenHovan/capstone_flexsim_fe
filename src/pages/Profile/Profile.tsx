import { useState } from "react";
import { Input, Button, Modal, Form, Card, Space } from "antd";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { AuthService } from "../../services/auth.service";
import "./profile.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const values = await formProfile.validateFields();
      console.log({ values });
      //   const response = await AuthService.updateProfile(values);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật.");
    }
  };

  const handleOpenChangePassword = () => setIsModalVisible(true);
  const handleCloseChangePassword = () => {
    setIsModalVisible(false);
    formPassword.resetFields();
  };

  const handleChangePassword = async () => {
    try {
      const values = await formPassword.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        toast.error("Mật khẩu mới không khớp.");
        return;
      }

      setLoading(true);
      await AuthService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setIsModalVisible(false);
      formPassword.resetFields();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Card title="Thông tin cá nhân" bordered={false}>
        <Form
          form={formProfile}
          layout="vertical"
          initialValues={{
            email: user?.email,
            userName: user?.userName,
            fullName: user?.fullName,
          }}
          disabled={!isEditing}
        >
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Username" name="userName">
            <Input />
          </Form.Item>
          <Form.Item label="Họ và tên" name="fullName">
            <Input />
          </Form.Item>
        </Form>

        <Space style={{ marginTop: 16 }}>
          {isEditing ? (
            <Button type="primary" onClick={handleSaveProfile}>
              Lưu thay đổi
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Cập nhật thông tin
            </Button>
          )}
          <Button onClick={handleOpenChangePassword}>Đổi mật khẩu</Button>
        </Space>
      </Card>

      <Modal
        title="Đổi mật khẩu"
        open={isModalVisible}
        onCancel={handleCloseChangePassword}
        onOk={handleChangePassword}
        confirmLoading={loading}
        okText="Đổi mật khẩu"
        cancelText="Huỷ"
      >
        <Form layout="vertical" form={formPassword}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
