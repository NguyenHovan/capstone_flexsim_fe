// src/pages/organization/topic/TopicOrganization.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Layout, Card, Table, Button, Modal, Form, Input, Row, Col, Typography,
  message, Select, Space, Tag, InputNumber, Upload, Image, Popconfirm, Switch
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { TopicService } from "../../../services/topic.service";
import type { Topic } from "../../../types/topic";
import { CourseService } from "../../../services/course.service";
import type { Course } from "../../../types/course";
import { WorkspaceService } from "../../../services/workspace.service";
import type { Workspace } from "../../../types/workspace";
import { showErrorMessage } from "../../../utils/errorHandler";

const { Content } = Layout;
const { Title, Text } = Typography;

const getOrganizationId = (): string => {
  try {
    const s = localStorage.getItem("currentUser");
    return s ? JSON.parse(s).organizationId || "" : "";
  } catch { return ""; }
};


// map lỗi từ BE xuống form fields (ví dụ duplicate)
const setFieldErrorsFromAPI = (form: any, err: any) => {
  try {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const errors = data?.errors;

    let msgTopicName: string | undefined =
      errors?.TopicName?.[0] || errors?.topicName?.[0];

    let genericMsg: string | undefined =
      (typeof data === "string" ? data : undefined) ||
      data?.message || data?.title || err?.message;

    const lower = String(msgTopicName || genericMsg || "").toLowerCase();
    if (
      status === 409 ||
      lower.includes("duplicate") ||
      lower.includes("exist") ||
      lower.includes("already") ||
      lower.includes("đã tồn tại")
    ) {
      msgTopicName = msgTopicName || genericMsg || "Topic name already exists";
    }

    const fields: any[] = [];
    if (msgTopicName) fields.push({ name: "topicName", errors: [msgTopicName] });
    if (fields.length) { form.setFields(fields); return true; }
  } catch {}
  return false;
};

