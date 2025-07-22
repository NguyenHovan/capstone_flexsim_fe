// src/pages/OrganizationAdmin/Workspace Manager/WorkspaceOrganization.tsx
import { Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography, Switch, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { WorkspaceService } from '../../../services/workspace.service';
import type { Workspace, WorkspaceForm } from '../../../types/workspace';
import './workspaceOrganization.css';

const { Content } = Layout;
const { Title } = Typography;

const WorkspaceOrganization: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [viewingWorkspace, setViewingWorkspace] = useState<Workspace | null>(null);
  const organizationId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'; // Giả định OrgAdmin ID, cần thay bằng logic thực tế

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const data = await WorkspaceService.getWorkspacesByOrgId(organizationId);
        if (Array.isArray(data)) {
          const processedData = data.map(workspace => ({
            ...workspace,
            createdAt: workspace.createdAt || new Date().toISOString(),
            updatedAt: workspace.updatedAt || null,
          }));
          setWorkspaces(processedData);
        } else {
          console.error('API response is not an array:', data);
          setWorkspaces([]);
          message.error('Invalid data format from API');
        }
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        message.error('Failed to fetch workspaces. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [organizationId]);

  const handleSaveWorkspace = async (values: WorkspaceForm) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        organizationId,
        orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        numberOfAccount: 0,
        imgUrl: '',
        accountOfWorkSpaces: [],
        courses: [],
        orders: [],
        packages: [],
        sceneOfWorkSpaces: [],
      };
      if (editingWorkspace) {
        const updatedWorkspace = await WorkspaceService.updateWorkspaceById(editingWorkspace.id, {
          ...payload,
          updatedAt: new Date().toISOString(),
        });
        const processedWorkspace = {
          ...updatedWorkspace,
          createdAt: updatedWorkspace.createdAt || editingWorkspace.createdAt || new Date().toISOString(),
          updatedAt: updatedWorkspace.updatedAt || new Date().toISOString(),
        };
        setWorkspaces(workspaces.map(w => w.id === editingWorkspace.id ? processedWorkspace : w));
        message.success('Workspace updated successfully');
      } else {
        const newWorkspace = await WorkspaceService.createWorkspace(payload);
        setWorkspaces([...workspaces, newWorkspace]);
        message.success('Workspace created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingWorkspace(null);
    } catch (error) {
      console.error('Error saving workspace:', error);
      message.error('Failed to save workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    setLoading(true);
    try {
      await WorkspaceService.deleteWorkspaceById(id);
      setWorkspaces(workspaces.filter(w => w.id !== id));
      message.success('Workspace deleted successfully');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      message.error('Failed to delete workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorkspace = (record: Workspace) => {
    setEditingWorkspace(record);
    form.setFieldsValue({
      workSpaceName: record.workSpaceName,
      description: record.description,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleViewWorkspace = async (id: string) => {
    setLoading(true);
    try {
      const data = await WorkspaceService.getWorkspaceById(id);
      const processedData = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || null,
      };
      setViewingWorkspace(processedData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error viewing workspace:', error);
      message.error('Failed to view workspace details');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 150 },
    { title: 'WorkSpace Name', dataIndex: 'workSpaceName', key: 'workSpaceName' },
    { title: 'Number of Accounts', dataIndex: 'numberOfAccount', key: 'numberOfAccount' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Workspace) => (
        <Switch checked={isActive} disabled />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workspace) => (
        <div>
          <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} onClick={() => handleViewWorkspace(record.id)} />
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditWorkspace(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteWorkspace(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: '20px', padding: '0 24px' }}>
          <Col>
            <Title level={2} className="dashboard-title">Workspace Manager</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="create-button"
              onClick={() => {
                setEditingWorkspace(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Create New Workspace
            </Button>
          </Col>
        </Row>
        <Card>
          <Table
            columns={columns}
            dataSource={workspaces}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            loading={loading}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" width={50} style={{ opacity: 0.3, marginBottom: '10px' }} alt="No Data" />
                  No Data Available
                </div>
              ),
            }}
          />
        </Card>
        <Modal
          title={viewingWorkspace ? 'View Workspace Details' : editingWorkspace ? 'Edit Workspace' : 'Create New Workspace'}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingWorkspace(null);
            setViewingWorkspace(null);
          }}
          footer={null}
          width={600}
        >
          {viewingWorkspace ? (
            <div className="view-details">
              <p><strong>ID:</strong> {viewingWorkspace.id}</p>
              <p><strong>WorkSpace Name:</strong> {viewingWorkspace.workSpaceName}</p>
              <p><strong>Number of Accounts:</strong> {viewingWorkspace.numberOfAccount}</p>
              <p><strong>Description:</strong> {viewingWorkspace.description}</p>
              <p><strong>Active:</strong> {viewingWorkspace.isActive ? 'Yes' : 'No'}</p>
              <p><strong>Created At:</strong> {viewingWorkspace.createdAt ? new Date(viewingWorkspace.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Updated At:</strong> {viewingWorkspace.updatedAt ? new Date(viewingWorkspace.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <Button type="primary" onClick={() => setIsModalVisible(false)} style={{ marginTop: 16 }}>Close</Button>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSaveWorkspace} initialValues={editingWorkspace || { isActive: true }}>
              <Form.Item name="workSpaceName" label="WorkSpace Name" rules={[{ required: true, message: 'Please input workspace name!' }]}>
                <Input placeholder="Enter workspace name" />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description!' }]}>
                <Input.TextArea placeholder="Enter description" />
              </Form.Item>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingWorkspace(null);
                }} style={{ marginRight: 8 }}>Cancel</Button>
                <Button type="primary" htmlType="submit" className="create-button">
                  {editingWorkspace ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default WorkspaceOrganization; 