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
      toast.error("Failed to load user information.");
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
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update avatar.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await formProfile.validateFields();
      if (!user?.id) {
        toast.error("Account not identified.");
        return;
      }
      await AccountService.updateAccount(user.id, {
        ...values,
        email: user.email,
        avtUrl: avatarUrl, 
      });
      toast.success("Information updated successfully!");
      fetchUserById(user.id);
      setIsEditing(false);
      setAvatarDirty(false);
    } catch (error) {
      toast.error("An error occurred while updating.");
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
        toast.error("New password does not match.");
        return;
      }
      setLoading(true);
      await AuthService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully!");
      setIsModalVisible(false);
      formPassword.resetFields();
      setTimeout(() => {
        Modal.confirm({
          title: "Do you want to log out?",
          content: "Password changed successfully. Continue using or log out?",
          okText: "Logout",
          cancelText: "Continue",
          onOk: () => {
            localStorage.clear();
            navigate("/login");
          },
        });
      }, 300);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={wrapStyle}>
        <Card  variant="outlined" style={headerCardStyle}>
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
                      Save Avatar
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
                        Cancel
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
                        Save changes
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
                      Update information
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
                    Change password
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
  title="Account information"
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
                          { required: true, message: "Please enter email" },
                          { type: "email", message: "Invalid email" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="you@example.com"
                          disabled
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={labelStyle}>User name</span>}
                        name="userName"
                        rules={[
                          { required: true, message: "Please enter username" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="username"
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
  title="Account information"
  styles={{
    header: { borderBottom: "none", paddingBottom: 0 },
    body: { paddingTop: 12 },
  }}
>
                    <Form form={formProfile} layout="vertical" disabled={!isEditing}>
                      <Form.Item
                        label={<span style={labelStyle}>Full Name</span>}
                        name="fullName"
                        rules={[
                          { required: true, message: "Please enter your full name" },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
                          placeholder="Full Name"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={labelStyle}>Phone</span>}
                        name="phone"
                        rules={[
                          { required: true, message: "Please enter your phone" },
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
                    Update information
                  </Button>
                  <Button
                    icon={<KeyOutlined />}
                    onClick={handleOpenChangePassword}
                    style={{ height: 40 }}
                  >
                    Change password
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        <Modal
          title="Change password"
          open={isModalVisible}
          onCancel={handleCloseChangePassword}
          onOk={handleChangePassword}
          confirmLoading={loading}
          okText="Change password"
          cancelText="Cancel"
          styles={{
            header: { borderBottom: "none", paddingBottom: 8 },
            content: { borderRadius: 16 },
            mask: { backdropFilter: "blur(2px)" },
          }}
        >
          <Form layout="vertical" form={formPassword}>
            <Form.Item
              label={<span style={labelStyle}>Current Password</span>}
              name="currentPassword"
              rules={[{ required: true, message: "Please enter current password" }]}
            >
              <Input.Password placeholder="Current Password" />
            </Form.Item>
            <Form.Item
              label={<span style={labelStyle}>New Password</span>}
              name="newPassword"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 6, message: "Minimum 6 characters" },
              ]}
            >
              <Input.Password placeholder="New Password" />
            </Form.Item>
            <Form.Item
              label={<span style={labelStyle}>Confirm new password</span>}
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value)
                      return Promise.resolve();
                    return Promise.reject(
                      new Error("Confirm new password does not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Re-enter new password" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;
