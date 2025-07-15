import { Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { OrganizationService } from '../../../services/organization-manager.service';
import type { Organization, OrganizationForm } from '../../../types/organization';
import './organizationManager.css'; 

const { Content } = Layout;
const { Title } = Typography;

const OrganizationManager: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const data = await OrganizationService.getAll();
        console.log('API Response:', data); // Debug: Kiểm tra dữ liệu trả về
        if (Array.isArray(data)) {
          setOrganizations(data);
        } else {
          console.error('API response is not an array:', data);
          setOrganizations([]);
          message.error('Invalid data format from API');
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        message.error('Failed to fetch organizations. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  // Xử lý tạo/sửa organization
  const handleSaveOrganization = async (values: OrganizationForm) => {
    setLoading(true);
    try {
      if (editingOrganization) {
        const updatedOrg = await OrganizationService.updateOrganizationById(editingOrganization.id, {
          ...values,
          updatedAt: values.updatedAt || new Date().toISOString(),
        });
        setOrganizations(organizations.map(org => org.id === editingOrganization.id ? updatedOrg : org));
        message.success('Organization updated successfully');
      } else {
        const newOrg = await OrganizationService.create({
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deleteAt: null,
          accounts: [],
          orders: [],
        });
        setOrganizations([...organizations, newOrg]);
        message.success('Organization created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingOrganization(null);
    } catch (error) {
      console.error('Error saving organization:', error);
      message.error('Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa organization
  const handleDeleteOrganization = async (id: string) => {
    setLoading(true);
    try {
      await OrganizationService.deleteOrganizationById(id);
      setOrganizations(organizations.filter(org => org.id !== id));
      message.success('Organization deleted successfully');
    } catch (error) {
      console.error('Error deleting organization:', error);
      message.error('Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal để chỉnh sửa
  const handleEditOrganization = (record: Organization) => {
    setEditingOrganization(record);
    const formValues = { ...record, updatedAt: record.updatedAt || undefined };
    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  // Xem chi tiết organization
  const handleViewOrganization = async (id: string) => {
    setLoading(true);
    try {
      const data = await OrganizationService.getOrganizationById(id);
      setViewingOrganization(data);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error viewing organization:', error);
      message.error('Failed to view organization details');
    } finally {
      setLoading(false);
    }
  };

  // Cột của bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Organization Name',
      dataIndex: 'organizationName',
      key: 'organizationName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Organization) => (
        <Switch
          checked={isActive}
          disabled={!editingOrganization || record.id !== (editingOrganization?.id || '')}
          onChange={(checked) => {
            if (editingOrganization && record.id === editingOrganization.id) {
              const updatedOrg = { ...record, isActive: checked, updatedAt: new Date().toISOString() };
              setOrganizations(organizations.map(org => org.id === record.id ? updatedOrg : org));
              OrganizationService.updateOrganizationById(record.id, { ...record, isActive: checked, updatedAt: new Date().toISOString() })
                .then(() => message.success('Active status updated successfully'))
                .catch((error) => {
                  console.error('Error updating active status:', error);
                  message.error('Failed to update active status');
                  setOrganizations(organizations.map(org => org.id === record.id ? { ...org, isActive: !checked } : org)); // Rollback
                });
            }
          }}
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Organization) => (
        <div>
          <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} onClick={() => handleViewOrganization(record.id)} />
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditOrganization(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteOrganization(record.id)} />
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
              Organization Manager
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="create-button"
              onClick={() => {
                setEditingOrganization(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Create New Organization
            </Button>
          </Col>
        </Row>
        <Card>
          <Table
            columns={columns}
            dataSource={organizations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
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
        <Modal
          title={
            viewingOrganization
              ? 'View Organization Details'
              : editingOrganization
              ? 'Edit Organization'
              : 'Create New Organization'
          }
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingOrganization(null);
            setViewingOrganization(null);
          }}
          footer={null}
          width={600}
        >
          {viewingOrganization ? (
            <div className="view-details">
              <p><strong>ID:</strong> {viewingOrganization.id}</p>
              <p><strong>Organization Name:</strong> {viewingOrganization.organizationName}</p>
              <p><strong>Email:</strong> {viewingOrganization.email}</p>
              <p><strong>Phone:</strong> {viewingOrganization.phone}</p>
              <p><strong>Address:</strong> {viewingOrganization.address}</p>
              <p><strong>Active:</strong> {viewingOrganization.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {new Date(viewingOrganization.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated At:</strong> {viewingOrganization.updatedAt ? new Date(viewingOrganization.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <Button type="primary" onClick={() => setIsModalVisible(false)} style={{ marginTop: 16 }}>
                Close
              </Button>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveOrganization}
              initialValues={editingOrganization || { isActive: true }}
            >
              <Form.Item
                name="organizationName"
                label="Organization Name"
                rules={[{ required: true, message: 'Please input organization name!' }]}
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please input phone number!' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please input address!' }]}
              >
                <Input placeholder="Enter address" />
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingOrganization(null);
                }} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="create-button">
                  {editingOrganization ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default OrganizationManager;