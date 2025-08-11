import { useEffect, useRef, useState } from "react";
import {
  Card,
  Avatar,
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Select,
} from "antd";
import { AccountService } from "../../services/account.service";
import { toast } from "sonner";
import { UploadService } from "../../services/uploadClousdinary.service";

const { Option } = Select;

const About = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [user, setUser] = useState({
    avatar: "",
    fullName: "",
    password: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const { id: userId, roleId, organizationId, userName } = currentUser;

  useEffect(() => {
    if (userId) {
      AccountService.getAccountById(userId)
        .then((res: any) => {
          setUser(res);
          setAvatarUrl(res.avtUrl || "");
          form.setFieldsValue(res);
        })
        .catch(() => {
          message.error("Không thể tải thông tin user");
        });
    }
  }, [userId, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload thật sự
    try {
      const url = await UploadService.uploadImage(file);
      setAvatarUrl(url);
      toast.success("Tải ảnh thành công");
    } catch {
      toast.error("Tải ảnh thất bại");
    }
  };

  const handleUpdate = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        userName,
        organizationId,
        roleId,
        avtUrl: avatarUrl,
        password: user?.password,
      };
      await AccountService.updateAccount(userId, payload);
      toast.success("Cập nhật thành công!");
    } catch {
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

        {/* Click vào avatar để upload */}
        <div
          style={{
            display: "inline-block",
            cursor: "pointer",
            marginTop: 10,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar
            src={avatarUrl || "/avatar.png"}
            size={80}
            style={{ border: "2px solid #ccc" }}
          />
        </div>

        {/* Input file hidden */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
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
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  { required: true, message: "Please field address required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Full name">
                <Input />
              </Form.Item>
              <Form.Item name="gender" label="Gender">
                <Select>
                  <Option value={0}>Male</Option>
                  <Option value={1}>Female</Option>
                  <Option value={2}>Other</Option>
                </Select>
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
