import { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Modal,
  Form,
  Card,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { AccountService } from "../../../services/account.service";
import { AuthService } from "../../../services/auth.service";
import UploadCloudinary from "../../UploadFile/UploadCloudinary";

const { Title, Text } = Typography;

/* ----------------- Styles ----------------- */
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, rgba(24,144,255,0.08) 0%, rgba(114,46,209,0.08) 100%)",
  padding: 24,
  boxSizing: "border-box",
};

const wrapStyle: React.CSSProperties = {
  maxWidth: 1024,
  margin: "0 auto",
};

const headerCardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 0,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.06)",
};

const headerGradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
  padding: "28px 28px 60px",
  color: "#fff",
  position: "relative",
};

const profileCardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 24,
  marginTop: -48,
  marginBottom: 24,
  boxShadow: "0 12px 30px rgba(24,144,255,0.08), 0 2px 8px rgba(0,0,0,0.04)",
};

const fieldCardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
};

const actionBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = { fontWeight: 600 };

/* ----------------- Component ----------------- */
const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchedOnceRef = useRef<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const fetchUserById = async (id: string) => {
    try {
      setLoadingProfile(true);
      const response = await AccountService.getAccountById(id ?? "");
      formProfile.setFieldsValue({
        email: response.email,
        userName: response.userName,
        fullName: response.fullName,
        phone: response.phone,
        avtUrl: response.avtUrl || "",
      });
      setAvatarUrl(response.avtUrl || "");
      setAvatarDirty(false);
    } catch (error) {
      console.log({ error });
      toast.error("Tải thông tin người dùng thất bại.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const id = user?.id;
    if (!id) return;
    if (fetchedOnceRef.current === String(id)) return;
    fetchedOnceRef.current = String(id);
    fetchUserById(id);
  }, [user?.id]);

  useEffect(() => {
    const current = formProfile.getFieldValue("avtUrl") || "";
    setAvatarDirty(avatarUrl !== current);
  }, [avatarUrl, formProfile]);

  const saveAvatarOnly = async () => {
    if (!user?.id || !avatarDirty) return;
    setSavingAvatar(true);
    try {
      await AccountService.updateAccount(user.id, { avtUrl: avatarUrl });
      await fetchUserById(user.id);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cập nhật ảnh đại diện thất bại.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await formProfile.validateFields();
      if (!user?.id) {
        toast.error("Không xác định được tài khoản.");
        return;
      }
      await AccountService.updateAccount(user.id, {
        ...values,
        email: user.email,
        avtUrl: avatarUrl,
      });
      toast.success("Cập nhật thông tin thành công!");
      fetchUserById(user.id);
      setIsEditing(false);
      setAvatarDirty(false);
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật.");
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
          title: "Bạn có muốn đăng xuất?",
          content: "Đổi mật khẩu thành công. Tiếp tục sử dụng hay đăng xuất?",
          okText: "Đăng xuất",
          cancelText: "Tiếp tục",
          onOk: () => {
            localStorage.clear();
            navigate("/login");
          },
        });
      }, 300);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={wrapStyle}>
        <Card variant="outlined" style={headerCardStyle}>
          <div style={headerGradientStyle}>
            <Row align="middle" gutter={[16, 16]}>
              <Col flex="auto">
                <Title level={3} style={{ color: "#fff", margin: 0 }}>
                  {formProfile.getFieldValue("fullName") || user?.userName}
                </Title>
                <Space size="small" direction="horizontal" style={{ opacity: 0.85 }}>
                  <MailOutlined />
                  <Text style={{ color: "#fff" }}>
                    {formProfile.getFieldValue("email") || "—"}
                  </Text>
                </Space>

                <div style={{ marginTop: 12 }}>
                  <Space size="middle" wrap>
                    <UploadCloudinary value={avatarUrl} onChange={setAvatarUrl} />
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={saveAvatarOnly}
                      disabled={!avatarDirty}
                      loading={savingAvatar}
                    >
                      Lưu ảnh đại diện
                    </Button>
                  </Space>
                </div>
              </Col>

              <Col flex="none">
                <Space wrap size="middle">
                  {isEditing ? (
                    <>
                      <Button
                        type="default"
                        onClick={() => {
                          setIsEditing(false);
                          fetchUserById(user?.id ?? "");
                        }}
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#fff",
                          border: "none",
                          height: 40,
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSaveProfile}
                        icon={<SaveOutlined />}
                        style={{
                          height: 40,
                          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                        }}
                      >
                        Lưu thay đổi
                      </Button>
                    </>
                  ) : (
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      style={{
                        height: 40,
                        background: "#fff",
                        border: "none",
                        color: "#531dab",
                        fontWeight: 600,
                        boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                      }}
                    >
                      Cập nhật thông tin
                    </Button>
                  )}
                  <Button
                    icon={<KeyOutlined />}
                    onClick={handleOpenChangePassword}
                    style={{
                      height: 40,
                      background: "#fff",
                      border: "none",
                      color: "#0958d9",
                      fontWeight: 600,
                      boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          <div style={profileCardStyle}>
            {loadingProfile ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card
                    variant="outlined"
                    style={fieldCardStyle}
                    title="Thông tin tài khoản"
                    styles={{
                      header: { borderBottom: "none", paddingBottom: 0 },
                      body: { paddingTop: 12 },
                    }}
                  >
                    <Form form={formProfile} layout="vertical" disabled={!isEditing}>
                      <Form.Item
                        label={<span style={labelStyle}>Email</span>}
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="ban@example.com"
                          disabled
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={labelStyle}>Tên đăng nhập</span>}
                        name="userName"
                        rules={[
                          { required: true, message: "Vui lòng nhập tên đăng nhập" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="ten_dang_nhap"
                        />
                      </Form.Item>

                      {/* hidden avtUrl to compare dirty state */}
                      <Form.Item name="avtUrl" hidden>
                        <Input />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    variant="outlined"
                    style={fieldCardStyle}
                    title="Thông tin cá nhân"
                    styles={{
                      header: { borderBottom: "none", paddingBottom: 0 },
                      body: { paddingTop: 12 },
                    }}
                  >
                    <Form form={formProfile} layout="vertical" disabled={!isEditing}>
                      <Form.Item
                        label={<span style={labelStyle}>Họ và tên</span>}
                        name="fullName"
                        rules={[
                          { required: true, message: "Vui lòng nhập họ và tên" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="Họ và tên"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={labelStyle}>Số điện thoại</span>}
                        name="phone"
                        rules={[
                          { required: true, message: "Vui lòng nhập số điện thoại" },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="0987 654 321"
                        />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              </Row>
            )}

            {!isEditing && !loadingProfile && (
              <>
                <Divider style={{ margin: "24px 0" }} />
                <div style={actionBarStyle}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    type="primary"
                    style={{ height: 40 }}
                  >
                    Cập nhật thông tin
                  </Button>
                  <Button
                    icon={<KeyOutlined />}
                    onClick={handleOpenChangePassword}
                    style={{ height: 40 }}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        <Modal
          title="Đổi mật khẩu"
          open={isModalVisible}
          onCancel={handleCloseChangePassword}
          onOk={handleChangePassword}
          confirmLoading={loading}
          okText="Đổi mật khẩu"
          cancelText="Hủy"
          styles={{
            header: { borderBottom: "none", paddingBottom: 8 },
            content: { borderRadius: 16 },
            mask: { backdropFilter: "blur(2px)" },
          }}
        >
          <Form layout="vertical" form={formPassword}>
            <Form.Item
              label={<span style={labelStyle}>Mật khẩu hiện tại</span>}
              name="currentPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
              <Input.Password placeholder="Mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
              label={<span style={labelStyle}>Mật khẩu mới</span>}
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>
            <Form.Item
              label={<span style={labelStyle}>Xác nhận mật khẩu mới</span>}
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value)
                      return Promise.resolve();
                    return Promise.reject(
                      new Error("Xác nhận mật khẩu mới không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;
