import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Layout,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Typography,
  message,
  Select,
  Tag,
  Space,
  Alert,
  Upload,
  Tabs,
  Switch,
} from "antd";
import UploadCloudinary from "../../UploadFile/UploadCloudinary";
import type { UpdateAccountPayload } from "../../../types/account";

import {
  EyeOutlined,
  EditOutlined,
  UserAddOutlined,
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  InboxOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { AccountService } from "../../../services/account.service";
import type { Account } from "../../../types/account";
import "./userOrganization.css";
const { Content } = Layout;
const { Title } = Typography;

/* ===== VIETNAMESE LABELS ===== */

const roleNameMap: Record<number, string> = { 3: "Giảng viên", 4: "Học viên" };

const prettyGender = (g: unknown) => {
  const num = Number(g);
  return ({ 1: "Nam", 2: "Nữ", 3: "Khác" } as Record<number, string>)[num] ?? "—";
};

const VISIBLE_ROLE_IDS = new Set<number>([3, 4]);

const roleOptions = [
  { label: "Tất cả vai trò", value: "" },
  { label: "Giảng viên", value: 3 },
  { label: "Học viên", value: 4 },
] as const;

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
] as const;

const sortByOptions = [
  { label: "Tên đăng nhập", value: "userName" },
  { label: "Họ tên", value: "fullName" },
  { label: "Ngày tạo", value: "createdAt" },
] as const;

const sortDirOptions = [
  { label: "Tăng dần", value: "asc" },
  { label: "Giảm dần", value: "desc" },
] as const;

const genderOptions = [
  { label: "Nam", value: 1 },
  { label: "Nữ", value: 2 },
  { label: "Khác", value: 3 },
] as const;

const getOrganizationId = (): string => {
  try {
    const s = localStorage.getItem("currentUser");
    return s ? JSON.parse(s).organizationId || "" : "";
  } catch {
    return "";
  }
};

const setEmailDuplicateError = (form: any, err: any) => {
  try {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errors = data?.errors;

    const msg: string | undefined =
      errors?.Email?.[0] ||
      errors?.email?.[0] ||
      (typeof data === "string" ? data : undefined) ||
      data?.message ||
      data?.title ||
      err?.message;

    const lower = String(msg || "").toLowerCase();
    const looksDup =
      status === 409 ||
      lower.includes("duplicate") ||
      lower.includes("already") ||
      lower.includes("exist") ||
      lower.includes("đã tồn tại") ||
      lower.includes("tồn tại");

    if ((msg && /email/i.test(msg)) || looksDup) {
      form.setFields([{ name: "email", errors: [msg || "Email đã tồn tại"] }]);
      return true;
    }
  } catch {}
  return false;
};

const getBEMessage = (err: any, fallback?: string) => {
  try {
    const data = err?.response?.data;
    const msg =
      (typeof data === "string" ? data : "") ||
      data?.message ||
      data?.title ||
      err?.message ||
      "";
    return msg || fallback || "Đã xảy ra lỗi không xác định.";
  } catch {
    return fallback || "Đã xảy ra lỗi không xác định.";
  }
};

/* =================== TEMPLATE BOX =================== */
type TmplRow = { name: string; required: boolean; example: string };

const TMPL_COLS: ColumnsType<TmplRow> = [
  { title: "Cột", dataIndex: "name", key: "name", width: 180 },
  {
    title: "Bắt buộc",
    dataIndex: "required",
    key: "required",
    width: 110,
    render: (v) => (v ? <Tag color="red">Có</Tag> : <Tag>Không</Tag>),
  },
  { title: "Ví dụ", dataIndex: "example", key: "example" },
];

const TEMPLATE_ROWS: TmplRow[] = [
  { name: "userName", required: true, example: "nguyenvana" },
  { name: "fullName", required: true, example: "Nguyễn Văn A" },
  { name: "email", required: true, example: "a@example.com" },
  { name: "password", required: true, example: "Abc@123" },
  // { name: "gender", required: false, example: "1 | 2 | 3 (1=Nam, 2=Nữ, 3=Khác)" },
  // { name: "phone", required: false, example: "0901234567" },
  // { name: "address", required: false, example: "Hà Nội" },
];

