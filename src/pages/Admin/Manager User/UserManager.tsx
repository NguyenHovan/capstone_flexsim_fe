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
  Switch,
  message,
  Select,
} from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { AccountService } from "../../../services/account.service";
import { OrganizationService } from "../../../services/organization-manager.service";
import type { Account } from "../../../types/account";
import type { Organization } from "../../../types/organization";
import type { ColumnsType } from "antd/es/table";
import "./UserManager.css";
import { toast } from "sonner"; // Import toast from sonner

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ROLE_MAP: Record<number, string> = {
  1: "Admin",
  2: "Organization Admin",
  3: "Instructor",
  4: "Student",
};
const GENDER_MAP: Record<number, string> = {
  0: "Male",
  1: "Female",
  2: "Other",
};

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Account | null>(null);

  // Load user list
  const loadUsers = () => {
    setLoading(true);
    AccountService.getAllAccounts()
      .then((data) => setUsers(data))
      .catch(() => message.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    OrganizationService.getAll()
      .then((data) => setOrganizations(data))
      .catch(() => message.error("Failed to load organizations"));
  }, []);

  const handleCreateOrgAdmin = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        const payload = {
          ...values,
          gender: Number(values.gender),
          address: values.address || "",
        };

        AccountService.registerOrganizationAdmin(payload)
          .then(() => {
            toast.success("Organization Admin created successfully");
            form.resetFields();
            loadUsers(); // Reload the user list
            setIsCreateModalVisible(false); // Close the modal after success
          })
          .catch((err) => {
            const errorMessage =
              err?.response?.data?.message ||
              "This email is already in use. Please choose another one";

            if (errorMessage.includes("Email")) {
              toast.error(
                "This email is already in use. Please choose another one."
              );
              form.setFields([
                {
                  name: "email",
                  errors: [
                    "This email is already in use. Please choose another one.",
                  ],
                },
              ]);
            } else {
              toast.error(errorMessage);
            }
            setLoading(false);
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        setLoading(false);
        toast.error("Validation failed! Please check your input.");
      });
  };

  const handleToggleActive = (checked: boolean, record: Account) => {
    setLoading(true);
    AccountService.updateAccount(record.id, { ...record, isActive: checked })
      .then(() => {
        loadUsers();
      })
      .catch((err) =>
        message.error(
          err?.response?.data?.message || "Failed to update active status"
        )
      )
      .finally(() => setLoading(false));
  };

  const handleViewUser = (record: Account) => {
    setViewingUser(record);
    setIsViewModalVisible(true);
  };

  const handleEditUser = (record: Account) => {
    setEditingUser(record);
    form.setFieldsValue({
      userName: record.userName,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      gender: typeof record.gender === "number" ? record.gender : 0,
      address: record.address || "",
    });
    setIsEditModalVisible(true);
  };

  // Show custom confirm
  const handleDeleteUser = (user: Account) => {
    setUserToDelete(user);
    setIsDeleteConfirmVisible(true);
  };
  // Xác nhận xóa
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setLoading(true);
    AccountService.deleteAccount(userToDelete.id)
      .then(() => {
        setUsers((users) => users.filter((u) => u.id !== userToDelete.id));
        message.success("User deleted successfully");
        setIsDeleteConfirmVisible(false);
        setUserToDelete(null);
      })
      .catch((err) => {
        message.error(err?.response?.data?.message || "Failed to delete user");
        setIsDeleteConfirmVisible(false);
        setUserToDelete(null);
      })
      .finally(() => setLoading(false));
  };
  const cancelDeleteUser = () => {
    setIsDeleteConfirmVisible(false);
    setUserToDelete(null);
  };

  // Update user (cập nhật real time + lỗi custom)
  const handleUpdateUser = () => {
    form.validateFields().then((values) => {
      if (!editingUser) return;
      setLoading(true);
      const payload = {
        ...editingUser,
        ...values,
        gender: Number(values.gender),
        address: values.address || "",
      };
      AccountService.updateAccount(editingUser.id, payload)
        .then(() => {
          loadUsers();
          setIsEditModalVisible(false);
          setEditingUser(null);
          form.resetFields();
          message.success("User updated successfully");
        })
        .catch((err) => {
          // Ưu tiên show lỗi BE trả về (nếu có)
          message.error(
            err?.response?.data?.message || "Failed to update user"
          );
        })
        .finally(() => setLoading(false));
    });
  };

  const handleCreateModalClose = () => {
    setIsCreateModalVisible(false);
  };

  const columns: ColumnsType<Account> = [
    { title: "ID", dataIndex: "id", key: "id", ellipsis: true, width: 180 },
    {
      title: "Organization",
      dataIndex: "organizationId",
      key: "organizationId",
      ellipsis: true,
      width: 180,
      render: (id: string) => {
        const org = organizations.find((org) => org.id === id);
        return org ? `${org.organizationName}` : id;
      },
    },
    {
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      ellipsis: true,
      width: 120,
      render: (roleId: number) => ROLE_MAP[roleId] || roleId,
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      ellipsis: true,
      width: 140,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      width: 120,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      ellipsis: true,
      width: 100,
      render: (gender: number) => GENDER_MAP[gender] ?? "N/A",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      width: 170,
      render: (address: string) => address || "N/A",
    },
    {
      title: "Avatar",
      dataIndex: "avtUrl",
      key: "avtUrl",
      ellipsis: true,
      width: 90,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Email Verified",
      dataIndex: "isEmailVerify",
      key: "isEmailVerify",
      ellipsis: true,
      width: 120,
      render: (v: boolean) => (v ? "Yes" : "No"),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      ellipsis: true,
      width: 90,
      render: (isActive: boolean, record: Account) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(checked, record)}
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: true,
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : "N/A",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      ellipsis: true,
      width: 170,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : "N/A",
    },
    {
      title: "Deleted At",
      dataIndex: "deleteAt",
      key: "deleteAt",
      ellipsis: true,
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: Account) => (
        <div>
          <Button
            icon={<EyeOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleViewUser(record)}
          />
          <Button
            icon={<EditOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleEditUser(record)}
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

  return (
    <Layout>
      <Content>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20, padding: "0 24px" }}
        >
          <Col>
            <Title level={2} className="dashboard-title">
              User Manager
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Create Organization Admin
            </Button>
          </Col>
        </Row>
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 2200 }}
            loading={loading}
            bordered
          />
        </Card>

        {/* Modal xem chi tiết */}
        <Modal
          title="View User Details"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {viewingUser && (
            <div className="view-details">
              <p>
                <strong>ID:</strong> {viewingUser.id}
              </p>
              <p>
                <strong>Organization:</strong>{" "}
                {organizations.find(
                  (org) => org.id === viewingUser.organizationId
                )?.organizationName || viewingUser.organizationId}
              </p>
              <p>
                <strong>Role:</strong> {ROLE_MAP[viewingUser.roleId]}
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
                {viewingUser.createdAt
                  ? new Date(viewingUser.createdAt).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {viewingUser.updatedAt
                  ? new Date(viewingUser.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          )}
        </Modal>

        {/* Modal chỉnh sửa user */}
        <Modal
          title="Edit User"
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            form.resetFields();
            setEditingUser(null);
          }}
          onOk={handleUpdateUser}
          okText="Save"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="userName"
              label="Username"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value={0}>Male</Option>
                <Option value={1}>Female</Option>
                <Option value={2}>Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter address!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Create Organization Admin"
          visible={isCreateModalVisible}
          onCancel={handleCreateModalClose}
          footer={null}
        >
          <Form form={form} layout="vertical">
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
                options={organizations.map((org) => ({
                  label: `${org.organizationName}`,
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

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Please enter your phone number!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value={0}>Male</Option>
                <Option value={1}>Female</Option>
                <Option value={2}>Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[
                { required: true, message: "Please enter your address!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
            >
              <Input.Password />
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

        {/* Modal confirm xóa user thủ công */}
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
