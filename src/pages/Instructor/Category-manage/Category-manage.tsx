import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Row, Col, Card, message,
  Space, Tag, Avatar, Empty, Tooltip, Switch, Select
} from "antd";
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  TeamOutlined, ReadOutlined, LockOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CategoryService } from "../../../services/category.service";
import { CourseService } from "../../../services/course.service";
import type { Category } from "../../../types/category";
import type { Course } from "../../../types/course";
import { WorkspaceService } from "../../../services/workspace.service";
import type { Workspace } from "../../../types/workspace";
import "./category-manage.css";

/** Chevron V dày, xoay khi expanded */
const ShowMoreChevron: React.FC<{ expanded?: boolean }> = ({ expanded }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className={`showmore-chevron ${expanded ? "is-expanded" : ""}`}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 8 L12 16 L20 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CategoryManage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { return null; }
  }, []);
  const myOrgId: string | null = currentUser?.organizationId ?? null;

  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [selected, setSelected] = useState<Category | null>(null);
  const [viewData, setViewData] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [coursesByCat, setCoursesByCat] = useState<Record<string, Course[]>>({});
  const [expLoading, setExpLoading] = useState<Record<string, boolean>>({});

  const fetchAllCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getCategories();
      setCategories(data || []);
    } catch {
      message.error("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      let ws: Workspace[] = [];
      if (myOrgId && (WorkspaceService as any).getAllByOrg) {
        ws = await (WorkspaceService as any).getAllByOrg(myOrgId);
      } else if ((WorkspaceService as any).getAll) {
        ws = await (WorkspaceService as any).getAll();
      } else if ((WorkspaceService as any).getWorkspaces) {
        ws = await (WorkspaceService as any).getWorkspaces();
      }
      setWorkspaces(ws || []);
    } catch {
      message.error("Không thể tải workspace.");
    }
  };

  useEffect(() => {
    fetchAllCategories();
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wsNameMap = useMemo(
    () => Object.fromEntries(workspaces.map(w => [w.id, w.workSpaceName])),
    [workspaces]
  );

  const getCategoryWorkspaceId = (rec: any) =>
    rec?.workSpaceId ?? rec?.workspaceId ?? rec?.workspacedId ?? null;

  /** Tập workspace id thuộc đúng organization hiện tại */
  const myWsIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of workspaces) {
      if (!myOrgId || w.organizationId === myOrgId) set.add(w.id);
    }
    return set;
  }, [workspaces, myOrgId]);

  /** Lọc categories theo workspace thuộc tổ chức của user */
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const wsId = getCategoryWorkspaceId(c);
      return wsId && myWsIdSet.has(wsId);
    });
  }, [categories, myWsIdSet]);

  /** Quyền thao tác — lớp bảo vệ bổ sung (dù đã lọc) */
  const canOperate = (rec: Category) => {
    const wsId = getCategoryWorkspaceId(rec);
    return !!(wsId && myWsIdSet.has(wsId));
  };

  const fetchCoursesOfCategory = async (categoryId: string) => {
    if (coursesByCat[categoryId]) return;
    try {
      setExpLoading(s => ({ ...s, [categoryId]: true }));
      const res = await CourseService.getCourseByCategoryId(categoryId);
      const courses: Course[] = res?.data ?? res ?? [];
      setCoursesByCat(s => ({ ...s, [categoryId]: courses }));
    } catch {
      message.error("Không thể tải khoá học của danh mục này.");
    } finally {
      setExpLoading(s => ({ ...s, [categoryId]: false }));
    }
  };

  const onCreate = async (vals: { categoryName: string; isActive: boolean; workSpaceId: string }) => {
    try {
      if (!myWsIdSet.has(vals.workSpaceId)) {
        message.error("Workspace không thuộc tổ chức của bạn.");
        return;
      }
      const body: any = {
        workSpaceId: vals.workSpaceId,
        categoryName: vals.categoryName,
        isActive: vals.isActive,
      };
      await CategoryService.createCategory(body as any);
      message.success("Tạo danh mục thành công");
      setCreateVisible(false);
      createForm.resetFields();
      fetchAllCategories();
    } catch {
      message.error("Tạo danh mục thất bại");
    }
  };

  const onUpdate = async (vals: { categoryName: string; isActive: boolean; workSpaceId: string }) => {
    if (!selected) return;
    try {
      if (!myWsIdSet.has(vals.workSpaceId)) {
        message.error("Workspace không thuộc tổ chức của bạn.");
        return;
      }
      const body: any = {
        workSpaceId: vals.workSpaceId,
        categoryName: vals.categoryName,
        isActive: vals.isActive,
      };
      await CategoryService.updateCategory(selected.id, body as any);
      message.success("Cập nhật thành công");
      setUpdateVisible(false);
      updateForm.resetFields();
      setSelected(null);
      fetchAllCategories();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      const rec = categories.find(c => c.id === deleteId);
      if (rec && !canOperate(rec)) {
        message.error("Bạn không có quyền xoá danh mục của tổ chức khác.");
        return;
      }
      await CategoryService.deleteCategory(deleteId);
      message.success("Xoá thành công");
      setDeleteVisible(false);
      setDeleteId(null);
      fetchAllCategories();
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const handleView = (rec: Category) => {
    if (!canOperate(rec)) {
      message.warning("Không thể xem Category của tổ chức khác.");
      return;
    }
    setViewData(rec);
    setViewVisible(true);
  };

  const handleEdit = (rec: any) => {
    if (!canOperate(rec)) {
      message.warning("Không thể sửa Category của tổ chức khác.");
      return;
    }
    setSelected(rec);
    updateForm.setFieldsValue({
      categoryName: rec.categoryName,
      isActive: (rec as any).isActive ?? true,
      workSpaceId: getCategoryWorkspaceId(rec),
    });
    setUpdateVisible(true);
  };

  const handleDelete = (id: string) => {
    const rec = categories.find(c => c.id === id);
    if (rec && !canOperate(rec)) {
      message.warning("Không thể xoá Category của tổ chức khác.");
      return;
    }
    setDeleteId(id);
    setDeleteVisible(true);
  };

  const columns: ColumnsType<Category> = [
    { title: "ID", dataIndex: "id", key: "id", ellipsis: true, width: 260 },
    { title: "Tên danh mục", dataIndex: "categoryName", key: "categoryName" },
    {
      title: "Workspace",
      key: "workSpaceId",
      width: 220,
      render: (_, rec: any) => {
        const wsId = getCategoryWorkspaceId(rec);
        return wsId ? wsNameMap[wsId] || wsId : "—";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 140,
      render: (v: boolean) =>
        v ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 180,
      render: (_, rec) => {
        const allowed = canOperate(rec);
        return (
          <Space>
            <Tooltip title={allowed ? "Xem" : "Khoá - khác tổ chức"}>
              <Button icon={allowed ? <EyeOutlined /> : <LockOutlined />} size="small" onClick={() => handleView(rec)} disabled={!allowed} />
            </Tooltip>
            <Tooltip title={allowed ? "Sửa" : "Khoá - khác tổ chức"}>
              <Button icon={allowed ? <EditOutlined /> : <LockOutlined />} size="small" onClick={() => handleEdit(rec)} disabled={!allowed} />
            </Tooltip>
            <Tooltip title={allowed ? "Xoá" : "Khoá - khác tổ chức"}>
              <Button icon={allowed ? <DeleteOutlined /> : <LockOutlined />} size="small" danger onClick={() => handleDelete(rec.id)} disabled={!allowed} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const expandedRowRender = (rec: Category) => {
    // chỉ cho expand và load course khi cùng tổ chức
    if (!canOperate(rec)) {
      return <div style={{ padding: 16, color: "#999" }}>Danh mục không thuộc tổ chức của bạn.</div>;
    }

    const loadingCourse = !!expLoading[rec.id];
    const courses = coursesByCat[rec.id] || [];

    if (loadingCourse) return <div style={{ padding: 16 }}>Đang tải khoá học…</div>;
    if (!courses.length)
      return (
        <div style={{ padding: 16 }}>
          <Empty description="Chưa có khoá học trong danh mục này" />
        </div>
      );

    return (
      <div className="course-grid-wrap">
        <Row gutter={[16, 16]}>
          {courses.map((c) => (
            <Col key={c.id} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                className="course-card"
                hoverable
                cover={
                  c.imgUrl ? (
                    <img alt={c.courseName} src={c.imgUrl} style={{ height: 140, objectFit: "cover" }} />
                  ) : (
                    <div className="course-card__placeholder">
                      <ReadOutlined style={{ fontSize: 28 }} />
                    </div>
                  )
                }
                actions={[
                  <Tooltip title="Xem chi tiết" key="view"><EyeOutlined /></Tooltip>,
                  <Tooltip title="Quản lý lớp" key="classes"><TeamOutlined /></Tooltip>,
                ]}
              >
                <Card.Meta
                  avatar={<Avatar>{c.instructorFullName?.[0] ?? "C"}</Avatar>}
                  title={<Tooltip title={c.courseName}><span className="line-1">{c.courseName}</span></Tooltip>}
                  description={
                    <div>
                      <div className="line-2" style={{ marginBottom: 8 }}>{c.description || "—"}</div>
                      <Space size={6} wrap>
                        <Tag color={c.isActive ? "green" : "red"}>{c.isActive ? "Hoạt động" : "Ngừng"}</Tag>
                        {typeof c.ratingAverage === "number" && <Tag>{Number(c.ratingAverage).toFixed(1)}★</Tag>}
                        <Tag>{new Date(c.createdAt).toLocaleDateString()}</Tag>
                      </Space>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // GUARD: chưa đăng nhập hoặc không có organizationId
  if (!myOrgId) {
    return (
      <Card>
        <Empty description="Vui lòng đăng nhập tài khoản có organizationId để xem danh mục." />
      </Card>
    );
  }

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><h2>Quản lý Danh mục</h2></Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCreateVisible(true);
              if (workspaces.length) {
                // chỉ pick workspace của org hiện tại
                const firstMyWs = workspaces.find(w => myWsIdSet.has(w.id));
                if (firstMyWs) createForm.setFieldsValue({ workSpaceId: firstMyWs.id });
              }
            }}
          >
            Thêm Danh mục
          </Button>
        </Col>
      </Row>

      <Card>
        <Table<Category>
          rowKey="id"
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandRowByClick: true,
            expandedRowRender,
            onExpand: (expanded, rec) => {
              if (expanded && canOperate(rec)) fetchCoursesOfCategory(rec.id);
            },
            rowExpandable: (rec) => canOperate(rec),
            // DÙNG CHEVRON V DÀY LÀM NÚT SHOW COURSE
            expandIcon: ({ expanded, onExpand, record }) =>
            canOperate(record) ? (
            <button
            type="button"
            className="showmore-btn"
            onClick={(e) => onExpand(record, e)}
            aria-label={expanded ? "Thu gọn khoá học" : "Xem khoá học"}
             aria-expanded={expanded}
            >
            <ShowMoreChevron expanded={expanded} />
             </button>
            ) : (
            <span aria-hidden style={{ display: "inline-block", width: 20 }} />
            ),

          }}
        />
      </Card>

      <Modal title="Tạo danh mục" open={createVisible} onCancel={() => setCreateVisible(false)} footer={null} destroyOnClose>
        <Form form={createForm} layout="vertical" onFinish={onCreate} initialValues={{ isActive: true }}>
          <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="workSpaceId" label="Workspace" rules={[{ required: true, message: "Vui lòng chọn workspace" }]}>
            <Select
              placeholder="Chọn workspace"
              options={workspaces.filter(w => myWsIdSet.has(w.id)).map(w => ({ label: w.workSpaceName, value: w.id }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue>
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
          </Form.Item>

          <Row justify="end" gutter={8}>
            <Col><Button onClick={() => setCreateVisible(false)}>Huỷ</Button></Col>
            <Col><Button type="primary" htmlType="submit">Lưu</Button></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Cập nhật danh mục" open={updateVisible} onCancel={() => setUpdateVisible(false)} footer={null} destroyOnClose>
        <Form form={updateForm} layout="vertical" onFinish={onUpdate} initialValues={{ isActive: true }}>
          <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="workSpaceId" label="Workspace" rules={[{ required: true, message: "Vui lòng chọn workspace" }]}>
            <Select
              placeholder="Chọn workspace"
              options={workspaces.filter(w => myWsIdSet.has(w.id)).map(w => ({ label: w.workSpaceName, value: w.id }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
          </Form.Item>

          <Row justify="end" gutter={8}>
            <Col><Button onClick={() => setUpdateVisible(false)}>Huỷ</Button></Col>
            <Col><Button type="primary" htmlType="submit">Cập nhật</Button></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Xác nhận xoá" open={deleteVisible} onCancel={() => setDeleteVisible(false)} footer={null} destroyOnClose>
        <p>Bạn có chắc chắn muốn xoá danh mục này?</p>
        <Row justify="end" gutter={8}>
          <Col><Button onClick={() => setDeleteVisible(false)}>Huỷ</Button></Col>
          <Col><Button danger type="primary" onClick={onDelete}>Xoá</Button></Col>
        </Row>
      </Modal>

      <Modal title="Chi tiết danh mục" open={viewVisible} onCancel={() => setViewVisible(false)} footer={null} destroyOnClose>
        {viewData ? (
          <div>
            <p><b>ID:</b> {viewData.id}</p>
            <p><b>Tên:</b> {viewData.categoryName}</p>
            <p><b>Workspace:</b> {wsNameMap[getCategoryWorkspaceId(viewData as any) || ""] || "—"}</p>
            <p><b>Trạng thái:</b> {(viewData as any).isActive ? "Hoạt động" : "Ngừng"}</p>
            <p><b>Ngày tạo:</b> {viewData.createdAt ? new Date(viewData.createdAt).toLocaleString() : "—"}</p>
            <p><b>Ngày cập nhật:</b> {viewData.updatedAt ? new Date(viewData.updatedAt).toLocaleString() : "—"}</p>
          </div>
        ) : "Đang tải..."}
      </Modal>
    </>
  );
};

export default CategoryManage;
