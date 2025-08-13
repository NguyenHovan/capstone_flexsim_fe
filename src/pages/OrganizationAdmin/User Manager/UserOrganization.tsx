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
const genderNameMap: Record<number, string> = { 1: 'Male', 2: 'Female', 3: 'Other' };

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

const genderOptions = [
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Other', value: 3 },
] as const;

const getOrganizationId = (): string => {
  try {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s).organizationId || '' : '';
  } catch { return ''; }
};

/** Map lỗi email trùng từ BE vào field email của form; trả true nếu đã set lỗi */
const setEmailDuplicateError = (form: any, err: any) => {
  try {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errors = data?.errors;

    let msg: string | undefined =
      errors?.Email?.[0] ||
      errors?.email?.[0] ||
      (typeof data === 'string' ? data : undefined) ||
      data?.message ||
      data?.title ||
      err?.message;

    const lower = String(msg || '').toLowerCase();
    const looksDup =
      status === 409 ||
      lower.includes('duplicate') ||
      lower.includes('already') ||
      lower.includes('exist') ||
      lower.includes('đã tồn tại') ||
      lower.includes('tồn tại');

    if ((msg && /email/i.test(msg)) || looksDup) {
      form.setFields([{ name: 'email', errors: [msg || 'Email already exists'] }]);
      return true; // đã set lỗi tại field
    }
  } catch { /* noop */ }
  return false;
};

