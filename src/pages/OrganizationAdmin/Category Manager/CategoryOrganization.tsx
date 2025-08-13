// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography,
//   message, Space, Tag, Popconfirm, Select
// } from "antd";
// import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
// import type { ColumnsType } from "antd/es/table";
// import dayjs from "dayjs";

// import type { Category, CategoryForm } from "../../../types/category";
// import { CategoryService } from "../../../services/category.service";
// import { CourseService } from "../../../services/course.service";
// import type { Course } from "../../../types/course";
// import { showErrorMessage } from "../../../utils/errorHandler";

// const { Content } = Layout;
// const { Title, Text } = Typography;

// // map lỗi duplicate -> field categoryName
// const setFieldErrorsFromAPI = (form: any, err: any) => {
//   try {
//     const status = err?.response?.status;
//     const data = err?.response?.data;
//     const errors = data?.errors;

//     let msgName: string | undefined =
//       errors?.CategoryName?.[0] ||
//       errors?.categoryName?.[0] ||
//       (typeof data === "string" ? data : undefined) ||
//       data?.message || data?.title || err?.message;

//     const lower = String(msgName || "").toLowerCase();
//     if (status === 409 || lower.includes("duplicate") || lower.includes("exist") || lower.includes("already") || lower.includes("đã tồn tại")) {
//       msgName = msgName || "Category name already exists";
//     }
//     if (msgName) {
//       form.setFields([{ name: "categoryName", errors: [msgName] }]);
//       return true;
//     }
//   } catch {}
//   return false;
// };

// // tránh lệ thuộc Course.name
// const courseLabel = (c: Course) => {
//   const n = (c as any).courseName ?? (c as any).name ?? (c as any).title;
//   return (typeof n === "string" && n.trim()) ? n : c.id;
// };

// const CategoryOrganization: React.FC = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [openCreate, setOpenCreate] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [editRow, setEditRow] = useState<Category | null>(null);

//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
//   const [courseFilter, setCourseFilter] = useState<string | "">("");

//   const [formCreate] = Form.useForm<CategoryForm>();
//   const [formEdit] = Form.useForm<CategoryForm>();

//   // BroadcastChannel (không kèm orgId nữa)
//   const bc = useMemo(() => new BroadcastChannel("org-categories"), []);
//   useEffect(() => {
//     const onMsg = (e: MessageEvent) => {
//       const m = e.data as { type: string };
//       if (m?.type?.startsWith("category:")) loadAll();
//     };
//     bc.addEventListener("message", onMsg);
//     return () => bc.close();
//   }, [bc]);

//   const loadAll = async () => {
//     setLoading(true);
//     try {
//       const [cats, allCourses] = await Promise.all([
//         CategoryService.getAll(),
//         CourseService.getAllCourses(),
//       ]);
//       setCategories(cats);
//       setCourses(allCourses);
//     } catch (err) {
//       showErrorMessage(err, "Failed to load categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAll();
//   }, []);

//   // filter UI
//   const filtered = useMemo(() => {
//     const q = searchText.trim().toLowerCase();
//     const courseSet = new Set(courseFilter ? [courseFilter] : courses.map((c) => c.id));

//     return categories
//       .filter((cat) => {
//         const hitStatus = statusFilter === "" ? true : statusFilter === "active" ? cat.isActive : !cat.isActive;
//         const hitCourse = !courseFilter ? true : (cat.courses || []).some((cid) => courseSet.has(cid));
//         const hitQ = !q || (cat.categoryName || "").toLowerCase().includes(q);
//         return hitStatus && hitCourse && hitQ;
//       })
//       .sort((a, b) => dayjs(a.createdAt || 0).valueOf() - dayjs(b.createdAt || 0).valueOf());
//   }, [categories, statusFilter, searchText, courseFilter, courses]);

//   const resetCreateForm = () => formCreate.resetFields();
//   const resetEditForm = () => { formEdit.resetFields(); setEditRow(null); };

//   const onOpenCreate = () => {
//     resetCreateForm();
//     formCreate.setFieldsValue({ isActive: true });
//     setOpenCreate(true);
//   };

//   const submitCreate = async () => {
//     const vals = await formCreate.validateFields();
//     setSaving(true);
//     try {
//       await CategoryService.create({ categoryName: vals.categoryName, isActive: vals.isActive ?? true });
//       message.success("Category created");
//       setOpenCreate(false);
//       resetCreateForm();
//       await loadAll();
//       bc.postMessage({ type: "category:created" });
//     } catch (err: any) {
//       if (setFieldErrorsFromAPI(formCreate, err)) return;
//       showErrorMessage(err, "Cannot create category");
//     } finally { setSaving(false); }
//   };

//   const onOpenEdit = (row: Category) => {
//     setEditRow(row);
//     formEdit.setFieldsValue({ categoryName: row.categoryName, isActive: row.isActive });
//     setOpenEdit(true);
//   };

//   const submitEdit = async () => {
//     if (!editRow) return;
//     const vals = await formEdit.validateFields();
//     setSaving(true);
//     try {
//       await CategoryService.update(editRow.id, { categoryName: vals.categoryName, isActive: vals.isActive ?? true });
//       message.success("Category updated");
//       setOpenEdit(false);
//       resetEditForm();
//       await loadAll();
//       bc.postMessage({ type: "category:updated" });
//     } catch (err: any) {
//       if (setFieldErrorsFromAPI(formEdit, err)) return;
//       showErrorMessage(err, "Cannot update category");
//     } finally { setSaving(false); }
//   };

