// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Table, Button, Modal, Row, Col, Typography, Card, Tag, Space, Input, message
// } from 'antd';
// import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
// import type { ColumnsType } from 'antd/es/table';
// import type { ClassItem } from '../../../types/class';
// import { ClassService } from '../../../services/class.service';
// import { showErrorMessage } from '../../../utils/errorHandler';
// import './classOrganization.css';

// const { Title } = Typography;

// const getOrgId = (): string => {
//   try {
//     const raw = localStorage.getItem('currentUser');
//     return raw ? (JSON.parse(raw)?.organizationId || '') : '';
//   } catch {
//     return '';
//   }
// };

// const ClassManagerOrgAdmin: React.FC = () => {
//   const [rows, setRows] = useState<ClassItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchText, setSearchText] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

//   const [viewVisible, setViewVisible] = useState(false);
//   const [viewData, setViewData] = useState<ClassItem | null>(null);

//   const orgId = getOrgId();

//   useEffect(() => {
//     if (!orgId) {
//       message.error('Không tìm thấy organizationId');
//       return;
//     }
//     fetchList();
//   }, [orgId]);

//   const fetchList = async (opts?: { silent?: boolean }) => {
//     const silent = !!opts?.silent;
//     if (!silent) setLoading(true);
//     else setRefreshing(true);
//     try {
//       const all = await ClassService.getAll();
//       const filtered = all.filter(c => !c.organizationId || c.organizationId === orgId);
//       setRows(filtered);
//     } catch (err) {
//       showErrorMessage(err, 'Không thể tải danh sách lớp');
//     } finally {
//       if (!silent) setLoading(false);
//       else setRefreshing(false);
//     }
//   };

//   const data = useMemo(() => {
//     const q = searchText.toLowerCase().trim();
//     return rows
//       .filter(r => (statusFilter === 'all' ? true : statusFilter === 'active' ? r.isActive : !r.isActive))
//       .filter(r => !q || r.className.toLowerCase().includes(q));
//   }, [rows, searchText, statusFilter]);

//   const onView = async (rec: ClassItem) => {
//     try {
//       setLoading(true);
//       const detail = await ClassService.getById(rec.id);
//       setViewData(detail);
//       setViewVisible(true);
//     } catch (err) {
//       showErrorMessage(err, 'Không thể lấy thông tin lớp');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDelete = (id: string) => {
//     Modal.confirm({
//       title: 'Xóa lớp học?',
//       content: 'Hành động này không thể hoàn tác.',
//       okText: 'Xóa',
//       okButtonProps: { danger: true },
//       onOk: async () => {
//         setLoading(true);
//         try {
//           await ClassService.delete(id);
//           await fetchList({ silent: true });
//           message.success('Đã xóa lớp');
//         } catch (err) {
//           showErrorMessage(err, 'Không thể xóa lớp');
//         } finally {
//           setLoading(false);
//         }
//       },
//     });
//   };

//   const columns: ColumnsType<ClassItem> = [
//     { title: 'ID', dataIndex: 'id', key: 'id', width: 230, ellipsis: true },
//     {
//       title: 'Class Name',
//       dataIndex: 'className',
//       key: 'className',
//       width: 220,
//       ellipsis: true,
//       sorter: (a, b) => a.className.localeCompare(b.className),
//     },
//     {
//       title: 'Students',
//       dataIndex: 'numberOfStudent',
//       key: 'numberOfStudent',
//       width: 110,
//       align: 'center',
//       sorter: (a, b) => a.numberOfStudent - b.numberOfStudent,
//     },
//     {
//       title: 'Description',
//       dataIndex: 'description',
//       key: 'description',
//       width: 260,
//       ellipsis: true,
//       render: (v: string | null) => v || <span className="cm-muted">—</span>,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'isActive',
//       key: 'isActive',
//       width: 120,
//       align: 'center',
//       filters: [
//         { text: 'Active', value: 'active' },
//         { text: 'Inactive', value: 'inactive' },
//       ],
//       onFilter: (v, rec) => (v === 'active' ? rec.isActive : !rec.isActive),
//       render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
//     },
//     {
//       title: 'Created',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       width: 180,
//       ellipsis: true,
//       sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       width: 180,
//       align: 'center',
//       render: (_, rec) => (
//         <Space className="cm-actions">
//           <Button size="small" icon={<EyeOutlined />} onClick={() => onView(rec)}>
//             View
//           </Button>
//           <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(rec.id)}>
//             Delete
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="cm-root">
//       <Row justify="space-between" align="middle" className="cm-header">
//         <Col>
//           <Title level={3} className="cm-title">Class Manager</Title>
          
//         </Col>
//         <Col>
//           {/* chỗ này nếu sau cần Create Class, thêm nút tại đây */}
//         </Col>
//       </Row>

//       <Card className="cm-card">
//         <Row justify="space-between" align="middle" className="cm-toolbar">
//           <Col>
//             <Input.Search
//               placeholder="Search class by name"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               allowClear
//               style={{ width: 280 }}
//             />
//           </Col>
//           <Col className="cm-filter">
//             <Button
//               type={statusFilter === 'all' ? 'primary' : 'default'}
//               onClick={() => setStatusFilter('all')}
//               size="small"
//             >
//               All
//             </Button>
//             <Button
//               type={statusFilter === 'active' ? 'primary' : 'default'}
//               onClick={() => setStatusFilter('active')}
//               size="small"
//             >
//               Active
//             </Button>
//             <Button
//               type={statusFilter === 'inactive' ? 'primary' : 'default'}
//               onClick={() => setStatusFilter('inactive')}
//               size="small"
//             >
//               Inactive
//             </Button>
//           </Col>
//         </Row>

//         <Table<ClassItem>
//           rowKey="id"
//           columns={columns}
//           dataSource={data}
//           loading={loading || refreshing}
//           pagination={{ pageSize: 10 }}
//           scroll={{ x: 1200 }}
//         />
//       </Card>

//       {/* VIEW MODAL */}
//       <Modal
//         title="Class Details"
//         open={viewVisible}
//         onCancel={() => { setViewVisible(false); setViewData(null); }}
//         footer={null}
//         destroyOnClose
//         width={560}
//       >
//         {viewData ? (
//           <div className="cm-view">
//             <p><b>ID:</b> {viewData.id}</p>
//             <p><b>Class:</b> {viewData.className}</p>
//             <p><b>CourseId:</b> {viewData.courseId}</p>
//             <p><b>Students:</b> {viewData.numberOfStudent}</p>
//             <p><b>Status:</b> {viewData.isActive ? 'Active' : 'Inactive'}</p>
//             {viewData.description && <p><b>Description:</b> {viewData.description}</p>}
//             <p><b>Created:</b> {new Date(viewData.createdAt).toLocaleString()}</p>
//           </div>
//         ) : (
//           <div>Loading…</div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default ClassManagerOrgAdmin;
