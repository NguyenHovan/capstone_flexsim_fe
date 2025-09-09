import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Avatar,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Divider,
  Typography,
  Flex,
} from "antd";
import { SaveOutlined, ReloadOutlined, UserOutlined } from "@ant-design/icons";
import { toast } from "sonner";

import { AccountService } from "../../../../services/account.service";
import UploadCloudinary from "../../../UploadFile/UploadCloudinary";
import type { Account, UpdateAccountPayload } from "../../../../types/account";

import "./adminProfile.css";

const { Title, Text } = Typography;

const asNum = (v: any, fb = 1) => (Number.isFinite(Number(v)) ? Number(v) : fb);

const normalizeGender = (g: any): 1 | 2 | 3 => {
  const n = asNum(g, 1);
  if (n === 1 || n === 2 || n === 3) return n as 1 | 2 | 3;
  if (n === 0) return 1;
  if (n === 2) return 3 as 1 | 2 | 3;
  return 1;
};

function readCurrentUser(): any | null {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && "gender" in u) u.gender = normalizeGender(u.gender);
    return u;
  } catch {
    return null;
  }
}

function writeCurrentUser(next: Partial<Account>) {
  try {
    const prev = readCurrentUser() || {};
    const merged = { ...prev, ...next };
    if ("gender" in merged) merged.gender = normalizeGender(merged.gender);
    localStorage.setItem("currentUser", JSON.stringify(merged));
    window.dispatchEvent(new Event("user:updated"));
  } catch {}
}

const GENDER_OPTIONS = [
  { label: "Nam", value: 1 },
  { label: "Nữ", value: 2 },
  { label: "Khác", value: 3 },
];

const AdminProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState<Account | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  const currentUser = useMemo(() => readCurrentUser(), []);
  const userId = currentUser?.id as string | undefined;

  useEffect(() => {
    if (!currentUser) return;
    setUser((prev) => prev ?? (currentUser as Account));
    setAvatarUrl(currentUser.avtUrl || "");
    form.setFieldsValue({
      fullName: currentUser.fullName,
      phone: currentUser.phone,
      address: (currentUser as any).address,
      gender: normalizeGender(currentUser.gender), 
      email: currentUser.email,
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const acc = await AccountService.getAccountById(userId);
        const normalized: Account = {
          ...acc,
          gender: normalizeGender(acc.gender),
        };
        setUser(normalized);
        setAvatarUrl(normalized.avtUrl || "");
        form.setFieldsValue({
          fullName: normalized.fullName,
          phone: normalized.phone,
          address: (normalized as any).address,
          gender: normalized.gender,
          email: normalized.email,
        });
        writeCurrentUser(normalized);
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message ||
            (typeof e?.response?.data === "string" ? e.response.data : "") ||
            e?.message ||
            "Failed to load user info."
        );
      }
    })();
  }, [userId]);

  useEffect(() => {
    setAvatarDirty((avatarUrl || "") !== (user?.avtUrl || ""));
  }, [avatarUrl, user?.avtUrl]);

  const saveAvatarOnly = async () => {
    if (!user?.id || !avatarDirty) return;
    setSavingAvatar(true);
    try {
      await AccountService.updateAccount(user.id, { avtUrl: avatarUrl });
      const fresh = await AccountService.getAccountById(user.id);
      const normalized: Account = {
        ...fresh,
        gender: normalizeGender(fresh.gender),
      };
      setUser(normalized);
      setAvatarUrl(normalized.avtUrl || "");
      setAvatarDirty(false);
      writeCurrentUser(normalized);
      toast.success("Ảnh đại diện đã được cập nhật!");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          (typeof e?.response?.data === "string" ? e.response.data : "") ||
          e?.message ||
          "Cập nhật ảnh thất bại."
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  const onReset = () => {
    const u = user || currentUser;
    if (!u) return;
    form.setFieldsValue({
      fullName: u.fullName,
      phone: u.phone,
      address: (u as any).address,
      gender: normalizeGender(u.gender),
      email: u.email,
    });
    setAvatarUrl(u.avtUrl || "");
    setAvatarDirty(false);
  };

  const handleUpdate = async (values: any) => {
    if (!user?.id) return;
    setSavingAll(true);
    try {
      const trim = (x?: string) => (typeof x === "string" ? x.trim() : x);
      const diff: UpdateAccountPayload = {};

      const nextFullName = trim(values.fullName);
      if (nextFullName !== (user.fullName ?? ""))
        diff.fullName = nextFullName as string;

      const nextPhone = trim(values.phone);
      if (nextPhone !== (user.phone ?? ""))
        diff.phone = nextPhone as string | undefined;

      const nextAddress = trim(values.address);
      if (nextAddress !== ((user as any).address ?? ""))
        diff.address = nextAddress as string | undefined;

      const nextGender = normalizeGender(values.gender); 
      if (normalizeGender(user.gender) !== nextGender) diff.gender = nextGender;

      if ((avatarUrl || "") !== (user.avtUrl || ""))
        diff.avtUrl = avatarUrl || "";

      if (Object.keys(diff).length === 0) {
        toast.info("Không có thay đổi nào để cập nhật");
        setSavingAll(false);
        return;
      }

      await AccountService.updateAccount(user.id, diff);

      const fresh = await AccountService.getAccountById(user.id);
      const normalized: Account = {
        ...fresh,
        gender: normalizeGender(fresh.gender),
      };
      setUser(normalized);
      setAvatarUrl(normalized.avtUrl || "");
      setAvatarDirty(false);
      writeCurrentUser(normalized);

      form.setFieldsValue({ gender: normalized.gender });

      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          (typeof e?.response?.data === "string" ? e.response.data : "") ||
          e?.message ||
          "Cập nhật thông tin thất bại."
      );
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <Title level={3} className="profile-hero__title">
          Chào mừng bạn đến với LogiSimEdu
        </Title>
        <Text className="profile-hero__subtitle">
          {(user?.fullName || currentUser?.fullName) ?? "Organization Admin"}
        </Text>

        <div className="avatar-block">
          <div className="avatar-block__outer">
            <Avatar
              size={112}
              src={avatarUrl || "/avatar.png"}
              icon={!avatarUrl ? <UserOutlined /> : undefined}
              className="avatar-block__img"
            />
          </div>
          <Flex gap={24}>
            <div className="avatar-block__uploader">
              {" "}
              <UploadCloudinary value={avatarUrl} onChange={setAvatarUrl} />
            </div>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveAvatarOnly}
              disabled={!avatarDirty}
              loading={savingAvatar}
              className="avatar-block__savebtn"
            >
              Lưu ảnh
            </Button>
          </Flex>
        </div>
      </div>

      {/* FORM */}
      <Card className="profile-card" bodyStyle={{ padding: 24 }}>
        <div className="profile-card__header">
          <Title level={4} style={{ margin: 0 }}>
            Thông tin tài khoản
          </Title>
        </div>

        <Divider style={{ margin: "16px 0 24px" }} />

        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={[24, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Tên đầy đủ"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Your full name"
                  onPressEnter={(e) => {
                    e.preventDefault();
                    form.submit();
                  }}
                />
              </Form.Item>

              <Form.Item name="phone" label="Số điện thoại">
                <Input
                  placeholder="(+84) 09xxxxxxx"
                  onPressEnter={(e) => {
                    e.preventDefault();
                    form.submit();
                  }}
                />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true }]}
              >
                <Select
                  options={GENDER_OPTIONS}
                  onChange={(val) =>
                    form.setFieldValue("gender", asNum(val, 1))
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="name@example.com" disabled />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input
                  
                  onPressEnter={(e) => {
                    e.preventDefault();
                    form.submit();
                  }}
                />
              </Form.Item>

              <div className="profile-actions">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onReset}
                  style={{ marginRight: 8 }}
                >
                  Đặt lại
                </Button>
                <Button type="primary" htmlType="submit" loading={savingAll}>
                  Lưu thay đổi
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AdminProfile;