const TemplateBox: React.FC<{
  kind: "student" | "instructor";
  onDownload: () => void;
}> = ({ kind, onDownload }) => (
  <Card size="small" className="tmpl-card" style={{ marginBottom: 12 }}>
    <div className="tmpl-header">
      <div className="tmpl-title">
        <InfoCircleOutlined /> Cột dữ liệu — {kind === "student" ? "Học viên" : "Giảng viên"}
      </div>
      <Button icon={<DownloadOutlined />} onClick={onDownload}>
        Tải file mẫu (.xls)
      </Button>
    </div>
    <Table<TmplRow>
      size="small"
      rowKey="name"
      pagination={false}
      columns={TMPL_COLS}
      dataSource={TEMPLATE_ROWS}
    />
    <div className="tmpl-note">
      <div>
        • <b>Bắt buộc:</b> <code>userName</code>, <code>fullName</code>, <code>email</code>, <code>password</code>
      </div>
      <div>
        • Chấp nhận import: <b>.xlsx/.xls</b>. Nếu dùng <code>gender</code>: 1=Nam, 2=Nữ, 3=Khác.
      </div>
    </div>
  </Card>
);

const UserOrganization: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [creatingInstructor, setCreatingInstructor] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isCreateInstructor, setIsCreateInstructor] = useState(false);
  const [isCreateStudent, setIsCreateStudent] = useState(false);
  const [formInstr] = Form.useForm();
  const [formStud] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [, setShowUpdatedToast] = useState(false);
  const toastFlagRef = useRef(false);
  const prevOpenRef = useRef(false);

  const [instrError, setInstrError] = useState<string | null>(null);
  const [studError, setStudError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [sortBy, setSortBy] = useState<"userName" | "fullName" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [tabInstr, setTabInstr] = useState<"manual" | "import">("manual");
  const [tabStud, setTabStud] = useState<"manual" | "import">("manual");
  const [instrFile, setInstrFile] = useState<File | null>(null);
  const [studFile, setStudFile] = useState<File | null>(null);
  const [importingInstr, setImportingInstr] = useState(false);
  const [importingStud, setImportingStud] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const orgId = getOrganizationId();

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const all = await AccountService.getAllByOrgId(orgId);
      const filtered = (all ?? []).filter((u: Account) =>
        VISIBLE_ROLE_IDS.has(Number(u.roleId))
      );
      setUsers(filtered);
    } catch (err) {
      message.error(getBEMessage(err, "Tải danh sách người dùng thất bại"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) {
      message.error("Không tìm thấy tổ chức");
      return;
    }
    load();
  }, [orgId]);

  const bc = useMemo(() => new BroadcastChannel("org-accounts"), []);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const msg = e.data as { type: string; organizationId?: string };
      if (msg?.type?.startsWith("account:") && msg.organizationId === orgId) load();
    };
    bc.addEventListener("message", onMsg);
    return () => bc.close();
  }, [orgId]);

  useEffect(() => {
    if (prevOpenRef.current && !isEditModal && toastFlagRef.current) {
      message.success("Cập nhật tài khoản thành công!");
      toastFlagRef.current = false;
      setShowUpdatedToast(false);
    }
    prevOpenRef.current = isEditModal;
  }, [isEditModal]);

  const loadUsser = async (opts?: { close?: "edit" | "instr" | "stud" | "all" }) => {
    await load();
    switch (opts?.close) {
      case "edit":
        setIsEditModal(false);
        setEditingUser(null);
        formEdit.resetFields();
        setEditError(null);
        break;
      case "instr":
        setIsCreateInstructor(false);
        formInstr.resetFields();
        setInstrError(null);
        setTabInstr("manual");
        setInstrFile(null);
        break;
      case "stud":
        setIsCreateStudent(false);
        formStud.resetFields();
        setStudError(null);
        setTabStud("manual");
        setStudFile(null);
        break;
      case "all":
        setIsEditModal(false);
        setEditingUser(null);
        formEdit.resetFields();
        setEditError(null);
        setIsCreateInstructor(false);
        formInstr.resetFields();
        setInstrError(null);
        setTabInstr("manual");
        setInstrFile(null);
        setIsCreateStudent(false);
        formStud.resetFields();
        setStudError(null);
        setTabStud("manual");
        setStudFile(null);
        break;
      default:
        break;
    }
  };

  /* ====== Handlers: View/Edit ====== */
  const onView = (u: Account) => {
    setViewingUser(u);
    setIsViewModal(true);
  };

  const onEdit = (u: Account) => {
    setEditingUser(u);
    setEditError(null);
    formEdit.setFieldsValue({
      userName: u.userName,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      gender: Number(u.gender) || undefined,
      address: (u as any).address,
      avtUrl: (u as any).avtUrl,
      isActive: u.isActive,
    });
    setIsEditModal(true);
  };

  const submitEdit = async () => {
    if (savingEdit) return;
    const v = await formEdit.validateFields();
    if (!editingUser) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const diff: UpdateAccountPayload = {};
      const trim = (x?: string) => (typeof x === "string" ? x.trim() : x);

      if (trim(v.fullName) && trim(v.fullName) !== (editingUser.fullName ?? "")) {
        diff.fullName = trim(v.fullName) as string;
      }
      if (v.gender !== undefined) {
        const normalized = Number(v.gender) ?? Number(v.gender);
        if (normalized !== Number(editingUser.gender)) diff.gender = normalized;
      }
      if (trim(v.phone) !== (editingUser.phone ?? "")) diff.phone = trim(v.phone) as string | undefined;
      if (trim(v.address) !== (editingUser.address ?? "")) diff.address = trim(v.address) as string | undefined;
      const newAvt = (trim(v.avtUrl) as string) || "";
      if (newAvt !== (editingUser.avtUrl || "")) diff.avtUrl = newAvt;
      const nextGender = Number(v.gender);
      if ([1, 2, 3].includes(nextGender) && nextGender !== Number(editingUser.gender)) {
        diff.gender = nextGender;
      }
      if (Object.keys(diff).length === 0) {
        setSavingEdit(false);
        message.info("Không có thay đổi nào để cập nhật");
        return;
      }

      await AccountService.updateAccount(editingUser.id, diff);
      await load();
      setShowUpdatedToast(true);
      toastFlagRef.current = true;

      setIsEditModal(false);
      formEdit.resetFields();
      setEditingUser(null);
      setEditError(null);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status === 400) setEditError(getBEMessage(err, "Yêu cầu không hợp lệ (400)."));
      else setEditError(getBEMessage(err, "Không thể cập nhật tài khoản"));
    } finally {
      setSavingEdit(false);
    }
  };

  const onToggleActive = async (rec: Account, checked: boolean) => {
    if (togglingId || actionId) return;
    setTogglingId(rec.id);
    try {
      let updated: Account;
      if (checked) {
        updated = await AccountService.unbanAccount(rec.id);
        message.success("Đã mở khoá tài khoản");
        bc.postMessage({ type: "account:unbanned", organizationId: orgId });
      } else {
        updated = await AccountService.banAccount(rec.id);
        message.success("Đã khoá tài khoản");
        bc.postMessage({ type: "account:banned", organizationId: orgId });
      }
      setUsers((curr) =>
        curr.map((u) => (u.id === updated.id ? { ...u, isActive: updated.isActive } : u))
      );
    } catch (err) {
      message.error(getBEMessage(err, "Không thể đổi trạng thái tài khoản"));
    } finally {
      setTogglingId(null);
    }
  };

  const onBanBtn = async (rec: Account) => {
    if (actionId) return;
    setActionId(rec.id);
    try {
      const updated = await AccountService.banAccount(rec.id);
      setUsers((curr) => curr.map((u) => (u.id === updated.id ? { ...u, isActive: false } : u)));
      bc.postMessage({ type: "account:banned", organizationId: orgId });
      message.success("Đã khoá tài khoản");
    } catch (err) {
      message.error(getBEMessage(err, "Không thể khoá tài khoản"));
    } finally {
      setActionId(null);
    }
  };

  const onUnbanBtn = async (rec: Account) => {
    if (actionId) return;
    setActionId(rec.id);
    try {
      const updated = await AccountService.unbanAccount(rec.id);
      setUsers((curr) => curr.map((u) => (u.id === updated.id ? { ...u, isActive: true } : u)));
      bc.postMessage({ type: "account:unbanned", organizationId: orgId });
      message.success("Đã mở khoá tài khoản");
    } catch (err) {
      message.error(getBEMessage(err, "Không thể mở khoá tài khoản"));
    } finally {
      setActionId(null);
    }
  };

  const submitCreateInstructor = async () => {
    if (creatingInstructor) return;
    const vals = await formInstr.validateFields();
    setCreatingInstructor(true);
    setInstrError(null);
    try {
      const c = await AccountService.registerInstructor({
        ...vals,
        gender: Number(vals.gender),
        isActive: true,
        organizationId: orgId,
      });
      setUsers((u) => [c, ...u]);
      bc.postMessage({ type: "account:created", organizationId: orgId });
      await loadUsser({ close: "instr" });
      message.success("Tạo tài khoản Giảng viên thành công");
    } catch (err: any) {
      if (setEmailDuplicateError(formInstr, err)) return;
      setInstrError(getBEMessage(err, "Không thể tạo tài khoản Giảng viên"));
    } finally {
      setCreatingInstructor(false);
    }
  };

  const submitCreateStudent = async () => {
    if (creatingStudent) return;
    const vals = await formStud.validateFields();
    setCreatingStudent(true);
    setStudError(null);
    try {
      const c = await AccountService.registerStudent({
        ...vals,
        gender: Number(vals.gender),
        isActive: true,
        organizationId: orgId,
      });
      setUsers((u) => [c, ...u]);
      bc.postMessage({ type: "account:created", organizationId: orgId });
      await loadUsser({ close: "stud" });
      message.success("Tạo tài khoản Học viên thành công");
    } catch (err: any) {
      if (setEmailDuplicateError(formStud, err)) return;
      setStudError(getBEMessage(err, "Không thể tạo tài khoản Học viên"));
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleDownloadInstructorTemplate = () => {
    const a = document.createElement("a");
    a.href = "/files/AccountExcel.xlsx";
    a.download = "mau_giang_vien.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleDownloadStudentTemplate = () => {
    const a = document.createElement("a");
    a.href = "/files/AccountExcel.xlsx";
    a.download = "mau_hoc_vien.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const submitImportInstructor = async () => {
    if (!instrFile) {
      message.error("Vui lòng chọn file Excel");
      return;
    }
    setImportingInstr(true);
    try {
      await AccountService.importInstructors(orgId, instrFile);
      message.success("Tạo tài khoản từ file (Giảng viên) thành công");
      await loadUsser({ close: "instr" });
    } catch (e: any) {
      message.error(e?.message || "Nhập Giảng viên từ file thất bại");
    } finally {
      setImportingInstr(false);
      setInstrFile(null);
    }
  };
  const submitImportStudent = async () => {
    if (!studFile) {
      message.error("Vui lòng chọn file Excel");
      return;
    }
    setImportingStud(true);
    try {
      await AccountService.importStudents(orgId, studFile);
      message.success("Tạo tài khoản từ file (Học viên) thành công");
      await loadUsser({ close: "stud" });
    } catch (e: any) {
      message.error(e?.message || "Nhập Học viên từ file thất bại");
    } finally {
      setImportingStud(false);
      setStudFile(null);
    }
  };

  const dataView = useMemo(() => {
    const q = debounced.toLowerCase();
    let list = users.filter((u) => VISIBLE_ROLE_IDS.has(Number(u.roleId)));
    list = list.filter((u) => {
      const hitQ =
        !q ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q));
      const hitRole = roleFilter === "" ? true : Number(u.roleId) === roleFilter;
      const hitStatus =
        statusFilter === "" ? true : statusFilter === "active" ? u.isActive : !u.isActive;
      return hitQ && hitRole && hitStatus;
    });
    list = list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "createdAt") {
        const va = a.createdAt ? +new Date(a.createdAt) : 0;
        const vb = b.createdAt ? +new Date(b.createdAt) : 0;
        return (va - vb) * dir;
      }
      const sa = ((a as any)[sortBy] || "").toLowerCase?.() ?? "";
      const sb = ((b as any)[sortBy] || "").toLowerCase?.() ?? "";
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });
    return list;
  }, [users, debounced, roleFilter, statusFilter, sortBy, sortDir]);

  const columns: ColumnsType<Account> = [
    { title: "ID", dataIndex: "id", key: "id", width: 220, ellipsis: true },
    {
      title: "Hình ảnh",
      dataIndex: "avtUrl",
      key: "avtUrl",
      align: "center",
      width: 110,
      render: (url) =>
        url ? (
          <img
            src={url}
            alt=""
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #eee",
            }}
          />
        ) : (
          "—"
        ),
    },
    { title: "Tên đăng nhập", dataIndex: "userName", key: "userName", width: 140 },
    { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 180 },
    { title: "Email", dataIndex: "email", key: "email", width: 220, ellipsis: true },
    { title: "Điện thoại", dataIndex: "phone", key: "phone", width: 140 },
    {
      title: "Vai trò",
      dataIndex: "roleId",
      key: "roleId",
      width: 120,
      render: (r) => roleNameMap[Number(r)] || r,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 110,
      render: (g) => prettyGender(g),
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (_: boolean, rec) => (
        <Switch
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          checked={!!rec.isActive}
          loading={togglingId === rec.id}
          disabled={actionId === rec.id}
          onChange={(checked) => onToggleActive(rec, checked)}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : "–"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : "–"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, rec) => (
        <Space wrap size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => onView(rec)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(rec)}>
            Sửa
          </Button>
          {rec.isActive ? (
            <Button
              icon={<StopOutlined />}
              size="small"
              danger
              loading={actionId === rec.id}
              onClick={() => onBanBtn(rec)}
            >
              Khoá
            </Button>
          ) : (
            <Button
              icon={<CheckCircleOutlined />}
              size="small"
              type="primary"
              loading={actionId === rec.id}
              onClick={() => onUnbanBtn(rec)}
            >
              Mở khoá
            </Button>
          )}
        </Space>
      ),
    },
  ];

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý người dùng
            </Title>
          </Col>
          <Col>
            <Space wrap>
              <Button
                icon={<UserAddOutlined />}
                type="primary"
                onClick={() => {
                  setIsCreateInstructor(true);
                  setInstrError(null);
                  formInstr.resetFields();
                  setTabInstr("manual");
                  setInstrFile(null);
                }}
              >
                Tạo Giảng viên
              </Button>
              <Button
                icon={<UserOutlined />}
                type="primary"
                onClick={() => {
                  setIsCreateStudent(true);
                  setStudError(null);
                  formStud.resetFields();
                  setTabStud("manual");
                  setStudFile(null);
                }}
              >
                Tạo Học viên
              </Button>
              <Button
                onClick={async () => {
                  const res = await AccountService.exportData();
                  const blob: Blob = res.data;

                  const cd =
                    res.headers?.["content-disposition"] ||
                    res.headers?.["Content-Disposition"] ||
                    "";
                  const match = cd.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)/i);
                  const filename = match
                    ? decodeURIComponent(match[1])
                    : `export_${Date.now()}.xlsx`;

                  downloadBlob(blob, filename);
                }}
              >
                Xuất dữ liệu
              </Button>
            </Space>
          </Col>
        </Row>

        <Card style={{ marginBottom: 12 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10} lg={12}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm theo tên đăng nhập hoặc họ tên…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} md={4} lg={4}>
              <Select
                style={{ width: "100%" }}
                options={roleOptions as any}
                value={roleFilter}
                onChange={setRoleFilter as any}
              />
            </Col>
            <Col xs={12} md={4} lg={4}>
              <Select
                style={{ width: "100%" }}
                options={statusOptions as any}
                value={statusFilter}
                onChange={setStatusFilter as any}
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                style={{ width: "100%" }}
                options={sortByOptions as any}
                value={sortBy}
                onChange={setSortBy as any}
                suffixIcon={<SortAscendingOutlined />}
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                style={{ width: "100%" }}
                options={sortDirOptions as any}
                value={sortDir}
                onChange={setSortDir as any}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={dataView}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* VIEW MODAL */}
        <Modal
          title="Chi tiết người dùng"
          open={isViewModal}
          footer={<Button onClick={() => setIsViewModal(false)}>Đóng</Button>}
          onCancel={() => setIsViewModal(false)}
          destroyOnClose
          width={600}
        >
          {viewingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <b>Id:</b> {viewingUser.id}
                </p>
                <p>
                  <b>Tên đăng nhập:</b> {viewingUser.userName}
                </p>
                <p>
                  <b>Họ tên:</b> {viewingUser.fullName}
                </p>
                <p>
                  <b>Tổ chức:</b> {viewingUser.organizationId}
                </p>
                <p>
                  <b>Email:</b> {viewingUser.email}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <b>Điện thoại:</b> {viewingUser.phone}
                </p>
                <p>
                  <b>Vai trò:</b> {roleNameMap[Number(viewingUser.roleId)] || viewingUser.roleId}
                </p>
                <p>
                  <b>Giới tính:</b> {prettyGender(viewingUser.gender)}
                </p>

                <p>
                  <b>Trạng thái:</b> {viewingUser.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </p>
              </Col>
            </Row>
          )}
        </Modal>

        {/* EDIT MODAL */}
        <Modal
          title="Sửa người dùng"
          open={isEditModal}
          onOk={submitEdit}
          onCancel={() => {
            setIsEditModal(false);
            formEdit.resetFields();
            setEditingUser(null);
            setEditError(null);
          }}
          okButtonProps={{ loading: savingEdit, disabled: savingEdit }}
          destroyOnClose
          width={680}
          afterOpenChange={(opened) => {
            if (!opened && toastFlagRef.current) {
              message.success("Cập nhật tài khoản thành công!");
              toastFlagRef.current = false;
              setShowUpdatedToast(false);
            }
          }}
        >
          {editError && <Alert style={{ marginBottom: 12 }} type="error" showIcon message={editError} />}

          <Form
            form={formEdit}
            layout="vertical"
            onValuesChange={() => {
              if (editError) setEditError(null);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fullName" label="Họ tên">
                  <Input
                    onPressEnter={(e) => {
                      e.preventDefault();
                      submitEdit();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select options={genderOptions as any} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="Điện thoại">
                  <Input
                    onPressEnter={(e) => {
                      e.preventDefault();
                      submitEdit();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="address" label="Địa chỉ">
                  <Input
                    onPressEnter={(e) => {
                      e.preventDefault();
                      submitEdit();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="avtUrl" label="Ảnh (Cloudinary)" valuePropName="value">
                  <UploadCloudinary
                    value={formEdit.getFieldValue("avtUrl")}
                    onChange={(url) => formEdit.setFieldsValue({ avtUrl: url })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* CREATE INSTRUCTOR */}
        <Modal
          title="Tạo Giảng viên"
          open={isCreateInstructor}
          onOk={() => (tabInstr === "manual" ? submitCreateInstructor() : submitImportInstructor())}
          onCancel={() => {
            setIsCreateInstructor(false);
            formInstr.resetFields();
            setInstrError(null);
            setTabInstr("manual");
            setInstrFile(null);
          }}
          okButtonProps={{
            loading: tabInstr === "manual" ? creatingInstructor : importingInstr,
            disabled: tabInstr === "manual" ? creatingInstructor : importingInstr,
          }}
          destroyOnClose
          width={700}
        >
          {instrError && tabInstr === "manual" && (
            <Alert style={{ marginBottom: 12 }} type="error" showIcon message={instrError} />
          )}

          <Tabs
            activeKey={tabInstr}
            onChange={(k) => setTabInstr(k as any)}
            items={[
              {
                key: "manual",
                label: "Nhập thủ công",
                children: (
                  <Form
                    form={formInstr}
                    layout="vertical"
                    onValuesChange={() => {
                      if (instrError) setInstrError(null);
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="userName" label="Tên đăng nhập" rules={[{ required: true }]}>
                          <Input
                            placeholder="Ví dụ: giangvien_a"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateInstructor();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                          <Input
                            placeholder="Ví dụ: Nguyễn Văn A"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateInstructor();
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
                          <Input
                            placeholder="name@example.com"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateInstructor();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                          <Select options={genderOptions as any} allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="password" label="Mật khẩu">
                      <Input.Password
                        placeholder="Ít nhất 6 ký tự"
                        onPressEnter={(e) => {
                          e.preventDefault();
                          submitCreateInstructor();
                        }}
                      />
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: "import",
                label: "Nhập từ Excel",
                children: (
                  <>
                    <TemplateBox kind="instructor" onDownload={handleDownloadInstructorTemplate} />
                    <Upload.Dragger
                      multiple={false}
                      accept=".xlsx,.xls"
                      beforeUpload={() => false}
                      maxCount={1}
                      fileList={
                        instrFile
                          ? [{ uid: "-1", name: instrFile.name, status: "done" } as any]
                          : []
                      }
                      onChange={(info) => {
                        const f = info.fileList?.[0]?.originFileObj as File | undefined;
                        setInstrFile(f ?? null);
                      }}
                      onRemove={() => {
                        setInstrFile(null);
                        return true;
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Bấm hoặc kéo thả tệp Excel vào đây để nhập</p>
                      <p className="ant-upload-hint">Chấp nhận: .xlsx, .xls</p>
                    </Upload.Dragger>
                  </>
                ),
              },
            ]}
          />
        </Modal>

        {/* CREATE STUDENT */}
        <Modal
          title="Tạo Học viên"
          open={isCreateStudent}
          onOk={() => (tabStud === "manual" ? submitCreateStudent() : submitImportStudent())}
          onCancel={() => {
            setIsCreateStudent(false);
            formStud.resetFields();
            setStudError(null);
            setTabStud("manual");
            setStudFile(null);
          }}
          okButtonProps={{
            loading: tabStud === "manual" ? creatingStudent : importingStud,
            disabled: tabStud === "manual" ? creatingStudent : importingStud,
          }}
          destroyOnClose
          width={700}
        >
          {studError && tabStud === "manual" && (
            <Alert style={{ marginBottom: 12 }} type="error" showIcon message={studError} />
          )}

          <Tabs
            activeKey={tabStud}
            onChange={(k) => setTabStud(k as any)}
            items={[
              {
                key: "manual",
                label: "Nhập thủ công",
                children: (
                  <Form
                    form={formStud}
                    layout="vertical"
                    onValuesChange={() => {
                      if (studError) setStudError(null);
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="userName" label="Tên đăng nhập" rules={[{ required: true }]}>
                          <Input
                            placeholder="Ví dụ: hocvien_a"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateStudent();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                          <Input
                            placeholder="Ví dụ: Trần Thị B"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateStudent();
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
                          <Input
                            placeholder="name@example.com"
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateStudent();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                          <Select options={genderOptions as any} allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="password" label="Mật khẩu">
                      <Input.Password
                        placeholder="Ít nhất 6 ký tự"
                        onPressEnter={(e) => {
                          e.preventDefault();
                          submitCreateStudent();
                        }}
                      />
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: "import",
                label: "Nhập từ Excel",
                children: (
                  <>
                    <TemplateBox kind="student" onDownload={handleDownloadStudentTemplate} />
                    <Upload.Dragger
                      multiple={false}
                      accept=".xlsx,.xls"
                      beforeUpload={() => false}
                      maxCount={1}
                      fileList={
                        studFile ? [{ uid: "-1", name: studFile.name, status: "done" } as any] : []
                      }
                      onChange={(info) => {
                        const f = info.fileList?.[0]?.originFileObj as File | undefined;
                        setStudFile(f ?? null);
                      }}
                      onRemove={() => {
                        setStudFile(null);
                        return true;
                      }}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Bấm hoặc kéo thả tệp Excel vào đây để nhập</p>
                      <p className="ant-upload-hint">Chấp nhận: .xlsx, .xls</p>
                    </Upload.Dragger>
                  </>
                ),
              },
            ]}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserOrganization;
