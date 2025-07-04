import { useState, useEffect } from "react";
import { Input, Button, Modal, Form, Card, Space } from "antd";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { AuthService } from "../../services/auth.service";
import { AccountService } from "../../services/account.service";
import { useNavigate } from "react-router-dom";
import "./profile.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      formProfile.setFieldsValue({
        email: user.email,
        userName: user.userName,
        fullName: user.fullName,
        phone: user.phone,
      });
    }
  }, [user, formProfile]);

  const handleSaveProfile = async () => {
    try {
      const values = await formProfile.validateFields();
      if (!user?.id) {
        toast.error("Không xác định được tài khoản.");
        return;
      }

      await AccountService.updateAccount(user.id, values);
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
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

      setTimeout(() => {
        Modal.confirm({
          title: "Bạn muốn đăng xuất không?",
          content: "Đổi mật khẩu thành công. Tiếp tục sử dụng hay đăng xuất?",
          okText: "Đăng xuất",
          cancelText: "Tiếp tục",
          onOk: () => {
            localStorage.clear();
            navigate("/login");
          },
        });
      }, 300);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Card title="Thông tin cá nhân" bordered={false}>
        <Form form={formProfile} layout="vertical" disabled={!isEditing}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên người dùng"
            name="userName"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
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