const UserOrganization: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);           // load list
  const [savingEdit, setSavingEdit] = useState(false);     // submit edit
  const [creatingInstructor, setCreatingInstructor] = useState(false); // submit create instructor
  const [creatingStudent, setCreatingStudent] = useState(false);       // submit create student

  const [viewingUser, setViewingUser] = useState<Account | null>(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isCreateInstructor, setIsCreateInstructor] = useState(false);
  const [isCreateStudent, setIsCreateStudent] = useState(false);
  const [formInstr] = Form.useForm();
  const [formStud] = Form.useForm();
  const [formEdit] = Form.useForm();

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

  // list loader
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

  // BroadcastChannel cho auto reload giữa các tab
  const bc = useMemo(() => new BroadcastChannel('org-accounts'), []);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const msg = e.data as { type: string; organizationId?: string };
      if (msg?.type?.startsWith('account:') && msg.organizationId === orgId) {
        load();
      }
    };
    bc.addEventListener('message', onMsg);
    return () => bc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // ===== helper: reload + close modal + reset form =====
  const loadUsser = async (opts?: { close?: 'edit' | 'instr' | 'stud' | 'all' }) => {
    await load();
    switch (opts?.close) {
      case 'edit':
        setIsEditModal(false);
        setEditingUser(null);
        formEdit.resetFields();
        break;
      case 'instr':
        setIsCreateInstructor(false);
        formInstr.resetFields();
        break;
      case 'stud':
        setIsCreateStudent(false);
        formStud.resetFields();
        break;
      case 'all':
        setIsEditModal(false); setEditingUser(null); formEdit.resetFields();
        setIsCreateInstructor(false); formInstr.resetFields();
        setIsCreateStudent(false); formStud.resetFields();
        break;
      default: break;
    }
  };

  // view / edit
  const onView = (u: Account) => { setViewingUser(u); setIsViewModal(true); };

  const onEdit = (u: Account) => {
    setEditingUser(u);
    formEdit.setFieldsValue({
      userName: u.userName,
      fullName: u.fullName,
      organizationId: u.organizationId,
      roleId: u.roleId, // 3|4
      email: u.email,
      phone: u.phone,
      password: undefined,
      gender: u.gender,
      address: (u as any).address,
      avtUrl: (u as any).avtUrl,
      isActive: u.isActive
    });
    setIsEditModal(true);
  };

  const submitEdit = async () => {
    if (savingEdit) return;
    const v = await formEdit.validateFields();
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const payload: any = {
        ...editingUser,
        userName: v.userName,
        fullName: v.fullName,
        organizationId: v.organizationId || orgId,
        roleId: Number(v.roleId),
        email: v.email,
        phone: v.phone,
        gender: Number(v.gender),
        address: v.address,
        avtUrl: v.avtUrl
      };
      if (v.password && String(v.password).trim()) payload.password = v.password;

      const updated = await AccountService.updateAccount(editingUser.id, payload);
      setUsers(curr => curr.map(x => (x.id === updated.id ? { ...x, ...updated } : x)));
      bc.postMessage({ type: 'account:updated', organizationId: orgId });
      await loadUsser({ close: 'edit' });      // ✅ đóng + reload
      message.success('User updated');
    } catch (err: any) {
      if (setEmailDuplicateError(formEdit, err)) return; // ✅ lỗi email trùng hiện ngay dưới field
      showErrorMessage(err, 'Cannot update user');
    } finally {
      setSavingEdit(false);
    }
  };

  // ban / unban
  const onBan = async (id: string) => {
    setLoading(true);
    try {
      const a = await AccountService.banAccount(id);
      setUsers(curr => curr.map(x => (x.id === a.id ? { ...x, isActive: false, updatedAt: new Date().toISOString() } : x)));
      bc.postMessage({ type: 'account:banned', organizationId: orgId });
      await loadUsser(); // reload danh sách
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
      bc.postMessage({ type: 'account:unbanned', organizationId: orgId });
      await loadUsser(); // reload danh sách
      message.success('User unbanned');
    } catch (err) {
      showErrorMessage(err, 'Cannot unban user');
    } finally { setLoading(false); }
  };

  // create
  const submitCreateInstructor = async () => {
    if (creatingInstructor) return;
    const vals = await formInstr.validateFields();
    setCreatingInstructor(true);
    try {
      const c = await AccountService.registerInstructor({
        ...vals,
        gender: Number(vals.gender),
        isActive: true,
        organizationId: orgId
      });
      setUsers(u => [c, ...u]);
      bc.postMessage({ type: 'account:created', organizationId: orgId });
      await loadUsser({ close: 'instr' });     // ✅ đóng + reload
      message.success('Instructor created');
    } catch (err: any) {
      if (setEmailDuplicateError(formInstr, err)) return; // ✅ bắt lỗi email trùng
      showErrorMessage(err, 'Cannot create instructor');
    } finally { setCreatingInstructor(false); }
  };

  const submitCreateStudent = async () => {
    if (creatingStudent) return;
    const vals = await formStud.validateFields();
    setCreatingStudent(true);
    try {
      const c = await AccountService.registerStudent({
        ...vals,
        gender: Number(vals.gender),
        isActive: true,
        organizationId: orgId
      });
      setUsers(u => [c, ...u]);
      bc.postMessage({ type: 'account:created', organizationId: orgId });
      await loadUsser({ close: 'stud' });      // ✅ đóng + reload
      message.success('Student created');
    } catch (err: any) {
      if (setEmailDuplicateError(formStud, err)) return; // ✅ bắt lỗi email trùng
      showErrorMessage(err, 'Cannot create student');
    } finally { setCreatingStudent(false); }
  };

  // filter + sort (search theo userName & fullName)
  const dataView = useMemo(() => {
    const q = debounced.toLowerCase();

    let list = users.filter(u => {
      const hitQ =
        !q ||
        (u.userName && u.userName.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q));

      const hitRole = roleFilter === '' ? true : u.roleId === roleFilter;
      const hitStatus = statusFilter === '' ? true : (statusFilter === 'active' ? u.isActive : !u.isActive);

      return hitQ && hitRole && hitStatus;
    });

    list = list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'createdAt') {
        const va = a.createdAt ? +new Date(a.createdAt) : 0;
        const vb = b.createdAt ? +new Date(b.createdAt) : 0;
        return (va - vb) * dir;
      }
      const sa = ((a as any)[sortBy] || '').toLowerCase?.() ?? '';
      const sb = ((b as any)[sortBy] || '').toLowerCase?.() ?? '';
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
          destroyOnClose
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
          okButtonProps={{ loading: savingEdit, disabled: savingEdit }}
          destroyOnClose
          width={680}
        >
          <Form form={formEdit} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="userName" label="Username" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="organizationId" label="Organization ID">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'Instructor', value: 3 },
                      { label: 'Student', value: 4 },
                    ] as any}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="password" label="Password">
                  <Input.Password placeholder="Leave blank to keep current password" onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select options={genderOptions as any} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="avtUrl" label="Avatar URL">
                  <Input placeholder="https://..." onPressEnter={(e) => { e.preventDefault(); submitEdit(); }} />
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
          okButtonProps={{ loading: creatingInstructor, disabled: creatingInstructor }}
          destroyOnClose
          width={600}
        >
          <Form form={formInstr} layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item name="userName" label="Username" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select options={genderOptions as any} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password onPressEnter={(e) => { e.preventDefault(); submitCreateInstructor(); }} /></Form.Item>
          </Form>
        </Modal>

        {/* Create Student */}
        <Modal
          title="Create New Student"
          open={isCreateStudent}
          onOk={submitCreateStudent}
          onCancel={() => { setIsCreateStudent(false); formStud.resetFields(); }}
          okButtonProps={{ loading: creatingStudent, disabled: creatingStudent }}
          destroyOnClose
          width={600}
        >
          <Form form={formStud} layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item name="userName" label="Username" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select options={genderOptions as any} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                  <Input onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password onPressEnter={(e) => { e.preventDefault(); submitCreateStudent(); }} /></Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserOrganization;
