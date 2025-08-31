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

/* =================== CONSTANTS =================== */
const roleNameMap: Record<number, string> = { 3: "Instructor", 4: "Student" };
const genderNameMap: Record<number, string> = {
  1: "Male",
  2: "Female",
  3: "Other",
};
const VISIBLE_ROLE_IDS = new Set<number>([3, 4]);

const roleOptions = [
  { label: "All roles", value: "" },
  { label: "Instructor", value: 3 },
  { label: "Student", value: 4 },
] as const;

const statusOptions = [
  { label: "All status", value: "" },
  { label: "Active", value: "active" },
  { label: "Not active", value: "inactive" },
] as const;

const sortByOptions = [
  { label: "Username", value: "userName" },
  { label: "Full name", value: "fullName" },
  { label: "Created At", value: "createdAt" },
] as const;

const sortDirOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
] as const;

const genderOptions = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Other", value: 3 },
] as const;

/* =================== UTILS =================== */
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
      form.setFields([
        { name: "email", errors: [msg || "Email already exists"] },
      ]);
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

// const downloadBlob = (blob: Blob, filename: string) => {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// const buildExcelTemplateBlob = (kind: "student" | "instructor") => {
//   const headers = [
//     "userName",
//     "fullName",
//     "email",
//     "password",
//     "gender",
//     "phone",
//     "address",
//   ];
//   const example = [
//     kind === "student" ? "student_a" : "instructor_a",
//     kind === "student" ? "Student A" : "Instructor A",
//     kind === "student" ? "student.a@example.com" : "instructor.a@example.com",
//     "Abc@123",
//     "1",
//     "0901234567",
//     "Hanoi",
//   ];
//   const tableRows =
//     `<tr>${headers
//       .map(
//         (h) =>
//           `<th style="border:1px solid #ddd;padding:6px;background:#fafbff">${h}</th>`
//       )
//       .join("")}</tr>` +
//     `<tr>${example
//       .map((v) => `<td style="border:1px solid #ddd;padding:6px">${v}</td>`)
//       .join("")}</tr>`;
//   const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
//       <table border="1" style="border-collapse:collapse">${tableRows}</table>
//     </body></html>`;
//   return new Blob([html], { type: "application/vnd.ms-excel" });
// };

/* =================== TEMPLATE BOX =================== */
type TmplRow = { name: string; required: boolean; example: string };

const TMPL_COLS: ColumnsType<TmplRow> = [
  { title: "Column", dataIndex: "name", key: "name", width: 180 },
  {
    title: "Required",
    dataIndex: "required",
    key: "required",
    width: 110,
    render: (v) => (v ? <Tag color="red">Yes</Tag> : <Tag>Optional</Tag>),
  },
  { title: "Example", dataIndex: "example", key: "example" },
];

const TEMPLATE_ROWS: TmplRow[] = [
  { name: "userName", required: true, example: "nguyenvana" },
  { name: "fullName", required: true, example: "Nguyễn Văn A" },
  { name: "email", required: true, example: "a@example.com" },
  { name: "password", required: true, example: "Abc@123" },
  // {
  //   name: "gender",
  //   required: false,
  //   example: "1 | 2 | 3 (1=Male, 2=Female, 3=Other)",
  // },
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
        <InfoCircleOutlined /> Template columns —{" "}
        {kind === "student" ? "Student" : "Instructor"}
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
        • <b>Bắt buộc:</b> <code>userName</code>, <code>fullName</code>,{" "}
        <code>email</code>, <code>password</code>
      </div>
      <div>
        • Chấp nhận import: <b>.xlsx/.xls</b>. Nếu dùng <code>gender</code>:
        1=Male, 2=Female, 3=Other.
      </div>
    </div>
  </Card>
);

