import { useEffect, useMemo, useState } from "react";
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
  Divider,
  Tooltip,
  Typography,
} from "antd";
import {
  CameraOutlined,
  SaveOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { AccountService } from "../../../services/account.service";
import UploadCloudinary from "../../UploadFile/UploadCloudinary";
import type { UpdateAccountPayload } from "../../../types/account";

import "./orgAdminProfile.css";

const { Title, Text } = Typography;

/* ====== Gender helpers ====== */
// map BE 0/1/2 -> UI 1/2/3
type GenderUI = 1 | 2 | 3;
const toUiGender = (g?: number | null): GenderUI =>
  g === 0 || g === 1 || g === 2 ? ((g + 1) as GenderUI) : 1;
// map UI 1/2/3 -> BE 0/1/2
const toBeGender = (ui?: number | null): number => {
  const g = Number(ui ?? 1);
  return g === 1 || g === 2 || g === 3 ? g - 1 : 0;
};

const GENDER_OPTIONS = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
];

const OrgAdminProfile: React.FC = () => {
  const [form] = Form.useForm();

  // user & avatar state
  const [user, setUser] = useState<any>({});
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // loading state
  const [loading, setLoading] = useState(false);

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("currentUser") || "{}"),
    []
  );
  const { id: userId } = currentUser;

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

  // bật/tắt trạng thái đã đổi avatar
  useEffect(() => {
    setAvatarDirty((avatarUrl || "") !== (user?.avtUrl || ""));
  }, [avatarUrl, user?.avtUrl]);

  const saveAvatarOnly = async () => {
    if (!user?.id || !avatarDirty) return;
    setSavingAvatar(true);
    try {
      const updated = await AccountService.updateAccount(user.id, {
        avtUrl: avatarUrl,
      } as UpdateAccountPayload);

      const merged = { ...user, ...updated };
      setUser(merged);

      const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...cu, avtUrl: merged.avtUrl || avatarUrl })
      );
      window.dispatchEvent(new Event("user:updated"));

      toast.success("Ảnh đại diện đã được cập nhật!");
      setAvatarDirty(false);
    } catch (e: any) {
      toast.error(`Cập nhật ảnh thất bại. ${e?.message || ""}`);
    } finally {
      setSavingAvatar(false);
    }
  };

  const onReset = () => {
    form.setFieldsValue({
      email: user.email,
      phone: user.phone,
      address: user.address,
      fullName: user.fullName,
      gender: toUiGender(user.gender),
    });
    setAvatarUrl(user?.avtUrl || "");
    setAvatarDirty(false);
  };

  const handleUpdate = async (values: any) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const trim = (x?: string) => (typeof x === "string" ? x.trim() : x);

      const diff: UpdateAccountPayload = {};
      const nextFullName = trim(values.fullName);
      if (nextFullName && nextFullName !== (user.fullName ?? "")) {
        diff.fullName = nextFullName;
      }

      const nextPhone = trim(values.phone);
      if (nextPhone !== (user.phone ?? "")) {
        diff.phone = nextPhone as string | undefined;
      }

      const nextAddress = trim(values.address);
      if (nextAddress !== (user.address ?? "")) {
        diff.address = nextAddress as string | undefined;
      }

      const nextGenderBE = toBeGender(values.gender);
      if (typeof user.gender === "number" ? user.gender !== nextGenderBE : true) {
        diff.gender = nextGenderBE;
      }

      // nếu ảnh đã đổi nhưng chưa bấm "Lưu ảnh" riêng
      if ((avatarUrl || "") !== (user.avtUrl || "")) {
        diff.avtUrl = avatarUrl || "";
      }

      if (Object.keys(diff).length === 0) {
        toast.info("Không có thay đổi nào để cập nhật");
        setLoading(false);
        return;
      }

      const updated = await AccountService.updateAccount(user.id, diff);
      const merged = { ...user, ...updated };
      setUser(merged);
      setAvatarUrl(merged.avtUrl || avatarUrl);
      setAvatarDirty(false);

      const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...cu,
          fullName: merged.fullName ?? cu.fullName,
          gender: merged.gender ?? cu.gender,
          avtUrl: merged.avtUrl ?? cu.avtUrl,
          email: merged.email ?? cu.email,
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
    <div className="profile-page">
      {/* HERO */}
      <div className="profile-hero">
        <Title level={3} className="profile-hero__title">
          Welcome to LogiSimEdu
        </Title>
        <Text className="profile-hero__subtitle">
          {user?.fullName || "Organization Admin"}
        </Text>

        {/* Avatar block */}
        <div className="avatar-block">
          <div className="avatar-block__outer">
            <Avatar
              size={108}
              src={avatarUrl || "/avatar.png"}
              icon={!avatarUrl ? <UserOutlined /> : undefined}
              className="avatar-block__img"
            />
            {/* nút camera nổi */}
            <div className="avatar-block__uploader">
              <Tooltip title="Đổi ảnh">
                <span className="avatar-block__camera">
                  <CameraOutlined />
                </span>
              </Tooltip>
              <UploadCloudinary value={avatarUrl} onChange={setAvatarUrl} />
            </div>
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
        </div>
      </div>

      {/* CONTENT CARD */}
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
              <Form.Item name="fullName" label="Full name">
                <Input placeholder="Your full name" />
              </Form.Item>

              <Form.Item name="phone" label="Phone">
                <Input placeholder="(+84) 09xxxxxxx" />
              </Form.Item>

              <Form.Item name="gender" label="Gender">
                <Select options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="name@example.com" />
              </Form.Item>

              <Form.Item name="address" label="Address">
                <Input placeholder="Street, City" />
              </Form.Item>

              <div className="profile-actions">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onReset}
                  style={{ marginRight: 8 }}
                >
                  Reset
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save changes
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default OrgAdminProfile;
