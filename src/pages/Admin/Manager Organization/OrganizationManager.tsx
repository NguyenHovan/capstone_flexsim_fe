import {
  Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message, Space
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import { OrganizationService } from '../../../services/organization-manager.service';
import type { Organization, OrganizationForm } from '../../../types/organization';
import './organizationManager.css';

const { Content } = Layout;
const { Title } = Typography;

const OrganizationManager: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);

  // === loadOrganizations: tự động fetch lại data từ server ===
  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await OrganizationService.getAll();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleSaveOrganization = async (values: OrganizationForm) => {
    setLoading(true);
    try {
      if (editingOrganization) {
        await OrganizationService.updateOrganizationById(editingOrganization.id, values);
        message.success('Organization updated successfully');
      } else {
        await OrganizationService.create(values);
        message.success('Organization created successfully');
      }
      // Sau khi create/update, luôn refetch từ server để data mới nhất
      await loadOrganizations();
      handleModalClose();
    } catch (error) {
      message.error('Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    setLoading(true);
    try {
      await OrganizationService.deleteOrganizationById(id);
      message.success('Organization deleted successfully');
      // Refetch sau khi xóa
      await loadOrganizations();
    } catch (error) {
      message.error('Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrganization = (record: Organization) => {
    setEditingOrganization(record);
    setViewingOrganization(null);
    form.setFieldsValue({
      organizationName: record.organizationName,
      email: record.email,
      phone: record.phone,
      address: record.address,
      isActive: record.isActive
    });
    setIsModalOpen(true);
  };

  const handleViewOrganization = async (id: string) => {
    setLoading(true);
    try {
      const data = await OrganizationService.getOrganizationById(id);
      setViewingOrganization(data);
      setEditingOrganization(null);
      setIsModalOpen(true);
    } catch (error) {
      message.error('Failed to fetch organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleActiveToggle = async (record: Organization, checked: boolean) => {
    setLoading(true);
    try {
      const payload: OrganizationForm = {
        organizationName: record.organizationName,
        email: record.email,
        phone: record.phone,
        address: record.address,
        isActive: checked,
      };
      await OrganizationService.updateOrganizationById(record.id, payload);
      message.success('Updated active status');
      // Refetch sau khi toggle
      await loadOrganizations();
    } catch (error) {
      message.error('Failed to update active status');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingOrganization(null);
    setViewingOrganization(null);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
    { title: 'Name', dataIndex: 'organizationName', key: 'organizationName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Organization) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleActiveToggle(record, checked)}
        />
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
      },
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Organization) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewOrganization(record.id)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditOrganization(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteOrganization(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: '20px', padding: '0 24px' }}>
          <Col>
            <Title level={2}>Organization Manager</Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadOrganizations}
                loading={loading}
              >
                Reload
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingOrganization(null);
                  setViewingOrganization(null);
                  setIsModalOpen(true);
                }}
              >
                Create New Organization
              </Button>
            </Space>
          </Col>
        </Row>
        <Card>
          <Table
            columns={columns}
            dataSource={organizations}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Card>
        <Modal
          title={
            viewingOrganization
              ? 'View Organization'
              : editingOrganization
              ? 'Edit Organization'
              : 'Create Organization'
          }
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={600}
          destroyOnHidden
        >
          {viewingOrganization ? (
            <div>
              <p><b>ID:</b> {viewingOrganization.id}</p>
              <p><b>Name:</b> {viewingOrganization.organizationName}</p>
              <p><b>Email:</b> {viewingOrganization.email}</p>
              <p><b>Phone:</b> {viewingOrganization.phone}</p>
              <p><b>Address:</b> {viewingOrganization.address}</p>
              <p><b>Active:</b> {viewingOrganization.isActive ? 'Yes' : 'No'}</p>
              <p><b>Created At:</b> {viewingOrganization.createdAt ? new Date(viewingOrganization.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><b>Updated At:</b> {viewingOrganization.updatedAt ? new Date(viewingOrganization.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <Button type="primary" onClick={handleModalClose} style={{ marginTop: 16 }}>Close</Button>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSaveOrganization}>
              <Form.Item name="organizationName" label="Organization Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              <div style={{ textAlign: 'right' }}>
                <Button onClick={handleModalClose} style={{ marginRight: 8 }}>Cancel</Button>
                <Button type="primary" htmlType="submit">{editingOrganization ? 'Update' : 'Create'}</Button>
              </div>
            </Form>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default OrganizationManager;
