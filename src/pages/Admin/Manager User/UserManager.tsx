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
  Image,
  Alert,
  Switch,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { AccountService } from "../../../services/account.service";
import { OrganizationService } from "../../../services/organization-manager.service";
import type { Account } from "../../../types/account";
import type { Organization } from "../../../types/organization";
import type { ColumnsType } from "antd/es/table";
import "./userManager.css";
import { toast } from "sonner";

const { Content } = Layout;
const { Title } = Typography;

const ROLE_LABEL_MAP: Record<number, string> = {
  1: "Admin",
  2: "Organization Admin",
  3: "Instructor",
  4: "Student",
};

type RoleSlug = "admin" | "organizationAdmin" | "instructor" | "student";
const ROLE_SLUG_MAP: Record<number, RoleSlug> = {
  1: "admin",
  2: "organizationAdmin",
  3: "instructor",
  4: "student",
};

const ROLE_OPTIONS: { label: string; value: RoleSlug }[] = [
  { label: "Admin", value: "admin" },
  { label: "Organization Admin", value: "organizationAdmin" },
  { label: "Instructor", value: "instructor" },
  { label: "Student", value: "student" },
];

const GENDER_MAP: Record<number, string> = {
  1: "Male",
  2: "Female",
  3: "Other",
};


const avatarFallback = (name?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}`;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const compareStr = (a?: string, b?: string) =>
  (a || "").localeCompare(b || "", "vi", { sensitivity: "base" });

const getBE400Message = (err: any) => {
  const status = err?.response?.status;
  if (status !== 400) return null;
  const data = err?.response?.data;
  const raw =
    (typeof data === "string" ? data : "") ||
    data?.message ||
    data?.title ||
    "";
  const errors = data?.errors;
  const firstField =
    errors &&
    Object.keys(errors).length > 0 &&
    errors[Object.keys(errors)[0]]?.[0];
  return (firstField as string) || raw || "Invalid request.";
};

const setEmailDuplicateIfAny = (form: any, err: any): boolean => {
  const msg = getBE400Message(err);
  if (!msg) return false;
  const lower = msg.toLowerCase();
  const looksDup =
    lower.includes("duplicate") ||
    lower.includes("already") ||
    lower.includes("exist") ||
    lower.includes("đã tồn tại") ||
    lower.includes("tồn tại") ||
    lower.includes("email");
  if (looksDup) {
    form.setFields([{ name: "email", errors: [msg] }]);
    return true;
  }
  return false;
};

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  const [rowLoadingId, setRowLoadingId] = useState<string | null>(null);

  const [formCreate] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Account | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<RoleSlug | undefined>(undefined);
  const [orgFilter, setOrgFilter] = useState<string | undefined>(undefined);

  const organizationsById = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((o) => map.set(o.id, o));
    return map;
  }, [organizations]);

  const getOrgName = (id?: string) =>
    (id && organizationsById.get(id)?.organizationName) || id || "N/A";

  const loadUsers = () => {
    setLoading(true);
    AccountService.getAllAccounts()
      .then((data) => setUsers(data))
      .catch((err) =>
        message.error(
          err?.response?.status === 400
            ? getBE400Message(err) ?? "Invalid request."
            : "Failed to load users."
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    OrganizationService.getAll()
      .then((data) => setOrganizations(data))
      .catch(() => message.error("Failed to load organizations."));
  }, []);

  const handleCreateOrgAdmin = () => {
    formCreate
      .validateFields()
      .then((values) => {
        setLoading(true);
        setCreateError(null);

        const payload = {
          ...values,
          gender: Number(values.gender),
          address: values.address || "",
        };

        AccountService.registerOrganizationAdmin(payload)
          .then(() => {
            setIsCreateModalVisible(false);
            formCreate.resetFields();
            toast.success("Organization Admin created successfully.");
            loadUsers();
          })
          .catch((err) => {
            const be400 = getBE400Message(err);
            if (be400) {
              if (setEmailDuplicateIfAny(formCreate, err)) return;
              setCreateError(be400); // e.g., Organization unpaid
              return;
            }
            console.error("Create org admin failed:", err);
            setCreateError("Failed to create Organization Admin.");
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        setCreateError("Please check the required fields.");
      });
  };

  const handleToggleActive = (checked: boolean, record: Account) => {
    setRowLoadingId(record.id);
    const fn = checked
      ? AccountService.unbanAccount
      : AccountService.banAccount;
    fn(record.id)
      .then(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === record.id ? { ...u, isActive: checked } : u
          )
        );
        message.success("Status updated.");
      })
      .catch((err) => {
        const be400 = getBE400Message(err);
        message.error(be400 ?? "Failed to update status.");
      })
      .finally(() => setRowLoadingId(null));
  };

  const handleViewUser = (record: Account) => {
    setViewingUser(record);
    setIsViewModalVisible(true);
  };

  const handleDeleteUser = (user: Account) => {
    setUserToDelete(user);
    setIsDeleteConfirmVisible(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setLoading(true);
    AccountService.deleteAccount(userToDelete.id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        message.success("User deleted successfully.");
      })
      .catch((err) => {
        const be400 = getBE400Message(err);
        message.error(be400 ?? "Failed to delete user.");
      })
      .finally(() => {
        setIsDeleteConfirmVisible(false);
        setUserToDelete(null);
        setLoading(false);
      });
  };

  const cancelDeleteUser = () => {
    setIsDeleteConfirmVisible(false);
    setUserToDelete(null);
  };

  const filteredUsers = useMemo(() => {
    const kw = norm(keyword);

    return users.filter((u) => {
      if (kw) {
        const roleLabel = ROLE_LABEL_MAP[u.roleId] || `${u.roleId}`;
        const roleSlug = ROLE_SLUG_MAP[u.roleId] || "";
        const fields = [
          norm(u.userName),
          norm(u.fullName),
          norm(u.email),
          norm(u.phone),
          norm(getOrgName(u.organizationId)),
          norm(roleLabel),
          norm(roleSlug),
        ];
        const starts = fields.some((x) => x.startsWith(kw));
        if (!starts && !fields.some((x) => x.includes(kw))) {
          return false;
        }
      }

      if (roleFilter && ROLE_SLUG_MAP[u.roleId] !== roleFilter) return false;
      if (orgFilter && u.organizationId !== orgFilter) return false;

      return true;
    });
  }, [users, keyword, roleFilter, orgFilter, organizationsById]);

  const columns: ColumnsType<Account> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      ellipsis: true,
      width: 220,
      sorter: (a, b) => compareStr(a.id, b.id),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Image",
      dataIndex: "avtUrl",
      key: "image",
      width: 110,
      render: (url: string, record: Account) => (
        <Image
          src={url || avatarFallback(record.fullName || record.userName)}
          fallback={avatarFallback(record.fullName || record.userName)}
          width={40}
          style={{
            height: 40,
            objectFit: "cover",
            borderRadius: 8,
            display: "block",
            margin: "0 auto",
          }}
          preview={url ? { mask: "Preview" } : false}
          alt={`avatar-${record.userName}`}
        />
      ),
    },
    {
      title: "Organization",
      dataIndex: "organizationId",
      key: "organizationId",
      ellipsis: true,
      width: 220,
      render: (id: string) => getOrgName(id),
      sorter: (a, b) =>
        compareStr(getOrgName(a.organizationId), getOrgName(b.organizationId)),
    },
    {
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      ellipsis: true,
      width: 160,
      render: (roleId: number) => ROLE_LABEL_MAP[roleId] || roleId,
      sorter: (a, b) => (a.roleId || 0) - (b.roleId || 0),
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      ellipsis: true,
      width: 160,
      sorter: (a, b) => compareStr(a.userName, b.userName),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
      width: 180,
      sorter: (a, b) => compareStr(a.fullName, b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 240,
      sorter: (a, b) => compareStr(a.email, b.email),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      width: 160,
      sorter: (a, b) => compareStr(a.phone, b.phone),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      ellipsis: true,
      width: 120,
      render: (gender: number) => GENDER_MAP[gender] ?? "N/A",
      sorter: (a, b) => compareStr(GENDER_MAP[a.gender], GENDER_MAP[b.gender]),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      width: 220,
      render: (address: string) => address || "N/A",
      sorter: (a, b) => compareStr(a.address, b.address),
    },
    {
      title: "Email Verified",
      dataIndex: "isEmailVerify",
      key: "isEmailVerify",
      ellipsis: true,
      width: 150,
      render: (v: boolean) => (v ? "Yes" : "No"),
      sorter: (a, b) => Number(a.isEmailVerify) - Number(b.isEmailVerify),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean, record: Account) => (
        <Switch
          checked={isActive}
          loading={rowLoadingId === record.id}
          onChange={(checked) => handleToggleActive(checked, record)}
        />
      ),
      sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: true,
      width: 190,
      render: (date?: string) => {
        const time =
          date && !Number.isNaN(Date.parse(date)) ? new Date(date) : null;
        return time ? time.toLocaleString() : "N/A";
      },
      sorter: (a, b) =>
        (a.createdAt && !Number.isNaN(Date.parse(a.createdAt))
          ? Date.parse(a.createdAt)
          : 0) -
        (b.createdAt && !Number.isNaN(Date.parse(b.createdAt))
          ? Date.parse(b.createdAt)
          : 0),
      defaultSortOrder: "descend",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      ellipsis: true,
      width: 190,
      render: (date?: string) => {
        const time =
          date && !Number.isNaN(Date.parse(date)) ? new Date(date) : null;
        return time ? time.toLocaleString() : "N/A";
      },
      sorter: (a, b) =>
        (a.updatedAt && !Number.isNaN(Date.parse(a.updatedAt))
          ? Date.parse(a.updatedAt)
          : 0) -
        (b.updatedAt && !Number.isNaN(Date.parse(b.updatedAt))
          ? Date.parse(b.updatedAt)
          : 0),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: any, record: Account) => (
        <div>
          <Button
            icon={<EyeOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleViewUser(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(record)}
          />
        </div>
      ),
    },
  ];

  const resetFilters = () => {
    setKeyword("");
    setRoleFilter(undefined);
    setOrgFilter(undefined);
  };

  return (
    <Layout>
      <Content>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 12, padding: "0 24px" }}
        >
          <Col>
            <Title
              level={2}
              className="dashboard-title"
              style={{ marginBottom: 0 }}
            >
              User Manager
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => {
                setIsCreateModalVisible(true);
                setCreateError(null);
                formCreate.resetFields();
              }}
            >
              Create Organization Admin
            </Button>
          </Col>
        </Row>

        <Card style={{ margin: "0 24px 12px" }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={10}>
              <Input
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder=""
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Select<RoleSlug>
                allowClear
                value={roleFilter}
                onChange={(v) => setRoleFilter(v)}
                style={{ width: "100%" }}
                placeholder="Filter by Role"
                options={ROLE_OPTIONS}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={7}>
              <Select
                allowClear
                showSearch
                value={orgFilter}
                onChange={(v) => setOrgFilter(v)}
                style={{ width: "100%" }}
                placeholder="Filter by Organization"
                optionFilterProp="label"
                options={organizations.map((org) => ({
                  label: org.organizationName,
                  value: org.id,
                }))}
              />
            </Col>
            <Col xs={24} md={6} lg={2} style={{ textAlign: "right" }}>
              <Button icon={<ReloadOutlined />} onClick={resetFilters} block>
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        <Card style={{ margin: "0 24px" }}>
          <Table<Account>
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 2200 }}
            loading={loading}
            bordered
          />
        </Card>

        <Modal
          title="View User Details"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={null}
          width={600}
          destroyOnHidden
        >
          {viewingUser && (
            <div className="view-details">
              <p>
                <strong>ID:</strong> {viewingUser.id}
              </p>
              <p>
                <strong>Organization:</strong>{" "}
                {getOrgName(viewingUser.organizationId)}
              </p>
              <p>
                <strong>Role:</strong> {ROLE_LABEL_MAP[viewingUser.roleId]}
              </p>
              <p>
                <strong>Username:</strong> {viewingUser.userName}
              </p>
              <p>
                <strong>Full Name:</strong> {viewingUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {viewingUser.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewingUser.phone}
              </p>
              <p>
                <strong>Gender:</strong> {GENDER_MAP[viewingUser.gender]}
              </p>
              <p>
                <strong>Address:</strong> {viewingUser.address || "N/A"}
              </p>
              <p>
                <strong>Avatar URL:</strong>{" "}
                {viewingUser.avtUrl ? (
                  <a
                    href={viewingUser.avtUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Email Verified:</strong>{" "}
                {viewingUser.isEmailVerify ? "Yes" : "No"}
              </p>
              <p>
                <strong>Active:</strong> {viewingUser.isActive ? "Yes" : "No"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {viewingUser.createdAt &&
                !Number.isNaN(Date.parse(viewingUser.createdAt))
                  ? new Date(viewingUser.createdAt).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {viewingUser.updatedAt &&
                !Number.isNaN(Date.parse(viewingUser.updatedAt))
                  ? new Date(viewingUser.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          )}
        </Modal>

        {/* Create Org Admin */}
        <Modal
          title="Create Organization Admin"
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            setCreateError(null);
            formCreate.resetFields();
          }}
          footer={null}
          destroyOnHidden
        >
          {createError && (
            <Alert
              style={{ marginBottom: 12 }}
              type="error"
              showIcon
              message={createError}
            />
          )}

          <Form
            form={formCreate}
            layout="vertical"
            onValuesChange={() => {
              if (createError) setCreateError(null);
            }}
          >
            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[
                { required: true, message: "Please select an organization!" },
              ]}
            >
              <Select
                showSearch
                placeholder="Select an organization"
                optionFilterProp="label"
                options={organizations.map((org) => ({
                  label: org.organizationName,
                  value: org.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="userName"
              label="Username"
              rules={[{ required: true, message: "Please enter a username!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter your full name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>

            <Form.Item name="gender" label="Gender">
              <Select options={GENDER_OPTIONS} />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item> */}

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password" },
                {
                  pattern: PASSWORD_REGEX,
                  message:
                    "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
                },
              ]}
            >
              <Input.Password
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleCreateOrgAdmin();
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              onClick={handleCreateOrgAdmin}
              loading={loading}
            >
              Create Organization Admin
            </Button>
          </Form>
        </Modal>

        {/* Confirm delete */}
        <Modal
          open={isDeleteConfirmVisible}
          title="Confirm Delete"
          onOk={confirmDeleteUser}
          onCancel={cancelDeleteUser}
          okText="Delete"
          okButtonProps={{ danger: true }}
          confirmLoading={loading}
        >
          <p>
            Are you sure you want to delete this user?
            <br />
            <b>
              {userToDelete?.fullName || ""} ({userToDelete?.email || ""})
            </b>
            <br />
            This action cannot be undone.
          </p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserManager;