/* =================== COMPONENT =================== */
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

  // toast flags
  const [, setShowUpdatedToast] = useState(false);
  const toastFlagRef = useRef(false); // chống double-fire
  const prevOpenRef = useRef(false); // theo dõi chuyển trạng thái open→close

  // inline errors
  const [instrError, setInstrError] = useState<string | null>(null);
  const [studError, setStudError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // search/filter/sort
  const [searchText, setSearchText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    ""
  );
  const [sortBy, setSortBy] = useState<"userName" | "fullName" | "createdAt">(
    "createdAt"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // import tabs + files
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
      message.error(getBEMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) {
      message.error("Organization not found");
      return;
    }
    load();
  }, [orgId]);

  const bc = useMemo(() => new BroadcastChannel("org-accounts"), []);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const msg = e.data as { type: string; organizationId?: string };
      if (msg?.type?.startsWith("account:") && msg.organizationId === orgId)
        load();
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

  const loadUsser = async (opts?: {
    close?: "edit" | "instr" | "stud" | "all";
  }) => {
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
    const beToUi = (g?: number) =>
      g === 0 ? 1 : g === 1 ? 2 : g === 2 ? 3 : undefined;

    formEdit.setFieldsValue({
      userName: u.userName,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      gender: beToUi(u.gender),
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

      if (
        trim(v.fullName) &&
        trim(v.fullName) !== (editingUser.fullName ?? "")
      ) {
        diff.fullName = trim(v.fullName) as string;
      }
      if (v.gender !== undefined) {
        const uiToBe: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
        const normalized = uiToBe[Number(v.gender)] ?? Number(v.gender);
        if (normalized !== Number(editingUser.gender)) diff.gender = normalized;
      }
      if (trim(v.phone) !== (editingUser.phone ?? ""))
        diff.phone = trim(v.phone) as string | undefined;
      if (trim(v.address) !== (editingUser.address ?? ""))
        diff.address = trim(v.address) as string | undefined;
      const newAvt = (trim(v.avtUrl) as string) || "";
      if (newAvt !== (editingUser.avtUrl || "")) diff.avtUrl = newAvt;

      if (Object.keys(diff).length === 0) {
        setSavingEdit(false);
        message.info("Không có thay đổi nào để cập nhật");
        return;
      }

      await AccountService.updateAccount(editingUser.id, diff);
      await load();
      setShowUpdatedToast(true);
      toastFlagRef.current = true;

      // đóng form + reset
      setIsEditModal(false);
      formEdit.resetFields();
      setEditingUser(null);
      setEditError(null);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      if (status === 400)
        setEditError(getBEMessage(err, "Yêu cầu không hợp lệ (400)."));
    } finally {
      setSavingEdit(false);
    }
  };

  /* ====== Toggle via Switch ====== */
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
        curr.map((u) =>
          u.id === updated.id ? { ...u, isActive: updated.isActive } : u
        )
      );
    } catch (err) {
      message.error(getBEMessage(err, "Không thể đổi trạng thái tài khoản"));
    } finally {
      setTogglingId(null);
    }
  };

  /* ====== Ban/Unban via ACTION buttons ====== */
  const onBanBtn = async (rec: Account) => {
    if (actionId) return;
    setActionId(rec.id);
    try {
      const updated = await AccountService.banAccount(rec.id);
      setUsers((curr) =>
        curr.map((u) => (u.id === updated.id ? { ...u, isActive: false } : u))
      );
      bc.postMessage({ type: "account:banned", organizationId: orgId });
      message.success("Đã khoá tài khoản");
    } catch (err) {
      message.error(getBEMessage(err, "Cannot ban user"));
    } finally {
      setActionId(null);
    }
  };

  const onUnbanBtn = async (rec: Account) => {
    if (actionId) return;
    setActionId(rec.id);
    try {
      const updated = await AccountService.unbanAccount(rec.id);
      setUsers((curr) =>
        curr.map((u) => (u.id === updated.id ? { ...u, isActive: true } : u))
      );
      bc.postMessage({ type: "account:unbanned", organizationId: orgId });
      message.success("Đã mở khoá tài khoản");
    } catch (err) {
      message.error(getBEMessage(err, "Cannot unban user"));
    } finally {
      setActionId(null);
    }
  };

  /* ====== Create (manual) ====== */
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
      message.success("Tạo tài khoản Instructor thành công");
    } catch (err: any) {
      if (setEmailDuplicateError(formInstr, err)) return;
      setInstrError(getBEMessage(err, "Cannot create instructor"));
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
      message.success("Tạo tài khoản Student thành công");
    } catch (err: any) {
      if (setEmailDuplicateError(formStud, err)) return;
      setStudError(getBEMessage(err, "Cannot create student"));
    } finally {
      setCreatingStudent(false);
    }
  };

  /* ====== Import/Export (template download + import) ====== */
  const handleDownloadInstructorTemplate = () => {
    // const blob = buildExcelTemplateBlob("instructor");
    // downloadBlob(blob, "instructors_template.xls");
    // message.success("Đã tải file mẫu Instructor (.xls)");
    const a = document.createElement("a");
    a.href = "/files/AccountExcel.xlsx";
    a.download = "instructor_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleDownloadStudentTemplate = () => {
    // const blob = buildExcelTemplateBlob("student");
    // downloadBlob(blob, "students_template.xls");
    // message.success("Đã tải file mẫu Student (.xls)");
    const a = document.createElement("a");
    a.href = "/files/AccountExcel.xlsx";
    a.download = "student_template.xlsx";
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
      message.success("Tạo tài khoản từ file (Instructor) thành công");
      await loadUsser({ close: "instr" });
    } catch (e: any) {
      message.error(e?.message || "Import instructors failed");
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
      message.success("Tạo tài khoản từ file (Student) thành công");
      await loadUsser({ close: "stud" });
    } catch (e: any) {
      message.error(e?.message || "Import students failed");
    } finally {
      setImportingStud(false);
      setStudFile(null);
    }
  };

  /* ====== View data (search/filter/sort) ====== */
  const dataView = useMemo(() => {
    const q = debounced.toLowerCase();
    let list = users.filter((u) => VISIBLE_ROLE_IDS.has(Number(u.roleId)));
    list = list.filter((u) => {
      const hitQ =
        !q ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q));
      const hitRole =
        roleFilter === "" ? true : Number(u.roleId) === roleFilter;
      const hitStatus =
        statusFilter === ""
          ? true
          : statusFilter === "active"
          ? u.isActive
          : !u.isActive;
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
      title: "Image",
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
    { title: "Username", dataIndex: "userName", key: "userName", width: 140 },
    { title: "Full Name", dataIndex: "fullName", key: "fullName", width: 180 },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    {
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      width: 120,
      render: (r) => roleNameMap[Number(r)] || r,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 110,
      // BE trả 0/1/2 -> hiển thị chuẩn; nếu lỡ khác, fallback map 1/2/3
      render: (g) =>
        g === 0
          ? "Male"
          : g === 1
          ? "Female"
          : g === 2
          ? "Other"
          : genderNameMap[Number(g)] || g,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (_: boolean, rec) => (
        <Switch
          checkedChildren="On"
          unCheckedChildren="Off"
          checked={!!rec.isActive}
          loading={togglingId === rec.id}
          disabled={actionId === rec.id}
          onChange={(checked) => onToggleActive(rec, checked)}
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : "–"),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : "–"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, rec) => (
        <Space wrap size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(rec)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(rec)}
          >
            Edit
          </Button>
          {rec.isActive ? (
            <Button
              icon={<StopOutlined />}
              size="small"
              danger
              loading={actionId === rec.id}
              onClick={() => onBanBtn(rec)}
            >
              Ban
            </Button>
          ) : (
            <Button
              icon={<CheckCircleOutlined />}
              size="small"
              type="primary"
              loading={actionId === rec.id}
              onClick={() => onUnbanBtn(rec)}
            >
              Unban
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {/* Header + create buttons */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              User Manager
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
                Create Instructor
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
                Create Student
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Toolbar */}
        <Card style={{ marginBottom: 12 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10} lg={12}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search by username or full name…"
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

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={dataView}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
            }}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* View modal */}
        <Modal
          title="User Details"
          open={isViewModal}
          footer={<Button onClick={() => setIsViewModal(false)}>Close</Button>}
          onCancel={() => setIsViewModal(false)}
          destroyOnHidden
          width={600}
        >
          {viewingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <b>Id:</b> {viewingUser.id}
                </p>
                <p>
                  <b>Username:</b> {viewingUser.userName}
                </p>
                <p>
                  <b>Full Name:</b> {viewingUser.fullName}
                </p>
                <p>
                  <b>Organization:</b> {viewingUser.organizationId}
                </p>
                <p>
                  <b>Email:</b> {viewingUser.email}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <b>Phone:</b> {viewingUser.phone}
                </p>
                <p>
                  <b>Role:</b>{" "}
                  {roleNameMap[Number(viewingUser.roleId)] ||
                    viewingUser.roleId}
                </p>
                <p>
                  <b>Gender:</b>{" "}
                  {viewingUser.gender === 0
                    ? "Male"
                    : viewingUser.gender === 1
                    ? "Female"
                    : viewingUser.gender === 2
                    ? "Other"
                    : genderNameMap[Number(viewingUser.gender)]}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  {viewingUser.isActive ? "Active" : "Not active"}
                </p>
              </Col>
            </Row>
          )}
        </Modal>

        {/* Edit modal */}
        <Modal
          title="Edit User"
          open={isEditModal}
          onOk={submitEdit}
          onCancel={() => {
            setIsEditModal(false);
            formEdit.resetFields();
            setEditingUser(null);
            setEditError(null);
          }}
          okButtonProps={{ loading: savingEdit, disabled: savingEdit }}
          destroyOnHidden
          width={680}
          afterOpenChange={(opened) => {
            if (!opened && toastFlagRef.current) {
              message.success("Cập nhật tài khoản thành công!");
              toastFlagRef.current = false;
              setShowUpdatedToast(false);
            }
          }}
        >
          {editError && (
            <Alert
              style={{ marginBottom: 12 }}
              type="error"
              showIcon
              message={editError}
            />
          )}

          <Form
            form={formEdit}
            layout="vertical"
            onValuesChange={() => {
              if (editError) setEditError(null);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fullName" label="Full Name">
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
                <Form.Item name="gender" label="Gender">
                  <Select options={genderOptions as any} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="Phone">
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
                <Form.Item name="address" label="Address">
                  <Input
                    onPressEnter={(e) => {
                      e.preventDefault();
                      submitEdit();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="avtUrl"
                  label="Image (Cloudinary)"
                  valuePropName="value"
                >
                  <UploadCloudinary
                    value={formEdit.getFieldValue("avtUrl")}
                    onChange={(url) => formEdit.setFieldsValue({ avtUrl: url })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Create Instructor (manual + import) */}
        <Modal
          title="Create New Instructor"
          open={isCreateInstructor}
          onOk={() =>
            tabInstr === "manual"
              ? submitCreateInstructor()
              : submitImportInstructor()
          }
          onCancel={() => {
            setIsCreateInstructor(false);
            formInstr.resetFields();
            setInstrError(null);
            setTabInstr("manual");
            setInstrFile(null);
          }}
          okButtonProps={{
            loading:
              tabInstr === "manual" ? creatingInstructor : importingInstr,
            disabled:
              tabInstr === "manual" ? creatingInstructor : importingInstr,
          }}
          destroyOnHidden
          width={700}
        >
          {instrError && tabInstr === "manual" && (
            <Alert
              style={{ marginBottom: 12 }}
              type="error"
              showIcon
              message={instrError}
            />
          )}

          <Tabs
            activeKey={tabInstr}
            onChange={(k) => setTabInstr(k as any)}
            items={[
              {
                key: "manual",
                label: "Create manually",
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
                        <Form.Item
                          name="userName"
                          label="Username"
                          rules={[{ required: true }]}
                        >
                          <Input
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateInstructor();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="fullName"
                          label="Full Name"
                          rules={[{ required: true }]}
                        >
                          <Input
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
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[{ required: true }, { type: "email" }]}
                        >
                          <Input
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateInstructor();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="gender" label="Gender">
                          <Select options={genderOptions as any} allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="password" label="Password">
                      <Input.Password
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
                label: "Import from Excel",
                children: (
                  <>
                    <TemplateBox
                      kind="instructor"
                      onDownload={handleDownloadInstructorTemplate}
                    />
                    <Upload.Dragger
                      multiple={false}
                      accept=".xlsx,.xls"
                      beforeUpload={() => false}
                      maxCount={1}
                      fileList={
                        instrFile
                          ? [
                              {
                                uid: "-1",
                                name: instrFile.name,
                                status: "done",
                              } as any,
                            ]
                          : []
                      }
                      onChange={(info) => {
                        const f = info.fileList?.[0]?.originFileObj as
                          | File
                          | undefined;
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
                      <p className="ant-upload-text">
                        Click or drag Excel file to this area to import
                      </p>
                      <p className="ant-upload-hint">Accepted: .xlsx, .xls</p>
                    </Upload.Dragger>
                  </>
                ),
              },
            ]}
          />
        </Modal>

        {/* Create Student (manual + import) */}
        <Modal
          title="Create New Student"
          open={isCreateStudent}
          onOk={() =>
            tabStud === "manual" ? submitCreateStudent() : submitImportStudent()
          }
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
          destroyOnHidden
          width={700}
        >
          {studError && tabStud === "manual" && (
            <Alert
              style={{ marginBottom: 12 }}
              type="error"
              showIcon
              message={studError}
            />
          )}

          <Tabs
            activeKey={tabStud}
            onChange={(k) => setTabStud(k as any)}
            items={[
              {
                key: "manual",
                label: "Create manually",
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
                        <Form.Item
                          name="userName"
                          label="Username"
                          rules={[{ required: true }]}
                        >
                          <Input
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateStudent();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="fullName"
                          label="Full Name"
                          rules={[{ required: true }]}
                        >
                          <Input
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
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[{ required: true }, { type: "email" }]}
                        >
                          <Input
                            onPressEnter={(e) => {
                              e.preventDefault();
                              submitCreateStudent();
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="gender" label="Gender">
                          <Select options={genderOptions as any} allowClear />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="password" label="Password">
                      <Input.Password
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
                label: "Import from Excel",
                children: (
                  <>
                    <TemplateBox
                      kind="student"
                      onDownload={handleDownloadStudentTemplate}
                    />
                    <Upload.Dragger
                      multiple={false}
                      accept=".xlsx,.xls"
                      beforeUpload={() => false}
                      maxCount={1}
                      fileList={
                        studFile
                          ? [
                              {
                                uid: "-1",
                                name: studFile.name,
                                status: "done",
                              } as any,
                            ]
                          : []
                      }
                      onChange={(info) => {
                        const f = info.fileList?.[0]?.originFileObj as
                          | File
                          | undefined;
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
                      <p className="ant-upload-text">
                        Click or drag Excel file to this area to import
                      </p>
                      <p className="ant-upload-hint">Accepted: .xlsx, .xls</p>
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
