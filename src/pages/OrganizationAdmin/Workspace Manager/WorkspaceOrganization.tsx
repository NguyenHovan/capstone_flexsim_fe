import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Row, Col, Typography, Card, InputNumber,
  message, Tag, Space
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Workspace, WorkspaceForm } from '../../../types/workspace';
import { WorkspaceService } from '../../../services/workspace.service';
import UploadCloudinary from '../../UploadFile/UploadCloudinary';
import { showErrorMessage } from '../../../utils/errorHandler';
import './workspaceOrganization.css';

const { Title } = Typography;

const getOrgId = (): string => {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw)?.organizationId || '') : '';
  } catch {
    return '';
  }
};

const WorkspaceOrganization: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);

  const [selected, setSelected] = useState<Workspace | null>(null);
  const [viewData, setViewData] = useState<Workspace | null>(null);

  const [imgUrlCreate, setImgUrlCreate] = useState<string>('');
  const [imgUrlUpdate, setImgUrlUpdate] = useState<string>('');
  const [imgFileCreate, setImgFileCreate] = useState<File | null>(null);
  const [imgFileUpdate, setImgFileUpdate] = useState<File | null>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const orgId = getOrgId();

  useEffect(() => {
    if (!orgId) {
      message.error('Không tìm thấy organizationId');
      return;
    }
    fetchList();
  }, [orgId]);

  const fetchList = async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const all = await WorkspaceService.getAll();
      setWorkspaces(all.filter(w => w.organizationId === orgId));
    } catch (err) {
      showErrorMessage(err, 'Không thể tải danh sách workspace');
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  };

  const filteredData = workspaces
    .filter(ws => ws.workSpaceName?.toLowerCase().includes(searchText.toLowerCase()))
    .filter(ws => {
      if (statusFilter === null) return true;
      return statusFilter === 'active' ? ws.isActive : !ws.isActive;
    });

  // ===== CREATE =====
  const onCreate = async (vals: any) => {
    if (!orgId) { message.error('Vui lòng đăng nhập'); return; }
    if (!imgUrlCreate && !imgFileCreate) { message.error('Vui lòng upload ảnh trước khi lưu'); return; }
    if (!vals.workSpaceName?.trim() || !vals.description?.trim()) {
      message.error('WorkSpaceName và Description là bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const payload: WorkspaceForm = {
        organizationId: orgId,
        workSpaceName: vals.workSpaceName.trim(),
        numberOfAccount: Number.isFinite(vals.numberOfAccount) ? Number(vals.numberOfAccount) : 0,
        imgUrl: imgUrlCreate,
        description: vals.description.trim(),
        isActive: true,
      };

      await WorkspaceService.createWorkspace(payload, { imgFile: imgFileCreate || undefined });
      await fetchList({ silent: true });

      message.success('Tạo workspace thành công');
      setCreateVisible(false);
      createForm.resetFields();
      setImgUrlCreate('');
      setImgFileCreate(null);
    } catch (err) {
      showErrorMessage(err, 'Không thể tạo workspace');
    } finally {
      setLoading(false);
    }
  };

  // ===== UPDATE =====
  const onUpdate = async (vals: any) => {
    if (!selected) return;

    setLoading(true);
    try {
      const body: Partial<WorkspaceForm> = {
        organizationId: selected.organizationId,
      };
      if (vals.workSpaceName?.trim()) body.workSpaceName = vals.workSpaceName.trim();
      if (Number.isFinite(vals.numberOfAccount)) body.numberOfAccount = Number(vals.numberOfAccount);
      if (vals.description?.trim()) body.description = vals.description.trim();
      if (imgUrlUpdate && imgUrlUpdate !== selected.imgUrl) body.imgUrl = imgUrlUpdate;

      await WorkspaceService.updateWorkspace(selected.id, body, { imgFile: imgFileUpdate || undefined });
      await fetchList({ silent: true });

      message.success('Cập nhật workspace thành công');

      setUpdateVisible(false);
      updateForm.resetFields();
      setImgUrlUpdate('');
      setImgFileUpdate(null);
      setSelected(null);
    } catch (err) {
      showErrorMessage(err, 'Không thể cập nhật workspace');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xóa workspace?',
      content: 'Hành động không thể hoàn tác.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          await WorkspaceService.deleteWorkspace(id);
          await fetchList({ silent: true });
          message.success('Xóa workspace thành công');
        } catch (err) {
          showErrorMessage(err, 'Không thể xóa workspace');
        } finally { setLoading(false); }
      },
    });
  };

  // ===== VIEW =====
  const handleView = async (rec: Workspace) => {
    try {
      setLoading(true);
      const data = await WorkspaceService.getWorkspaceById(rec.id);
      setViewData(data);
      setViewVisible(true);
    } catch (err) {
      showErrorMessage(err, 'Không thể lấy thông tin workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rec: Workspace) => {
    setSelected(rec);
    updateForm.setFieldsValue({
      workSpaceName: rec.workSpaceName,
      numberOfAccount: rec.numberOfAccount,
      description: rec.description,
    });
    setImgUrlUpdate(rec.imgUrl || '');
    setImgFileUpdate(null);
    setUpdateVisible(true);
  };

  const columns: ColumnsType<Workspace> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { 
      title: 'Name', dataIndex: 'workSpaceName', key: 'workSpaceName', width: 200, ellipsis: true,
      sorter: (a, b) => a.workSpaceName.localeCompare(b.workSpaceName)
    },
    { 
      title: 'Accounts', dataIndex: 'numberOfAccount', key: 'numberOfAccount', align: 'center', width: 120,
      sorter: (a, b) => a.numberOfAccount - b.numberOfAccount
    },
    { title: 'Description', dataIndex: 'description', key: 'description', width: 240, ellipsis: true },
    {
      title: 'Image', dataIndex: 'imgUrl', key: 'imgUrl', align: 'center', width: 110,
      render: (url) => url ? (
        <img src={url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
      ) : '—'
    },
    {
      title: 'Status', dataIndex: 'isActive', key: 'isActive', align: 'center', width: 120,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => value === 'active' ? record.isActive : !record.isActive,
      render: (v: boolean) => v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
    },
    {
      title: 'Actions', key: 'actions', width: 270, align: 'center',
      render: (_, rec) => (
        <Space wrap>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(rec)}>View</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(rec)}>Edit</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(rec.id)}>Delete</Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            placeholder="Search Workspace by name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)} disabled={!orgId}>
            Create workspace
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading || refreshing}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* CREATE */}
      <Modal
        title="Create workspace"
        open={createVisible}
        footer={null}
        onCancel={() => { setCreateVisible(false); createForm.resetFields(); setImgUrlCreate(''); setImgFileCreate(null); }}
        destroyOnHidden
        width={520}
      >
        <Form form={createForm} layout="vertical" onFinish={onCreate}>
          <Form.Item name="workSpaceName" label="Workspace name" rules={[{ required: true, message: 'Please input name' }]}>
            <Input placeholder="e.g. Logistics Lab" />
          </Form.Item>
          <Form.Item name="numberOfAccount" label="Number of accounts" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Image (Cloudinary)" required>
            <UploadCloudinary
              value={imgUrlCreate}
              onChange={setImgUrlCreate}
              onFileChange={setImgFileCreate}
            />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description' }]}>
            <Input.TextArea rows={3} placeholder="Short description…" />
          </Form.Item>
          <Row justify="end" gutter={8}>
            <Col>
              <Button onClick={() => { setCreateVisible(false); createForm.resetFields(); setImgUrlCreate(''); setImgFileCreate(null); }}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* UPDATE */}
      <Modal
        title="Update workspace"
        open={updateVisible}
        footer={null}
        onCancel={() => { setUpdateVisible(false); updateForm.resetFields(); setImgUrlUpdate(''); setImgFileUpdate(null); setSelected(null); }}
        destroyOnHidden
        width={520}
      >
        <Form form={updateForm} layout="vertical" onFinish={onUpdate}>
          <Form.Item name="workSpaceName" label="Workspace name">
            <Input placeholder="(optional)" />
          </Form.Item>
          <Form.Item name="numberOfAccount" label="Number of accounts" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Image (Cloudinary)">
            <UploadCloudinary value={imgUrlUpdate} onChange={setImgUrlUpdate} onFileChange={setImgFileUpdate} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="(optional)" />
          </Form.Item>
          <Row justify="end" gutter={8}>
            <Col>
              <Button onClick={() => { setUpdateVisible(false); updateForm.resetFields(); setImgUrlUpdate(''); setImgFileUpdate(null); setSelected(null); }}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* VIEW */}
      <Modal
        title="Workspace Details"
        open={viewVisible}
        footer={null}
        onCancel={() => { setViewVisible(false); setViewData(null); }}
        destroyOnHidden
        width={520}
      >
        {viewData ? (
          <div>
            <p><strong>ID:</strong> {viewData.id}</p>
            <p><strong>Name:</strong> {viewData.workSpaceName}</p>
            <p><strong>Description:</strong> {viewData.description}</p>
            <p><strong>Accounts:</strong> {viewData.numberOfAccount}</p>
            <p><strong>Status:</strong> {viewData.isActive ? 'Active' : 'Inactive'}</p>
            {viewData.imgUrl && (
              <img src={viewData.imgUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </>
  );
};

export default WorkspaceOrganization;
