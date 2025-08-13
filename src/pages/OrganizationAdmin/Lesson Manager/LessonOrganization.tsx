// // LessonOrganization.tsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { Table, Modal, Row, Col, Typography, Card, Tag, Space, Input, message } from 'antd';
// import { EyeOutlined } from '@ant-design/icons';
// import type { ColumnsType } from 'antd/es/table';
// import type { Lesson } from '../../../types/lesson';
// import type { Course } from '../../../types/course';
// import type { Topic } from '../../../types/topic';
// import type { Workspace } from '../../../types/workspace';
// import { LessonService } from '../../../services/lesson.service';
// import { CourseService } from '../../../services/course.service';
// import { TopicService } from '../../../services/topic.service';
// import { WorkspaceService } from '../../../services/workspace.service';
// import { showErrorMessage } from '../../../utils/errorHandler';
// import './lessonOrganization.css';

// const { Title } = Typography;

// const getOrgId = (): string => {
//   try {
//     const raw = localStorage.getItem('currentUser');
//     return raw ? (JSON.parse(raw)?.organizationId || '') : '';
//   } catch {
//     return '';
//   }
// };

// const LessonOrganization: React.FC = () => {
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [topics, setTopics] = useState<Topic[]>([]);
//   const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const [searchText, setSearchText] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

//   const [viewVisible, setViewVisible] = useState(false);
//   const [viewData, setViewData] = useState<Lesson | null>(null);

//   const orgId = getOrgId();

//   useEffect(() => {
//     if (!orgId) {
//       message.error('Không tìm thấy Organization ID');
//       return;
//     }
//     init();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [orgId]);

//   const init = async () => {
//   setLoading(true);
//   try {
//     // ✅ by-org
//     const orgWs: Workspace[] = await WorkspaceService.getAllByOrgId(orgId);
//     setWorkspaces(orgWs);
//     const orgWorkspaceIds = new Set(orgWs.map(w => w.id));

//     // ✅ by-org
//     const orgCourses: Course[] = await CourseService.getAllByOrgId(orgId);
//     const filteredCourses = orgCourses.filter(c => orgWorkspaceIds.has((c as any).workSpaceId));
//     setCourses(filteredCourses);
//     const orgCourseIds = new Set(filteredCourses.map(c => c.id));

//     // ⏳ Topic/Lesson chưa có by-org → lấy all rồi lọc theo courseIds
//     const allTopics: Topic[]  = await TopicService.getAllTopics();
//     const orgTopics = allTopics.filter(t => orgCourseIds.has(t.courseId));
//     setTopics(orgTopics);
//     const topicToCourse = new Map(orgTopics.map(t => [t.id, t.courseId]));

//     const allLessons: Lesson[] = await LessonService.getAll();
//     const orgLessons = allLessons.filter(l => topicToCourse.has(l.topicId));
//     setLessons(orgLessons);
//   } catch (err) {
//     showErrorMessage(err, 'Không thể tải dữ liệu bài học');
//   } finally {
//     setLoading(false);
//   }
// };
//   // Map courseId -> courseName
//   const courseNameById = useMemo(() => {
//     const map = new Map<string, string>();
//     courses.forEach((c: Course) => map.set(c.id, c.courseName));
//     return map;
//   }, [courses]);

//   // Map topicId -> courseId
//   const courseIdByTopicId = useMemo(() => {
//     const map = new Map<string, string>();
//     topics.forEach((t: Topic) => map.set(t.id, t.courseId));
//     return map;
//   }, [topics]);

//   const data = useMemo(() => {
//     const q = searchText.toLowerCase().trim();
//     return lessons
//       .filter((l: Lesson) => 
//         statusFilter === 'all' 
//           ? true 
//           : statusFilter === 'active' 
//             ? (l.isActive ?? true) 
//             : !(l.isActive ?? true)
//       )
//       .filter((l: Lesson) => !q || (l.lessonName || '').toLowerCase().includes(q));
//   }, [lessons, searchText, statusFilter]);

//   const onView = (rec: Lesson) => {
//     setViewData(rec);
//     setViewVisible(true);
//   };

