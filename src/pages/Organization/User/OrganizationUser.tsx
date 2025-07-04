// src/pages/OrganizationUser.tsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Switch,
  Row,
  Col,
  Spin,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import './OrganizationUser.css';

interface User {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function OrganizationUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  // 1) Fetch on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get<User[]>(`${API}/api/Account/GetAllAccount`)
      .then(res => {
        setUsers(res.data);
        setFiltered(res.data);
      })
      .catch(err => {
        console.error(err);
        message.error('Failed to load users');
      })
      .finally(() => setLoading(false));
  }, [API]);

  // 2) Search
  const handleSearch = (value: string) => {
    const q = value.trim().toLowerCase();
    setSearchText(q);
    setFiltered(
      users.filter(u =>
        u.userName.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    );
  };

  // 3) Toggle active + API persist
  const handleToggleActive = (checked: boolean, record: User) => {
    // optimistic UI
    setUsers(prev =>
      prev.map(u => (u.id === record.id ? { ...u, isActive: checked } : u))
    );
    setFiltered(prev =>
      prev.map(u => (u.id === record.id ? { ...u, isActive: checked } : u))
    );

    axios
      .patch(`${API}/api/Account/${record.id}`, { isActive: checked })
      .catch(err => {
        console.error(err);
        message.error('Failed to update status');
        // rollback on error
        setUsers(prev =>
          prev.map(u =>
            u.id === record.id ? { ...u, isActive: !checked } : u
          )
        );
        setFiltered(prev =>
          prev.map(u =>
            u.id === record.id ? { ...u, isActive: !checked } : u
          )
        );
      });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'User Name', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', width: 160 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 100 },
    { title: 'Role', dataIndex: 'role', key: 'role', width: 120 },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 140 },
    { title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt', width: 140 },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (_: any, record: User) => (
        <Switch
          checked={record.isActive}
          onChange={checked => handleToggleActive(checked, record)}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: User) => (
        <div className="action-cell">
          <EditOutlined className="action-icon" />
          <DeleteOutlined className="action-icon delete" />
        </div>
      ),
    },
  ];

  return (
    <div className="org-user-container">
      <Row
        justify="space-between"
        align="middle"
        className="org-user-header"
        style={{ marginBottom: 16 }}
      >
        <Col>
          <Input.Search
            placeholder="Search users"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
            loading={loading}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />}>
            Add new User
          </Button>
        </Col>
      </Row>

      <div className="org-user-table">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table<User>
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showQuickJumper: true }}
            scroll={{ x: 'max-content' }}
            bordered
          />
        )}
      </div>
    </div>
  );
}
