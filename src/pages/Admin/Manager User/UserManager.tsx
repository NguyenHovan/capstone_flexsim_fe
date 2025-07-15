import { Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message, Select } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { AccountService } from '../../../services/account.service';
import type { Account } from '../../../types/account';
import './UserManager.css';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [form] = Form.useForm();

  // Fetch users from API
  useEffect(() => {
    setLoading(true);
    AccountService.getAllAccounts()
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        message.error('Failed to load users. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Toggle active
  const handleToggleActive = (checked: boolean, record: Account) => {
    setUsers(prev =>
      prev.map(u => (u.id === record.id ? { ...u, isActive: checked, updatedAt: new Date().toISOString() } : u))
    );
    AccountService.updateAccount(record.id, { isActive: checked, updatedAt: new Date().toISOString() })
      .catch(err => {
        console.error('Error updating active status:', err);
        message.error('Failed to update active status');
        setUsers(prev => prev.map(u => (u.id === record.id ? { ...u, isActive: !checked } : u))); // Rollback
      });
  };

  // Xóa user
  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      await AccountService.deleteAccount(id);
      setUsers(users.filter(user => user.id !== id));
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết user
  const handleViewUser = (record: Account) => {
    setViewingUser(record);
    setIsViewModalVisible(true);
  };

  // Mở modal chỉnh sửa user
  const handleEditUser = (record: Account) => {
    setEditingUser(record);
    form.setFieldsValue({
      userName: record.userName,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      gender: record.gender,
      isActive: record.isActive,
    });
    setIsEditModalVisible(true);
  };

  // Lưu thông tin chỉnh sửa user (gọi API update)
  const handleUpdateUser = () => {
    form.validateFields()
      .then(values => {
        if (editingUser) {
          setLoading(true);
          AccountService.updateAccount(editingUser.id, {
            ...values,
            updatedAt: new Date().toISOString(),
          })
            .then(updatedUser => {
              setUsers(prev => prev.map(u => (u.id === editingUser.id ? updatedUser : u)));
              message.success('User updated successfully');
              setIsEditModalVisible(false);
              form.resetFields();
              setEditingUser(null);
            })
            .catch(err => {
              console.error('Error updating user:', err);
              message.error('Failed to update user. Please try again.');
            })
            .finally(() => setLoading(false));
        }
      })
      .catch(err => {
        console.error('Form validation error:', err);
        message.error('Please fill in all required fields correctly');
      });
  };

  // Tạo user mới với vai trò OrgAdmin
  const handleCreateOrgAdmin = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        const newOrgAdmin = {
          ...values,
          organizationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Giả định organizationId, thay bằng logic thực tế
          role: 'OrgAdmin',
          isEmailVerify: false,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deleteAt: null,
        };

        AccountService.createOrgAdmin(newOrgAdmin as Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deleteAt'>)
          .then(newUser => {
            setUsers(prev => [...prev, newUser]);
            message.success('Organization Admin created successfully');
            setIsCreateModalVisible(false);
            form.resetFields();
          })
          .catch(err => {
            console.error('Error creating OrgAdmin:', err);
            message.error('Failed to create Organization Admin');
          })
          .finally(() => setLoading(false));
      })
      .catch(err => {
        console.error('Form validation error:', err);
        message.error('Please fill in all required fields correctly');
      });
  };

  // Cột của bảng
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 150 },
    { title: 'Organization ID', dataIndex: 'organizationId', key: 'organizationId', ellipsis: true, width: 150 },
    { title: 'System Mode', dataIndex: 'systemMode', key: 'systemMode', render: (value: boolean) => (value ? 'Yes' : 'No') },
    { title: 'Organization Role', dataIndex: 'organizationRole', key: 'organizationRole' },
    { title: 'Username', dataIndex: 'userName', key: 'userName' },
    { title: 'Password', dataIndex: 'password', key: 'password', render: () => '****' },
    { title: 'Email Verified', dataIndex: 'isEmailVerify', key: 'isEmailVerify', render: (value: boolean) => (value ? 'Yes' : 'No') },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Avatar URL', dataIndex: 'avtUrl', key: 'avtUrl', render: (url: string) => url ? <a href={url} target="_blank" rel="noopener noreferrer">View</a> : 'N/A' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Account) => (
        <Switch
          checked={isActive}
          onChange={checked => handleToggleActive(checked, record)}
        />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Deleted At',
      dataIndex: 'deleteAt',
      key: 'deleteAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Account) => (
        <div>
          <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} onClick={() => handleViewUser(record)} />
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditUser(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteUser(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: '20px', padding: '0 24px' }}>
          <Col>
            <Title level={2} className="dashboard-title">
              User Manager
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setIsCreateModalVisible(true);
              }}
              style={{ marginRight: 8 }}
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
            scroll={{ x: 1500 }}
            loading={loading}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                    width={50}
                    style={{ opacity: 0.3, marginBottom: '10px' }}
                    alt="No Data"
                  />
                  No Data Available
                </div>
              ),
            }}
          />
        </Card>
        {/* Modal xem chi tiết */}
        <Modal
          title="View User Details"
          visible={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setViewingUser(null);
          }}
          footer={null}
          width={600}
        >
          {viewingUser && (
            <div className="view-details">
              <p><strong>ID:</strong> {viewingUser.id}</p>
              <p><strong>Organization ID:</strong> {viewingUser.organizationId}</p>
              <p><strong>System Mode:</strong> {viewingUser.systemMode ? 'Yes' : 'No'}</p>
              <p><strong>Organization Role:</strong> {viewingUser.organizationRole || 'N/A'}</p>
              <p><strong>Username:</strong> {viewingUser.userName}</p>
              <p><strong>Password:</strong> ****</p>
              <p><strong>Email Verified:</strong> {viewingUser.isEmailVerify ? 'Yes' : 'No'}</p>
              <p><strong>Full Name:</strong> {viewingUser.fullName}</p>
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Phone:</strong> {viewingUser.phone}</p>
              <p><strong>Gender:</strong> {viewingUser.gender}</p>
              <p><strong>Address:</strong> {viewingUser.address || 'N/A'}</p>
              <p><strong>Avatar URL:</strong> {viewingUser.avtUrl ? <a href={viewingUser.avtUrl} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</p>
              <p><strong>Active:</strong> {viewingUser.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {new Date(viewingUser.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated At:</strong> {viewingUser.updatedAt ? new Date(viewingUser.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Deleted At:</strong> {viewingUser.deleteAt ? new Date(viewingUser.deleteAt).toLocaleDateString() : 'N/A'}</p>
              <Button type="primary" onClick={() => setIsViewModalVisible(false)} style={{ marginTop: 16 }}>
                Close
              </Button>
            </div>
          )}
        </Modal>
        {/* Modal chỉnh sửa user */}
        <Modal
          title="Edit User"
          visible={isEditModalVisible}
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
            <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please input username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Please input full name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input valid email!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input phone number!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select gender!' }]}>
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}>
              <Select>
                {['Student', 'Instructor', 'OrgAdmin'].map(role => (
                  <Option key={role} value={role}>{role}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
        {/* Modal tạo Organization Admin */}
        <Modal
          title="Create Organization Admin"
          visible={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            form.resetFields();
          }}
          onOk={handleCreateOrgAdmin}
          okText="Create"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please input username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Please input full name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input valid email!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input phone number!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select gender!' }]}>
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input password!' }]}>
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserManager;