import {
  Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message, Select
} from 'antd';
import {
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { AccountService } from '../../../services/account.service';
import { OrganizationService } from '../../../services/organization-manager.service';
import type { Account } from '../../../types/account';
import type { Organization } from '../../../types/organization';
import type { ColumnsType } from 'antd/es/table';
import './UserManager.css';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ROLE_MAP: Record<number, string> = {
  1: 'Admin',
  2: 'Oranization Admin',
  3: 'Instructor',
  4: 'Student',
};
const GENDER_MAP: Record<number, string> = {
  0: 'Male',
  1: 'Female',
  2: 'Other',
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

  useEffect(() => {
    setLoading(true);
    AccountService.getAllAccounts()
      .then(data => setUsers(data))
      .catch(() => message.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    OrganizationService.getAll()
      .then(data => setOrganizations(data))
      .catch(() => message.error('Failed to load organizations'));
  }, []);

  const handleToggleActive = (checked: boolean, record: Account) => {
    setLoading(true);
    AccountService.updateAccount(record.id, { ...record, isActive: checked })
      .then(updatedUser => {
        setUsers(users => users.map(u => u.id === record.id ? updatedUser : u));
      })
      .catch(() => message.error('Failed to update active status'))
      .finally(() => setLoading(false));
  };

  const handleViewUser = (record: Account) => {
    setViewingUser(record);
    setIsViewModalVisible(true);
  };

  const handleEditUser = (record: Account) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      gender: record.gender,
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteUser = (id: string) => {
    setLoading(true);
    AccountService.deleteAccount(id)
      .then(() => {
        setUsers(users => users.filter(u => u.id !== id));
        message.success('User deleted successfully');
      })
      .catch(() => message.error('Failed to delete user'))
      .finally(() => setLoading(false));
  };

  const handleUpdateUser = () => {
    form.validateFields()
      .then(values => {
        if (!editingUser) return;
        setLoading(true);
        AccountService.updateAccount(editingUser.id, { ...editingUser, ...values })
          .then(updatedUser => {
            setUsers(users => users.map(u => u.id === editingUser.id ? updatedUser : u));
            setIsEditModalVisible(false);
            setEditingUser(null);
            form.resetFields();
            message.success('User updated successfully');
          })
          .catch(() => message.error('Failed to update user'))
          .finally(() => setLoading(false));
      });
  };

  const handleCreateOrgAdmin = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        AccountService.registerOrganizationAdmin(values)
          .then(newUser => {
            setUsers(prev => [...prev, newUser]);
            setIsCreateModalVisible(false);
            form.resetFields();
            message.success('Organization Admin created successfully');
          })
          .catch(() => message.error('Failed to create Organization Admin'))
          .finally(() => setLoading(false));
      });
  };

  // ================== COLUMNS TABLE ==================
  const columns: ColumnsType<Account> = [
    { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 180 },
    {
      title: 'Organization', dataIndex: 'organizationId', key: 'organizationId', ellipsis: true, width: 180,
      render: (id: string) => {
        const org = organizations.find(org => org.id === id);
        return org ? `${org.organizationName}` : id;
      }
    },
    {
      title: 'Role', dataIndex: 'roleId', key: 'roleId', ellipsis: true, width: 120,
      render: (roleId: number) => ROLE_MAP[roleId] || roleId,
    },
    { title: 'Username', dataIndex: 'userName', key: 'userName', ellipsis: true, width: 140 },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', ellipsis: true, width: 140 },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, width: 200 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', ellipsis: true, width: 120 },
    {
      title: 'Gender', dataIndex: 'gender', key: 'gender', ellipsis: true, width: 100,
      render: (gender: number) => GENDER_MAP[gender] || gender
    },
    { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true, width: 170 },
    {
      title: 'Avatar', dataIndex: 'avtUrl', key: 'avtUrl', ellipsis: true, width: 90,
      render: (url: string) => url ? <a href={url} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'
    },
    {
      title: 'Email Verified', dataIndex: 'isEmailVerify', key: 'isEmailVerify', ellipsis: true, width: 120,
      render: (v: boolean) => v ? 'Yes' : 'No'
    },
    {
      title: 'Active', dataIndex: 'isActive', key: 'isActive', ellipsis: true, width: 90,
      render: (isActive: boolean, record: Account) => (
        <Switch checked={isActive} onChange={checked => handleToggleActive(checked, record)} />
      ),
    },
    {
      title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', ellipsis: true, width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt', ellipsis: true, width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Deleted At', dataIndex: 'deleteAt', key: 'deleteAt', ellipsis: true, width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
   {
  title: 'Actions',
  key: 'actions',
  dataIndex: 'actions',
  width: 120,
  render: (_: any, record: Account) => (
    <div>
      <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} onClick={() => handleViewUser(record)} />
      <Button icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditUser(record)} />
      <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteUser(record.id)} />
    </div>
  ),
}
  ];

  return (
    <Layout>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20, padding: '0 24px' }}>
          <Col>
            <Title level={2} className="dashboard-title">User Manager</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setIsCreateModalVisible(true);
              }}
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
              <p><strong>ID:</strong> {viewingUser.id}</p>
              <p><strong>Organization:</strong> {organizations.find(org => org.id === viewingUser.organizationId)?.organizationName || viewingUser.organizationId}</p>
              <p><strong>Role:</strong> {ROLE_MAP[viewingUser.roleId]}</p>
              <p><strong>Username:</strong> {viewingUser.userName}</p>
              <p><strong>Full Name:</strong> {viewingUser.fullName}</p>
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Phone:</strong> {viewingUser.phone}</p>
              <p><strong>Gender:</strong> {GENDER_MAP[viewingUser.gender]}</p>
              <p><strong>Address:</strong> {viewingUser.address || 'N/A'}</p>
              <p><strong>Avatar URL:</strong> {viewingUser.avtUrl ? <a href={viewingUser.avtUrl} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</p>
              <p><strong>Email Verified:</strong> {viewingUser.isEmailVerify ? 'Yes' : 'No'}</p>
              <p><strong>Active:</strong> {viewingUser.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {new Date(viewingUser.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated At:</strong> {viewingUser.updatedAt ? new Date(viewingUser.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Deleted At:</strong> {viewingUser.deleteAt ? new Date(viewingUser.deleteAt).toLocaleDateString() : 'N/A'}</p>
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
            <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select>
                <Option value={0}>Male</Option>
                <Option value={1}>Female</Option>
                <Option value={2}>Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo Organization Admin */}
        <Modal
          title="Create Organization Admin"
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            form.resetFields();
          }}
          onOk={handleCreateOrgAdmin}
          okText="Create"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[{ required: true, message: 'Please select an organization!' }]}
            >
             <Select
  showSearch
  placeholder="Select an organization"
  options={organizations.map(org => ({
    label: `${org.organizationName} (${org.email})`,
    value: org.id
  }))}
  filterOption={(input, option) =>
    (option?.label as string).toLowerCase().includes(input.toLowerCase())
  }
/>

            </Form.Item>
            <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'At least 6 characters' }]}>
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserManager;
