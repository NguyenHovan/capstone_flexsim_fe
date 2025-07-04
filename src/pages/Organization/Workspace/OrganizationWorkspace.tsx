// src/pages/Organization/Workspace/OrganizationWorkspace.tsx
import React, { useState } from 'react';
import {
  Table,
  Switch,
  Button,
  Space,
  Modal,
  Input,
  Form,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import './OrganizationWorkspace.css';

interface Workspace {
  id: string;
  workSpaceName: string;
  numberOfAccount: number;
  courses: any[];
  instructorEmail: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function OrganizationWorkspace() {
  const [data, setData] = useState<Workspace[]>([
    {
      id: '001',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '002',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
     {
      id: '003',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '004',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
     {
      id: '005',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '006',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
     {
      id: '007',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '008',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
     {
      id: '009',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '010',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
     {
      id: '011',
      workSpaceName: 'Forklift Sim',
      numberOfAccount: 15,
      courses: Array(12).fill({}),
      instructorEmail: 'johndoe@gmail.com',
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
      isActive: true,
    },
    {
      id: '012',
      workSpaceName: 'Port Operations',
      numberOfAccount: 8,
      courses: Array(5).fill({}),
      instructorEmail: 'janedoe@acme.com',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-05T00:00:00Z',
      isActive: false,
    },
  ]);

  const [editing, setEditing] = useState<Workspace | null>(null);
  const [form] = Form.useForm<{
    workSpaceName: string;
    numberOfAccount: number;
    instructorEmail: string;
  }>();

  const toggleActive = (id: string, checked: boolean): void => {
    setData((arr) =>
      arr.map((ws) =>
        ws.id === id ? { ...ws, isActive: checked } : ws
      )
    );
  };

  const deleteRow = (id: string): void => {
    Modal.confirm({
      title: 'Are you sure you want to delete this workspace?',
      onOk() {
        setData((arr) => arr.filter((ws) => ws.id !== id));
      },
    });
  };

  const openEdit = (record: Workspace | null): void => {
    if (record) {
      setEditing(record);
      form.setFieldsValue({
        workSpaceName: record.workSpaceName,
        numberOfAccount: record.numberOfAccount,
        instructorEmail: record.instructorEmail,
      });
    } else {
      // new workspace
      setEditing({
        id: '',
        workSpaceName: '',
        numberOfAccount: 0,
        courses: [],
        instructorEmail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      form.resetFields();
    }
  };

  const saveEdit = (): void => {
    form.validateFields().then((vals) => {
      if (!editing) return;
      const updated: Workspace = {
        ...editing,
        ...vals,
        updatedAt: new Date().toISOString(),
      };
      setData((arr) => {
        if (editing.id) {
          // update existing
          return arr.map((ws) =>
            ws.id === editing.id ? updated : ws
          );
        } else {
          // add new with generated id
          return [
            { ...updated, id: Date.now().toString() },
            ...arr,
          ];
        }
      });
      setEditing(null);
    });
  };

  const columns: ColumnsType<Workspace> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'workSpaceName',
      key: 'workSpaceName',
    },
    {
      title: 'Number of Accounts',
      dataIndex: 'numberOfAccount',
      key: 'numberOfAccount',
      align: 'right',
    },
    {
      title: 'Number of Courses',
      key: 'courses',
      align: 'right',
      render: (_: any, rec: Workspace) => rec.courses.length,
    },
    {
      title: 'Instructor',
      dataIndex: 'instructorEmail',
      key: 'instructorEmail',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD'),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, rec: Workspace) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEdit(rec)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => deleteRow(rec.id)}
          />
          <Switch
            checked={rec.isActive}
            onChange={(checked) => toggleActive(rec.id, checked)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="org-workspace-container">
      <div className="org-workspace-header">
        <h2>Workspace Management</h2>
        <Button type="primary" onClick={() => openEdit(null)}>
          + Add new Workspace
        </Button>
      </div>

      <Table
        className="org-workspace-table"
        bordered
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editing?.id ? 'Edit Workspace' : 'New Workspace'}
        visible={!!editing}
        onCancel={() => setEditing(null)}
        onOk={saveEdit}
        okText="Save"
        className="org-workspace-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="workSpaceName"
            label="Workspace Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="numberOfAccount"
            label="Number of Accounts"
            rules={[{ required: true, type: 'number' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="instructorEmail"
            label="Instructor Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
           <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, type: 'string' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
