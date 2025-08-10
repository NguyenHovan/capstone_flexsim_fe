// src/pages/organization/user/UserOrganization.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography,
  message, Select, Tag, Space
} from 'antd';
import {
  EyeOutlined, EditOutlined,
  UserAddOutlined, UserOutlined,
  StopOutlined, CheckCircleOutlined,
  SearchOutlined, SortAscendingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { AccountService } from '../../../services/account.service';
import type { Account } from '../../../types/account';
import { showErrorMessage } from '../../../utils/errorHandler';
import './userOrganization.css';

const { Content } = Layout;
const { Title } = Typography;

// maps
const roleNameMap: Record<number, string> = { 3: 'Instructor', 4: 'Student' };
const genderNameMap: Record<number, string> = { 0: 'Male', 1: 'Female', 2: 'Other' };

// select options
const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Instructor', value: 3 },
  { label: 'Student', value: 4 }
] as const;

const statusOptions = [
  { label: 'All status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Not active', value: 'inactive' }
] as const;

const sortByOptions = [
  { label: 'Username', value: 'userName' },
  { label: 'Full name', value: 'fullName' },
  { label: 'Created At', value: 'createdAt' }
] as const;

const sortDirOptions = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' }
] as const;

// helpers
const getOrganizationId = (): string => {
  try {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s).organizationId || '' : '';
  } catch { return ''; }
};

