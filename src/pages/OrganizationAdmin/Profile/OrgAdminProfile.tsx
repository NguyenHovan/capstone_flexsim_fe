import { useEffect, useState } from "react";
import {
  Card, Avatar, Row, Col, Form, Input, Button, message, Select
} from "antd";
import { AccountService } from "../../../services/account.service";
import { toast } from "sonner";
import UploadCloudinary from "../../UploadFile/UploadCloudinary";

type GenderUI = 1 | 2 | 3; 

function toUiGender(beGender?: number | null): GenderUI {
  if (typeof beGender !== "number") return 1;
  if (beGender === 0 || beGender === 1 || beGender === 2) return (beGender + 1) as GenderUI;
  if (beGender === 1 || beGender === 2 || beGender === 3) return beGender as GenderUI;
  return 1;
}

function toBeGender(uiGender?: number | null): number {
  const g = Number(uiGender ?? 1);
  if (g === 1 || g === 2 || g === 3) return g - 1; 
  return 0;
}

const GENDER_OPTIONS = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
];

const OrgAdminProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [, setAvatarFile] = useState<File | null>(null);

  const [user, setUser] = useState<any>({});

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const { id: userId, roleId, organizationId, userName } = currentUser;

  useEffect(() => {
    if (!userId) return;
    AccountService.getAccountById(userId)
      .then((res: any) => {
        setUser(res);
        setAvatarUrl(res?.avtUrl || "");
        form.setFieldsValue({
          email: res.email,
          phone: res.phone,
          address: res.address,
          fullName: res.fullName,
          gender: toUiGender(res.gender), 
        });
      })
      .catch(() => message.error("Failed to load user info."));
  }, [userId, form]);

  const handleUpdate = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        userName,
        email: values.email,
        roleId,
        organizationId,
        isActive: user?.isActive ?? true,
        fullName: values.fullName?.trim(),
        phone: values.phone?.trim(),
        gender: toBeGender(values.gender), 
        address: values.address?.trim(),
        avtUrl: avatarUrl, 
      };

      const updated = await AccountService.updateAccount(userId, payload);

      setUser(updated);
      setAvatarUrl(updated.avtUrl || avatarUrl);

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...currentUser,
          fullName: updated.fullName ?? currentUser.fullName,
          gender: updated.gender ?? currentUser.gender,
          avtUrl: updated.avtUrl ?? currentUser.avtUrl,
          email: updated.email ?? currentUser.email,
        })
      );
      window.dispatchEvent(new Event("user:updated"));

      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(`Update failed. ${e?.message || ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12 }}>
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

        <div style={{ display: "grid", placeItems: "center", marginTop: 10, gap: 8 }}>
          <Avatar src={avatarUrl || "/avatar.png"} size={80} style={{ border: "2px solid #ccc" }} />
          <UploadCloudinary
            value={avatarUrl}
            onChange={setAvatarUrl}
            onFileChange={setAvatarFile} 
          />
        </div>
      </div>

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
              <Form.Item name="address" label="Address">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Full name">
                <Input />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select
                  options={GENDER_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </Form>
      </div>
    </Card>
  );
};

export default OrgAdminProfile;
