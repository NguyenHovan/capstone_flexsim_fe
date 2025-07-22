import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message, Select
} from 'antd';
import {
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined
} from '@ant-design/icons';
import { AccountService } from '../../../services/account.service';
import type { Account, AccountForm } from '../../../types/account';
import './userOrganization.css';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Lấy organizationId từ localStorage
const getOrganizationId = (): string => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.organizationId;
  } catch {
    return '';
  }
};

const roleNameMap = {
  3: 'Giảng viên',
  4: 'Học viên'
};

const genderNameMap = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Khác'
};

const UserOrganization: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const organizationId = getOrganizationId();

  // Load users theo organizationId, chỉ lấy giảng viên & học viên
  useEffect(() => {
    if (!organizationId) {
      message.error('Không tìm thấy thông tin tổ chức!');
      return;
    }
    setLoading(true);
    AccountService.getAllAccounts()
      .then(data => {
        const filteredUsers = data.filter(
          user =>
            user.organizationId === organizationId &&
            (user.roleId === 3 || user.roleId === 4)
        );
        setUsers(filteredUsers);
      })
      .catch(() => message.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [organizationId]);

  // Toggle active
  const handleToggleActive = async (checked: boolean, record: Account) => {
    setLoading(true);
    try {
      const updatedUser = await AccountService.updateAccount(record.id, { isActive: checked });
      setUsers(prev =>
        prev.map(u =>
          u.id === record.id
            ? updatedUser.updatedAt
              ? updatedUser
              : { ...u, isActive: checked, updatedAt: new Date().toISOString() }
            : u
        )
      );
      message.success('Cập nhật trạng thái thành công!');
    } catch {
      message.error('Cập nhật thất bại');
      setUsers(prev => prev.map(u => (u.id === record.id ? { ...u, isActive: !checked } : u)));
    } finally {
      setLoading(false);
    }
  };

  // Xóa user
  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    try {
      await AccountService.deleteAccount(id);
      setUsers(users.filter(user => user.id !== id));
      message.success('Xóa user thành công');
    } catch {
      message.error('Xóa user thất bại');
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
      roleId: record.roleId,
    });
    setIsEditModalVisible(true);
  };

  // Update user
  const handleUpdateUser = () => {
    form.validateFields()
      .then(values => {
        if (editingUser) {
          setLoading(true);
          AccountService.updateAccount(editingUser.id, {
            ...values,
            organizationId,
          })
            .then(updatedUser => {
              setUsers(prev =>
                prev.map(u =>
                  u.id === editingUser.id
                    ? updatedUser.updatedAt
                      ? updatedUser
                      : { ...u, ...values, updatedAt: new Date().toISOString() }
                    : u
                )
              );
              message.success('Cập nhật user thành công');
              setIsEditModalVisible(false);
              form.resetFields();
              setEditingUser(null);
            })
            .catch(() => {
              message.error('Cập nhật thất bại');
            })
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        message.error('Vui lòng nhập đầy đủ thông tin');
      });
  };

  // Tạo user mới
  const handleCreateUser = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        const payload: AccountForm = {
          organizationId,
          userName: values.userName,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          roleId: values.roleId,
          isActive: values.isActive,
          gender: values.gender,
        };
        AccountService.createAccount(payload)
          .then(newUser => {
            setUsers(prev => [...prev, newUser]);
            message.success('Tạo user thành công');
            setIsCreateModalVisible(false);
            form.resetFields();
          })
          .catch(() => {
            message.error('Tạo user thất bại');
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        message.error('Vui lòng nhập đầy đủ thông tin');
      });
  };

  // Render các cột của Table
  const renderDate = (date?: string | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 120 },
    { title: 'Username', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', width: 130 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120,
      render: (roleId: number) => roleNameMap[roleId as 3 | 4] || roleId
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: number) => genderNameMap[gender as 0 | 1 | 2] || 'Khác'
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (isActive: boolean, record: Account) => (
        <Switch
          checked={isActive}
          onChange={checked => handleToggleActive(checked, record)}
        />
      ),
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: renderDate, width: 110 },
    { title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt', render: renderDate, width: 110 },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as 'right',
      width: 130,
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
              Create New User
            </Button>
          </Col>
        </Row>
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
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
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setViewingUser(null);
          }}
          footer={null}
          width={500}
        >
          {viewingUser && (
            <div className="view-details">
              <p><strong>ID:</strong> {viewingUser.id}</p>
              <p><strong>Username:</strong> {viewingUser.userName}</p>
              <p><strong>Full Name:</strong> {viewingUser.fullName}</p>
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Phone:</strong> {viewingUser.phone}</p>
              <p><strong>Role:</strong> {roleNameMap[viewingUser.roleId as 3 | 4]}</p>
              <p><strong>Gender:</strong> {genderNameMap[viewingUser.gender as 0 | 1 | 2]}</p>
              <p><strong>Active:</strong> {viewingUser.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {renderDate(viewingUser.createdAt)}</p>
              <p><strong>Updated At:</strong> {renderDate(viewingUser.updatedAt)}</p>
              <Button type="primary" onClick={() => setIsViewModalVisible(false)} style={{ marginTop: 16 }}>
                Close
              </Button>
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
            <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Vui lòng nhập username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Chọn giới tính!' }]}>
              <Select>
                <Option value={0}>Nam</Option>
                <Option value={1}>Nữ</Option>
                <Option value={2}>Khác</Option>
              </Select>
            </Form.Item>
            <Form.Item name="roleId" label="Role" rules={[{ required: true, message: 'Chọn vai trò!' }]}>
              <Select>
                <Option value={3}>Giảng viên</Option>
                <Option value={4}>Học viên</Option>
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
        {/* Modal tạo user */}
        <Modal
          title="Create New User"
          open={isCreateModalVisible}
          onCancel={() => {
            setIsCreateModalVisible(false);
            form.resetFields();
          }}
          onOk={handleCreateUser}
          okText="Create"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Vui lòng nhập username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Chọn giới tính!' }]}>
              <Select>
                <Option value={0}>Nam</Option>
                <Option value={1}>Nữ</Option>
                <Option value={2}>Khác</Option>
              </Select>
            </Form.Item>
            <Form.Item name="roleId" label="Role" rules={[{ required: true, message: 'Chọn vai trò!' }]}>
              <Select>
                <Option value={3}>Giảng viên</Option>
                <Option value={4}>Học viên</Option>
              </Select>
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
              <Switch defaultChecked />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserOrganization;