const TopicOrganization: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState<Topic | null>(null);

  const [courseFilter, setCourseFilter] = useState<string | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [searchText, setSearchText] = useState("");

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editUploadFile, setEditUploadFile] = useState<File | null>(null);

  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();

  const orgId = getOrganizationId();

  // broadcast reload
  const bc = useMemo(() => new BroadcastChannel("org-topics"), []);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const m = e.data as { type: string; organizationId?: string };
      if (m?.type?.startsWith("topic:") && (!m.organizationId || m.organizationId === orgId)) {
        loadAll();
      }
    };
    bc.addEventListener("message", onMsg);
    return () => bc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const labelCourse = (c: Course) => c.courseName ?? (c as any).courseName ?? c.id;

  // ✅ Lọc theo orgId: Workspace(orgId) -> Course(workSpaceId in orgWs) -> Topic(courseId in orgCourses)
  const loadAll = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [allTopics, allCourses, allWorkspaces] = await Promise.all([
        TopicService.getAllTopics(),
        CourseService.getAllCourses(),
        WorkspaceService.getAll(),
      ]);

      // 1) workspaces thuộc org
      const orgWs = (allWorkspaces as Workspace[]).filter(w => w.organizationId === orgId);
      const wsIds = new Set(orgWs.map(w => w.id));
      setWorkspaces(orgWs);

      // 2) courses thuộc các workspace này
      const orgCourses = (allCourses as Course[]).filter(c => wsIds.has((c as any).workSpaceId));
      const courseIds = new Set(orgCourses.map(c => c.id));
      setCourses(orgCourses);

      // 3) topics thuộc các course ở trên
      const orgTopics = (allTopics as Topic[]).filter(t => courseIds.has(t.courseId));
      setTopics(orgTopics);

      // nếu đang chọn filter course nhưng course đó không thuộc org → clear
      if (courseFilter && !courseIds.has(courseFilter)) setCourseFilter("");
    } catch (err) {
      showErrorMessage(err, "Failed to load topics");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!orgId) { message.error("Organization not found"); return; }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const courseNameById = useMemo<Record<string, string>>(
    () => courses.reduce((acc, c) => { acc[c.id] = labelCourse(c); return acc; }, {} as Record<string, string>),
    [courses]
  );

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return topics
      .filter(t => {
        const hitCourse = courseFilter ? t.courseId === courseFilter : true;
        const hitStatus = statusFilter === "" ? true : statusFilter === "active" ? t.isActive : !t.isActive;
        const hitQ = !q || t.topicName?.toLowerCase().includes(q) || courseNameById[t.courseId]?.toLowerCase()?.includes(q);
        return hitCourse && hitStatus && hitQ;
      })
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [topics, courseFilter, statusFilter, searchText, courseNameById]);

  const resetCreateForm = () => { formCreate.resetFields(); setUploadFile(null); };
  const resetEditForm = () => { formEdit.resetFields(); setEditUploadFile(null); setEditRow(null); };

  // gửi cả 'image' và 'file' (nếu BE chỉ nhận 1 trong 2) — nếu không đổi ảnh thì giữ imgUrl cũ
  const buildFormData = (vals: any, file: File | null) => {
    const fd = new FormData();
    fd.append("courseId", vals.courseId);
    fd.append("topicName", vals.topicName);
    fd.append("orderIndex", String(vals.orderIndex ?? 0));
    fd.append("description", vals.description ?? "");
    fd.append("isActive", String(!!vals.isActive));
    if (file) {
      fd.append("image", file);
      fd.append("file", file);
    } else if (vals.imgUrl) {
      fd.append("imgUrl", vals.imgUrl);
    }
    return fd;
  };

  const onOpenCreate = () => {
    resetCreateForm();
    const defaultCourse = courseFilter || courses[0]?.id;
    formCreate.setFieldsValue({ courseId: defaultCourse, orderIndex: 0, isActive: true, imgUrl: "" });
    setOpenCreate(true);
  };

  const submitCreate = async () => {
    if (saving) return;
    const vals = await formCreate.validateFields();
    setSaving(true);
    try {
      // chỉ cho tạo nếu course thuộc org
      if (!courses.some(c => c.id === vals.courseId)) {
        message.error("You cannot create topic for this course");
        return;
      }
      const fd = buildFormData(vals, uploadFile);
      await TopicService.createTopic(fd);
      message.success("Topic created");
      setOpenCreate(false);
      resetCreateForm();
      await loadAll();
      bc.postMessage({ type: "topic:created", organizationId: orgId });
    } catch (err: any) {
      if (setFieldErrorsFromAPI(formCreate, err)) return;
      showErrorMessage(err, "Cannot create topic");
    } finally { setSaving(false); }
  };

  const onOpenEdit = (row: Topic) => {
    // topic chỉ được sửa nếu course của nó thuộc org hiện tại
    if (!courses.some(c => c.id === row.courseId)) {
      message.error("You cannot edit topic from another organization");
      return;
    }
    setEditRow(row);
    setEditUploadFile(null);
    formEdit.setFieldsValue({
      courseId: row.courseId,
      topicName: row.topicName,
      orderIndex: row.orderIndex,
      description: row.description,
      isActive: row.isActive,
      imgUrl: row.imgUrl,
    });
    setOpenEdit(true);
  };

  const submitEdit = async () => {
    if (saving) return;
    if (!editRow) return;
    const vals = await formEdit.validateFields();
    setSaving(true);
    try {
      // không thể chuyển sang course khác org
      if (!courses.some(c => c.id === vals.courseId)) {
        message.error("You cannot move topic to a course from another organization");
        return;
      }
      const fd = buildFormData(vals, editUploadFile);
      await TopicService.updateTopic(editRow.id, fd);
      message.success("Topic updated");
      setOpenEdit(false);
      resetEditForm();
      await loadAll();
      bc.postMessage({ type: "topic:updated", organizationId: orgId });
    } catch (err: any) {
      if (setFieldErrorsFromAPI(formEdit, err)) return;
      showErrorMessage(err, "Cannot update topic");
    } finally { setSaving(false); }
  };

  const onDelete = async (row: Topic) => {
    // chỉ xóa được nếu thuộc org
    if (!courses.some(c => c.id === row.courseId)) {
      message.error("You cannot delete topic from another organization");
      return;
    }
    setLoading(true);
    try {
      await TopicService.deleteTopic(row.id);
      message.success("Topic deleted");
      await loadAll();
      bc.postMessage({ type: "topic:deleted", organizationId: orgId });
    } catch (err) {
      showErrorMessage(err, "Cannot delete topic");
    } finally { setLoading(false); }
  };

  const columns: ColumnsType<Topic> = [
    {
      title: "Image", dataIndex: "imgUrl", key: "imgUrl", width: 90,
      render: (url) =>
        url ? <Image src={url} width={56} height={40} style={{ objectFit: "cover", borderRadius: 6 }} />
            : <Text type="secondary">—</Text>,
    },
    {
      title: "Topic", dataIndex: "topicName", key: "topicName",
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>#{r.id.slice(0, 8)}</Text>
        </div>
      ),
    },
    { title: "Course", dataIndex: "courseId", key: "courseId", render: (cid: string) => courseNameById[cid] || cid, width: 220 },
    { title: "Order", dataIndex: "orderIndex", key: "orderIndex", width: 90, sorter: (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) },
    {
      title: "Status", dataIndex: "isActive", key: "isActive", width: 110,
      render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "Active" : "Not active"}</Tag>,
      filters: [{ text: "Active", value: "active" }, { text: "Not active", value: "inactive" }],
      onFilter: (val, rec) => (val === "active" ? rec.isActive : !rec.isActive),
    },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", width: 160, render: (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD HH:mm") : "—") },
    {
      title: "Action", key: "action", width: 160,
      render: (_, row) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => onOpenEdit(row)}>Edit</Button>
          <Popconfirm title="Delete topic?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(row)}>
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!orgId) {
    return (
      <Layout>
        <Content style={{ padding: 24 }}>
          <Card><Text type="danger">Organization not found. Please sign in again.</Text></Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col><Title level={3} style={{ margin: 0 }}>Topic Manager</Title></Col>
          <Col>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={loadAll}>Reload</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>Create Topic</Button>
            </Space>
          </Col>
        </Row>

        <Card style={{ marginBottom: 12 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10} lg={12}>
              <Input
                allowClear prefix={<SearchOutlined />} placeholder="Search by topic or course…"
                value={searchText} onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Select
                allowClear style={{ width: "100%" }} placeholder="Filter by course"
                value={courseFilter || undefined} onChange={(v) => setCourseFilter((v as string) ?? "")}
                options={courses.map((c) => ({ label: labelCourse(c), value: c.id }))}
              />
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Select
                allowClear style={{ width: "100%" }} placeholder="Filter status"
                value={statusFilter || undefined} onChange={(v) => setStatusFilter((v as any) ?? "")}
                options={[{ label: "Active", value: "active" }, { label: "Not active", value: "inactive" }]}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            rowKey="id" loading={loading} dataSource={filtered} columns={columns}
            pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 1000 }}
          />
        </Card>

        {/* Create */}
        <Modal
          title="Create Topic" open={openCreate} onOk={submitCreate}
          okButtonProps={{ loading: saving, disabled: saving }}
          onCancel={() => { setOpenCreate(false); resetCreateForm(); }}
          destroyOnClose width={680}
        >
          <Form form={formCreate} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="courseId" label="Course" rules={[{ required: true }]}>
                  <Select placeholder="Select course"
                    options={courses.map((c) => ({ label: labelCourse(c), value: c.id }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="topicName" label="Topic name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="orderIndex" label="Order" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Description"><Input.TextArea rows={4} /></Form.Item>
            <Form.Item name="imgUrl" hidden><Input /></Form.Item>
            <Form.Item label="Image">
              <Upload maxCount={1} accept="image/*"
                beforeUpload={(file) => { setUploadFile(file); return false; }}
                onRemove={() => setUploadFile(null)}
              >
                <Button icon={<UploadOutlined />}>Choose Image</Button>
              </Upload>
              <Text type="secondary">File will be uploaded with the topic.</Text>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit */}
        <Modal
          title="Edit Topic" open={openEdit} onOk={submitEdit}
          okButtonProps={{ loading: saving, disabled: saving }}
          onCancel={() => { setOpenEdit(false); resetEditForm(); }}
          destroyOnClose width={680}
        >
          <Form form={formEdit} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="courseId" label="Course" rules={[{ required: true }]}>
                  <Select placeholder="Select course"
                    options={courses.map((c) => ({ label: labelCourse(c), value: c.id }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="topicName" label="Topic name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="orderIndex" label="Order" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isActive" label="Status" valuePropName="checked">
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Description"><Input.TextArea rows={4} /></Form.Item>
            <Form.Item name="imgUrl" hidden><Input /></Form.Item>
            <Form.Item label="Change image (optional)">
              <Upload maxCount={1} accept="image/*"
                beforeUpload={(file) => { setEditUploadFile(file); return false; }}
                onRemove={() => setEditUploadFile(null)}
              >
                <Button icon={<UploadOutlined />}>Choose Image</Button>
              </Upload>
              {editRow?.imgUrl && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Current:</Text>
                  <div><Image src={editRow.imgUrl} width={120} /></div>
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default TopicOrganization;