const UserOrganization: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  // dialogs
  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isCreateInstructor, setIsCreateInstructor] = useState(false);
  const [isCreateStudent, setIsCreateStudent] = useState(false);
  const [formInstr] = Form.useForm();
  const [formStud] = Form.useForm();
  const [formEdit] = Form.useForm();

  // search / filter / sort state
  const [searchText, setSearchText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
  const [sortBy, setSortBy] = useState<'userName' | 'fullName' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const orgId = getOrganizationId();

  // load list
  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const all = await AccountService.getAllAccounts();
      setUsers(all.filter(u => u.organizationId === orgId && (u.roleId === 3 || u.roleId === 4)));
    } catch (err) {
      showErrorMessage(err, 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) {
      message.error('Organization not found');
      return;
    }
    load();
  }, [orgId]);

  // view / edit
  const onView = (u: Account) => { setViewingUser(u); setIsViewModal(true); };
  const onEdit = (u: Account) => {
    setEditingUser(u);
    formEdit.setFieldsValue({
      userName: u.userName, fullName: u.fullName, email: u.email, phone: u.phone,
      gender: genderNameMap[u.gender], roleId: roleNameMap[u.roleId], isActive: u.isActive
    });
    setIsEditModal(true);
  };

  const submitEdit = async () => {
    const v = await formEdit.validateFields();
    if (!editingUser) return;
    setLoading(true);
    try {
      const gender =
        typeof v.gender === 'string'
          ? Number(Object.keys(genderNameMap).find(k => genderNameMap[Number(k)] === v.gender))
          : v.gender;

      const roleId =
        typeof v.roleId === 'string'
          ? Number(Object.keys(roleNameMap).find(k => roleNameMap[Number(k)] === v.roleId))
          : v.roleId;

      const updated = await AccountService.updateAccount(editingUser.id, {
        ...editingUser, ...v, gender: Number(gender ?? 0), roleId: Number(roleId ?? 3), organizationId: orgId
      });
      setUsers(curr => curr.map(x => (x.id === updated.id ? { ...x, ...updated } : x)));
      message.success('User updated');
      setIsEditModal(false);
      formEdit.resetFields();
    } catch (err) {
      showErrorMessage(err, 'Cannot update user');
    } finally { setLoading(false); setEditingUser(null); }
  };

  // ban / unban
  const onBan = async (id: string) => {
    setLoading(true);
    try {
      const a = await AccountService.banAccount(id);
      setUsers(curr => curr.map(x => (x.id === a.id ? { ...x, isActive: false, updatedAt: new Date().toISOString() } : x)));
      message.success('User banned');
    } catch (err) {
      showErrorMessage(err, 'Cannot ban user');
    } finally { setLoading(false); }
  };
  const onUnban = async (id: string) => {
    setLoading(true);
    try {
      const a = await AccountService.unbanAccount(id);
      setUsers(curr => curr.map(x => (x.id === a.id ? { ...x, isActive: true, updatedAt: new Date().toISOString() } : x)));
      message.success('User unbanned');
    } catch (err) {
      showErrorMessage(err, 'Cannot unban user');
    } finally { setLoading(false); }
  };

  // create
  const submitCreateInstructor = async () => {
    const vals = await formInstr.validateFields();
    setLoading(true);
    try {
      const c = await AccountService.registerInstructor({ ...vals, isActive: true, organizationId: orgId });
      setUsers(u => [c, ...u]); message.success('Instructor created');
      setIsCreateInstructor(false); formInstr.resetFields();
    } catch (err) {
      showErrorMessage(err, 'Cannot create instructor');
    } finally { setLoading(false); }
  };
  const submitCreateStudent = async () => {
    const vals = await formStud.validateFields();
    setLoading(true);
    try {
      const c = await AccountService.registerStudent({ ...vals, isActive: true, organizationId: orgId });
      setUsers(u => [c, ...u]); message.success('Student created');
    } catch (err) {
      showErrorMessage(err, 'Cannot create student');
    } finally {
      setIsCreateStudent(false);
      formStud.resetFields();
      setLoading(false);
    }
  };

  // filter + sort (search theo ký tự userName & fullName)
  const dataView = useMemo(() => {
    const q = debounced.toLowerCase();

    let list = users.filter(u => {
      const hitQ =
        !q ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q));

      const hitRole = roleFilter === '' ? true : u.roleId === roleFilter;
      const hitStatus = statusFilter === '' ? true : statusFilter === 'active' ? u.isActive : !u.isActive;

      return hitQ && hitRole && hitStatus;
    });

    list = list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'createdAt') {
        const va = a.createdAt ? +new Date(a.createdAt) : 0;
        const vb = b.createdAt ? +new Date(b.createdAt) : 0;
        return (va - vb) * dir;
      }
      const sa = ((a as any)[sortBy] || '').toLowerCase();
      const sb = ((b as any)[sortBy] || '').toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });

    return list;
  }, [users, debounced, roleFilter, statusFilter, sortBy, sortDir]);

  // columns
  const columns: ColumnsType<Account> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { title: 'Username', dataIndex: 'userName', key: 'userName', width: 140 },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', width: 180 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 220, ellipsis: true },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: 'Role', dataIndex: 'roleId', key: 'roleId', width: 120, render: (r) => roleNameMap[r] || r },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 110, render: (g) => genderNameMap[g] || g },
    {
      title: 'Status', dataIndex: 'isActive', key: 'isActive', width: 120,
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Not active</Tag>)
    },
    {
      title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : '–')
    },
    {
      title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt', width: 140,
      render: (d) => (d ? new Date(d).toLocaleDateString() : '–')
    },
    {
      title: 'Actions', key: 'actions', width: 240,
      render: (_, rec) => (
        <Space wrap size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => onView(rec)}>View</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(rec)}>Edit</Button>
          {rec.isActive ? (
            <Button icon={<StopOutlined />} size="small" danger onClick={() => onBan(rec.id)}>Ban</Button>
          ) : (
            <Button icon={<CheckCircleOutlined />} size="small" type="primary" onClick={() => onUnban(rec.id)}>Unban</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        {/* Header + create buttons */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col><Title level={3} style={{ margin: 0 }}>User Manager</Title></Col>
          <Col>
            <Space wrap>
              <Button icon={<UserAddOutlined />} type="primary" onClick={() => setIsCreateInstructor(true)}>
                Create Instructor
              </Button>
              <Button icon={<UserOutlined />} type="primary" onClick={() => setIsCreateStudent(true)}>
                Create Student
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Toolbar: search + filters + sort */}
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
                style={{ width: '100%' }}
                options={roleOptions as any}
                value={roleFilter}
                onChange={setRoleFilter as any}
              />
            </Col>
            <Col xs={12} md={4} lg={4}>
              <Select
                style={{ width: '100%' }}
                options={statusOptions as any}
                value={statusFilter}
                onChange={setStatusFilter as any}
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                style={{ width: '100%' }}
                options={sortByOptions as any}
                value={sortBy}
                onChange={setSortBy as any}
                suffixIcon={<SortAscendingOutlined />}
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                style={{ width: '100%' }}
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
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* View modal */}
        <Modal
          title="User Details"
          open={isViewModal}
          footer={<Button onClick={() => setIsViewModal(false)}>Close</Button>}
          onCancel={() => setIsViewModal(false)}
          width={600}
        >
          {viewingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <p><b>Id:</b> {viewingUser.id}</p>
                <p><b>Username:</b> {viewingUser.userName}</p>
                <p><b>Full Name:</b> {viewingUser.fullName}</p>
                <p><b>Organization:</b> {viewingUser.organizationId}</p>
                <p><b>Email:</b> {viewingUser.email}</p>
              </Col>
              <Col span={12}>
                <p><b>Phone:</b> {viewingUser.phone}</p>
                <p><b>Role:</b> {roleNameMap[viewingUser.roleId]}</p>
                <p><b>Gender:</b> {genderNameMap[viewingUser.gender]}</p>
                <p><b>Status:</b> {viewingUser.isActive ? 'Active' : 'Not active'}</p>
              </Col>
            </Row>
          )}
        </Modal>

        {/* Edit modal */}
        <Modal
          title="Edit User"
          open={isEditModal}
          onOk={submitEdit}
          onCancel={() => { setIsEditModal(false); formEdit.resetFields(); setEditingUser(null); }}
          confirmLoading={loading}
          width={600}
        >
          <Form form={formEdit} layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item name="userName" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="Instructor">Instructor</Select.Option>
                    <Select.Option value="Student">Student</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Create Instructor */}
        <Modal
          title="Create New Instructor"
          open={isCreateInstructor}
          onOk={submitCreateInstructor}
          onCancel={() => { setIsCreateInstructor(false); formInstr.resetFields(); }}
          confirmLoading={loading}
          width={600}
        >
          <Form form={formInstr} layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item name="userName" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>
          </Form>
        </Modal>

        {/* Create Student */}
        <Modal
          title="Create New Student"
          open={isCreateStudent}
          onOk={submitCreateStudent}
          onCancel={() => { setIsCreateStudent(false); formStud.resetFields(); }}
          confirmLoading={loading}
          width={600}
        >
          <Form form={formStud} layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item name="userName" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserOrganization;