//   const onDelete = async (row: Category) => {
//     setLoading(true);
//     try {
//       await CategoryService.delete(row.id);
//       message.success("Category deleted");
//       await loadAll();
//       bc.postMessage({ type: "category:deleted" });
//     } catch (err) {
//       showErrorMessage(err, "Cannot delete category");
//     } finally { setLoading(false); }
//   };

//   const columns: ColumnsType<Category> = [
//     {
//       title: "Category",
//       dataIndex: "categoryName",
//       key: "categoryName",
//       render: (v, r) => (
//         <div>
//           <div style={{ fontWeight: 600 }}>{v}</div>
//           <Text type="secondary" style={{ fontSize: 12 }}>#{r.id.slice(0, 8)}</Text>
//         </div>
//       ),
//     },
//     {
//       title: "Courses",
//       key: "courses",
//       width: 120,
//       render: (_, r) => <Text>{r.courses?.length ?? 0}</Text>,
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       width: 120,
//       filters: [
//         { text: "Active", value: "active" },
//         { text: "Not active", value: "inactive" },
//       ],
//       onFilter: (val, rec) => (val === "active" ? rec.isActive : !rec.isActive),
//       render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "Active" : "Not active"}</Tag>,
//     },
//     {
//       title: "Created",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 170,
//       render: (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD HH:mm") : "—"),
//     },
//     {
//       title: "Action",
//       key: "action",
//       width: 180,
//       render: (_, row) => (
//         <Space>
//           <Button icon={<EditOutlined />} size="small" onClick={() => onOpenEdit(row)}>Edit</Button>
//           <Popconfirm
//             title="Delete category?"
//             okText="Delete"
//             okButtonProps={{ danger: true }}
//             onConfirm={() => onDelete(row)}
//           >
//             <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <Layout>
//       <Content style={{ padding: 24 }}>
//         <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
//           <Col><Title level={3} style={{ margin: 0 }}>Category Manager</Title></Col>
//           <Col>
//             <Space>
//               <Button icon={<ReloadOutlined />} onClick={loadAll}>Reload</Button>
//               <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>Create Category</Button>
//             </Space>
//           </Col>
//         </Row>

//         <Card style={{ marginBottom: 12 }}>
//           <Row gutter={[12, 12]} align="middle">
//             <Col xs={24} md={10} lg={12}>
//               <Input
//                 allowClear
//                 prefix={<SearchOutlined />}
//                 placeholder="Search category…"
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//               />
//             </Col>
//             <Col xs={12} md={6}>
//               <Select
//                 allowClear
//                 style={{ width: "100%" }}
//                 placeholder="Filter status"
//                 value={statusFilter || undefined}
//                 onChange={(v) => setStatusFilter((v as any) ?? "")}
//                 options={[
//                   { label: "Active", value: "active" },
//                   { label: "Not active", value: "inactive" },
//                 ]}
//               />
//             </Col>
//             <Col xs={12} md={8}>
//               <Select
//                 allowClear
//                 style={{ width: "100%" }}
//                 placeholder="Filter by course"
//                 value={courseFilter || undefined}
//                 onChange={(v) => setCourseFilter((v as string) ?? "")}
//                 options={courses.map((c: Course) => ({ label: courseLabel(c), value: c.id }))}
//               />
//             </Col>
//           </Row>
//         </Card>

//         <Card>
//           <Table
//             rowKey="id"
//             loading={loading}
//             dataSource={filtered}
//             columns={columns}
//             pagination={{ pageSize: 10, showSizeChanger: true }}
//             scroll={{ x: 900 }}
//           />
//         </Card>

//         {/* Create */}
//         <Modal
//           title="Create Category"
//           open={openCreate}
//           onOk={submitCreate}
//           okButtonProps={{ loading: saving, disabled: saving }}
//           onCancel={() => { setOpenCreate(false); resetCreateForm(); }}
//           destroyOnClose
//           width={520}
//         >
//           <Form form={formCreate} layout="vertical">
//             <Form.Item name="categoryName" label="Category name" rules={[{ required: true }]}>
//               <Input />
//             </Form.Item>
//             <Form.Item name="isActive" label="Status" initialValue={true}>
//               <Select
//                 options={[
//                   { label: "Active", value: true },
//                   { label: "Not active", value: false },
//                 ]}
//               />
//             </Form.Item>
//           </Form>
//         </Modal>

//         {/* Edit */}
//         <Modal
//           title="Edit Category"
//           open={openEdit}
//           onOk={submitEdit}
//           okButtonProps={{ loading: saving, disabled: saving }}
//           onCancel={() => { setOpenEdit(false); resetEditForm(); }}
//           destroyOnClose
//           width={520}
//         >
//           <Form form={formEdit} layout="vertical">
//             <Form.Item name="categoryName" label="Category name" rules={[{ required: true }]}>
//               <Input />
//             </Form.Item>
//             <Form.Item name="isActive" label="Status">
//               <Select
//                 options={[
//                   { label: "Active", value: true },
//                   { label: "Not active", value: false },
//                 ]}
//               />
//             </Form.Item>
//           </Form>
//         </Modal>
//       </Content>
//     </Layout>
//   );
// };

// export default CategoryOrganization;