//   const columns: ColumnsType<Lesson> = [
//     { title: 'ID', dataIndex: 'id', key: 'id', width: 240, ellipsis: true },
//     {
//       title: 'Lesson Name',
//       dataIndex: 'lessonName',
//       key: 'lessonName',
//       width: 240,
//       ellipsis: true,
//       sorter: (a: Lesson, b: Lesson) => (a.lessonName || '').localeCompare(b.lessonName || ''),
//     },
//     {
//       title: 'Course',
//       dataIndex: 'topicId',
//       key: 'course',
//       width: 240,
//       ellipsis: true,
//       render: (_: any, rec: Lesson) => {
//         const courseId = courseIdByTopicId.get(rec.topicId);
//         return courseId ? (courseNameById.get(courseId) || courseId) : '—';
//       },
//     },
//     {
//       title: 'Description',
//       dataIndex: 'description',
//       key: 'description',
//       width: 320,
//       ellipsis: true,
//       render: (v?: string | null) => v || <span className="ls-muted">—</span>,
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
//       onFilter: (v, rec) => (v === 'active' ? (rec.isActive ?? true) : !(rec.isActive ?? true)),
//       render: (v?: boolean) => (v ?? true) ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
//     },
//     {
//       title: 'Created',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       width: 180,
//       ellipsis: true,
//       sorter: (a: Lesson, b: Lesson) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
//       render: (v?: string) => v ? new Date(v).toLocaleString() : '—',
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       width: 120,
//       align: 'center',
//       render: (_: any, rec: Lesson) => (
//         <Space className="ls-actions">
//           <EyeOutlined onClick={() => onView(rec)} style={{ cursor: 'pointer' }} />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="ls-root">
//       <Row justify="space-between" align="middle" className="ls-header">
//         <Col>
//           <Title level={3} className="ls-title">Lesson Manager</Title>
//         </Col>
//         <Col />
//       </Row>

//       <Card className="ls-card">
//         <Row justify="space-between" align="middle" className="ls-toolbar">
//           <Col>
//             <Input.Search
//               placeholder="Search lesson by name"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               allowClear
//               style={{ width: 300 }}
//             />
//           </Col>
//           <Col className="ls-filter">
//             <button 
//               className={`ls-pill ${statusFilter === 'all' ? 'is-active' : ''}`} 
//               onClick={() => setStatusFilter('all')}
//             >
//               All
//             </button>
//             <button 
//               className={`ls-pill ${statusFilter === 'active' ? 'is-active' : ''}`} 
//               onClick={() => setStatusFilter('active')}
//             >
//               Active
//             </button>
//             <button 
//               className={`ls-pill ${statusFilter === 'inactive' ? 'is-active' : ''}`} 
//               onClick={() => setStatusFilter('inactive')}
//             >
//               Inactive
//             </button>
//           </Col>
//         </Row>

//         <Table<Lesson>
//           rowKey="id"
//           columns={columns}
//           dataSource={data}
//           loading={loading || refreshing}
//           pagination={{ pageSize: 10 }}
//           scroll={{ x: 1200 }}
//         />
//       </Card>

//       <Modal
//         title="Lesson Details"
//         open={viewVisible}
//         onCancel={() => { setViewVisible(false); setViewData(null); }}
//         footer={null}
//         destroyOnClose
//         width={560}
//       >
//         {viewData ? (
//           <div className="ls-view">
//             <p><b>ID:</b> {viewData.id}</p>
//             <p><b>Name:</b> {viewData.lessonName}</p>
//             <p><b>Topic ID:</b> {viewData.topicId}</p>
//             <p>
//               <b>Course:</b>{' '}
//               {(() => {
//                 const cid = courseIdByTopicId.get(viewData.topicId);
//                 return cid ? (courseNameById.get(cid) || cid) : '—';
//               })()}
//             </p>
//             {viewData.description && <p><b>Description:</b> {viewData.description}</p>}
//             {viewData.createdAt && <p><b>Created:</b> {new Date(viewData.createdAt).toLocaleString()}</p>}
//             <p><b>Status:</b> {(viewData.isActive ?? true) ? 'Active' : 'Inactive'}</p>
//           </div>
//         ) : 'Loading…'}
//       </Modal>
//     </div>
//   );
// };

// export default LessonOrganization;
