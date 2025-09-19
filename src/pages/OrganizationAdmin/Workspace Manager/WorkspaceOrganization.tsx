import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Card,
  InputNumber,
  message,
  Tag,
  Space,
  List,
  Avatar,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Workspace, WorkspaceForm } from "../../../types/workspace";
import type { Course } from "../../../types/course";
import type { Account } from "../../../types/account";
import UploadCloudinary from "../../UploadFile/UploadCloudinary";
import { showErrorMessage } from "../../../utils/errorHandler";
import { WorkspaceService } from "../../../services/workspace.service";
import { CourseService } from "../../../services/course.service";
import { AccountService } from "../../../services/account.service";
import "./workspaceOrganization.css";

const { Paragraph, Text } = Typography;

/* ===== Helpers ===== */
const norm = (s?: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalizeId = (s?: string | null) => (s ? s.trim().toLowerCase() : "");
const compareStr = (a?: string, b?: string) =>
  (a || "").localeCompare(b || "", "vi", { sensitivity: "base" });
const isPlaceholder = (s?: string | null) => {
  const t = (s || "").trim().toLowerCase();
  return !t || t === "string" || t === "null" || t === "undefined";
};
const FALLBACK_COURSE_AVATAR =
  "https://ui-avatars.com/api/?background=random&name=C";

const getOrgId = (): string => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw)?.organizationId || "" : "";
  } catch {
    return "";
  }
};

const WorkspaceOrganization: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);

  const [selected, setSelected] = useState<Workspace | null>(null);
  const [viewData, setViewData] = useState<Workspace | null>(null);

  const [imgUrlCreate, setImgUrlCreate] = useState<string>("");
  const [imgUrlUpdate, setImgUrlUpdate] = useState<string>("");
  const [imgFileCreate, setImgFileCreate] = useState<File | null>(null);
  const [imgFileUpdate, setImgFileUpdate] = useState<File | null>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter] = useState<string | null>(null);

  // per-row “show more” state (by workspace id)
  const [showAllCoursesCell, setShowAllCoursesCell] = useState<Record<string, boolean>>({});

  const organizationId = getOrgId();

  useEffect(() => {
    if (!organizationId) {
      message.error("Thiếu mã tổ chức.");
      return;
    }
    fetchAll();
  }, [organizationId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ws, cs, accs] = await Promise.all([
        WorkspaceService.getAllByOrg(organizationId),
        CourseService.getCourseByOrgId(organizationId), // chỉ các khóa học của org này
        AccountService.getAllAccounts(), // để map instructorId -> fullName
      ]);
      setWorkspaces(Array.isArray(ws) ? ws : []);
      setCourses(Array.isArray(cs) ? cs : []);
      setAccounts(Array.isArray(accs) ? accs : []);
    } catch (err) {
      showErrorMessage(err, "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchList = async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const items = await WorkspaceService.getAllByOrg(organizationId);
      setWorkspaces(items);

      // refresh danh sách khóa học để luôn đúng
      const cs = await CourseService.getCourseByOrgId(organizationId);
      setCourses(Array.isArray(cs) ? cs : []);
    } catch (err) {
      showErrorMessage(err, "Không thể tải danh sách không gian.");
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  };

  /* ===== Index & helpers ===== */
  const accountsById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(normalizeId(a.id), a));
    return map;
  }, [accounts]);

  const coursesByWorkspaceId = useMemo(() => {
    const map = new Map<string, Course[]>();
    courses.forEach((c) => {
      const k = normalizeId(c.workSpaceId);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return map;
  }, [courses]);

  const getInstructorFullName = (c: Course) => {
    const id = normalizeId(c.instructorId);
    if (id) {
      const acc = accountsById.get(id);
      const name =
        (!isPlaceholder(acc?.fullName) && acc?.fullName) ||
        (!isPlaceholder(acc?.userName) && acc?.userName) ||
        "";
      if (name) return { text: name, id: c.instructorId || "" };
    }
    const nested =
      (c as any)?.instructor?.fullName ||
      (c as any)?.instructor?.userName ||
      "";
    return { text: nested || "Không rõ", id: c.instructorId || "" };
  };

  /* ===== Search / Filter ===== */
  const filteredData = useMemo(() => {
    const kw = norm(searchText);
    return workspaces
      .filter((ws) => {
        if (statusFilter === null) return true;
        return statusFilter === "active" ? ws.isActive : !ws.isActive;
      })
      .filter((ws) => {
        if (!kw) return true;

        const list = coursesByWorkspaceId.get(normalizeId(ws.id)) || [];
        const courseTexts = list.flatMap((c) => {
          const ins = getInstructorFullName(c).text;
          return [norm(c.courseName), norm(ins)];
        });

        const fields = [
          norm(ws.workSpaceName),
          norm(ws.description),
          norm(ws.id),
          ...courseTexts,
        ];
        return fields.some((x) => x.startsWith(kw) || x.includes(kw));
      });
  }, [workspaces, coursesByWorkspaceId, searchText, statusFilter, accountsById]);

  /* ===== CRUD ===== */
  const onCreate = async (vals: any) => {
    if (!organizationId) {
      message.error("Vui lòng đăng nhập.");
      return;
    }
    if (!imgUrlCreate && !imgFileCreate) {
      message.error("Vui lòng tải ảnh lên trước khi lưu.");
      return;
    }
    if (!vals.workSpaceName?.trim() || !vals.description?.trim()) {
      message.error("Tên không gian và mô tả là bắt buộc.");
      return;
    }

    setLoading(true);
    try {
      const payload: WorkspaceForm = {
        organizationId,
        workSpaceName: vals.workSpaceName.trim(),
        numberOfAccount: Number.isFinite(vals.numberOfAccount)
          ? Number(vals.numberOfAccount)
          : 0,
        imgUrl: imgUrlCreate,
        description: vals.description.trim(),
        isActive: true,
      };

      await WorkspaceService.createWorkspace(payload, {
        imgFile: imgFileCreate || undefined,
      });
      await fetchList({ silent: true });

      message.success("Tạo không gian làm việc thành công.");
      setCreateVisible(false);
      createForm.resetFields();
      setImgUrlCreate("");
      setImgFileCreate(null);
    } catch (err) {
      showErrorMessage(err, "Tạo không gian thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (vals: any) => {
    if (!selected) return;

    setLoading(true);
    try {
      const body: Partial<WorkspaceForm> = {
        organizationId: selected.organizationId,
      };
      if (vals.workSpaceName?.trim())
        body.workSpaceName = vals.workSpaceName.trim();
      if (Number.isFinite(vals.numberOfAccount))
        body.numberOfAccount = Number(vals.numberOfAccount);
      if (vals.description?.trim()) body.description = vals.description.trim();
      if (imgUrlUpdate && imgUrlUpdate !== selected.imgUrl) body.imgUrl = imgUrlUpdate;

      await WorkspaceService.updateWorkspace(selected.id, body, {
        imgFile: imgFileUpdate || undefined,
      });
      await fetchList({ silent: true });

      message.success("Cập nhật không gian làm việc thành công.");
      setUpdateVisible(false);
      updateForm.resetFields();
      setImgUrlUpdate("");
      setImgFileUpdate(null);
      setSelected(null);
    } catch (err) {
      showErrorMessage(err, "Cập nhật không gian thất bại.");
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = (id: string) => {
    console.log("handleDelete called with id:", id);
    setDeleteId(id);
    setDeleteVisible(true);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await WorkspaceService.deleteWorkspace(deleteId);
      await fetchList({ silent: true });
      message.success("Xoá không gian thành công.");
      setDeleteVisible(false);
      setDeleteId(null);
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data || err.message || err);
      message.error("Xoá không gian thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (rec: Workspace) => {
    try {
      setLoading(true);
      const data = await WorkspaceService.getWorkspaceById(rec.id);
      setViewData(data);
      setViewVisible(true);
    } catch (err) {
      showErrorMessage(err, "Không thể tải chi tiết không gian.");
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
    setImgUrlUpdate(rec.imgUrl || "");
    setImgFileUpdate(null);
    setUpdateVisible(true);
  };

  /* ===== Course list renderer (anti-overflow) ===== */
  const renderCourseList = (list: Course[], opts?: { dense?: boolean }) => {
    if (list.length === 0) return <Text type="secondary">Không có khóa học.</Text>;
    return (
      <List
        className="course-list"
        size={opts?.dense ? "small" : "default"}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(c) => {
          const ins = getInstructorFullName(c);
          const avatarSrc = (c.imgUrl || "").trim() ? c.imgUrl : FALLBACK_COURSE_AVATAR;
          return (
            <List.Item key={c.id} className="course-list-item">
              <List.Item.Meta
                avatar={<Avatar src={avatarSrc} shape="square" />}
                title={
                  <div className="course-title-row">
                    <Text className="course-title" ellipsis={{ tooltip: c.courseName }}>
                      {c.courseName}
                    </Text>
                    {typeof c.ratingAverage === "number" && <Tag>{c.ratingAverage.toFixed(1)}</Tag>}
                    <Tag color={c.isActive ? "green" : "red"}>
                      {c.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </Tag>
                  </div>
                }
                description={
                  <div className="course-desc-wrap">
                    <div className="course-meta-line">
                      <Tooltip title={ins.id ? `Mã giảng viên: ${ins.id}` : ""}>
                        <span>
                          <b>Giảng viên:</b> {ins.text}
                        </span>
                      </Tooltip>
                      <span>
                        <b>Ngày tạo:</b>{" "}
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {c.description && (
                      <Paragraph className="course-desc" ellipsis={{ rows: 2, tooltip: c.description }}>
                        {c.description}
                      </Paragraph>
                    )}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  /* ===== Columns ===== */
  const columns: ColumnsType<Workspace> = [
    { title: "ID", dataIndex: "id", key: "id", width: 220, ellipsis: true, sorter: (a, b) => compareStr(a.id, b.id) },
    {
      title: "Hình ảnh",
      dataIndex: "imgUrl",
      key: "imgUrl",
      align: "center",
      width: 110,
      render: (url: string) =>
        url ? (
          <img
            src={url}
            alt=""
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #eee",
            }}
          />
        ) : (
          "—"
        ),
    },
    {
      title: "Tên",
      dataIndex: "workSpaceName",
      key: "workSpaceName",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => compareStr(a.workSpaceName, b.workSpaceName),
    },
    {
      title: "Tài khoản",
      dataIndex: "numberOfAccount",
      key: "numberOfAccount",
      align: "center",
      width: 120,
      sorter: (a, b) => (a.numberOfAccount || 0) - (b.numberOfAccount || 0),
    },
    {
      title: "Khóa học",
      key: "courses",
      width: 460,
      render: (_: any, rec: Workspace) => {
        const key = normalizeId(rec.id);
        const fullList = coursesByWorkspaceId.get(key) || [];
        const expanded = !!showAllCoursesCell[key];
        const displayList = expanded ? fullList : fullList.slice(0, 3);
        const count = fullList.length;

        return (
          <div>
            <Text strong>{count}</Text> {count === 1 ? "khóa học" : "khóa học"}
            <div style={{ marginTop: 6 }}>
              {renderCourseList(displayList, { dense: true })}
              {count > 3 && (
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    setShowAllCoursesCell((prev) => ({ ...prev, [key]: !expanded }))
                  }
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 240,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 120,
      filters: [
        { text: "Đang hoạt động", value: "active" },
        { text: "Ngừng hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) =>
        value === "active" ? record.isActive : !record.isActive,
      render: (v: boolean) =>
        v ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>,
      sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 270,
      align: "center",
      render: (_, rec) => (
        <Space wrap>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(rec)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(rec)}>
            Sửa
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(rec.id)}>
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            placeholder="Tìm theo tên / mô tả / khóa học / giảng viên"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 360 }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
            disabled={!organizationId}
          >
            Tạo không gian làm việc
          </Button>
        </Col>
      </Row>

      <Card>
        <Table<Workspace>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading || refreshing}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* CREATE */}
      <Modal
        title="Tạo không gian làm việc"
        open={createVisible}
        footer={null}
        onCancel={() => {
          setCreateVisible(false);
          createForm.resetFields();
          setImgUrlCreate("");
          setImgFileCreate(null);
        }}
        destroyOnHidden
        width={520}
      >
        <Form form={createForm} layout="vertical" onFinish={onCreate}>
          <Form.Item
            name="workSpaceName"
            label="Tên không gian"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="VD: Phòng thí nghiệm Logistics" />
          </Form.Item>
          <Form.Item
            name="numberOfAccount"
            label="Số tài khoản"
            rules={[{ type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Ảnh (Cloudinary)" required>
            <UploadCloudinary
              value={imgUrlCreate}
              onChange={setImgUrlCreate}
              onFileChange={setImgFileCreate}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả ngắn…" />
          </Form.Item>
          <Row justify="end" gutter={8}>
            <Col>
              <Button
                onClick={() => {
                  setCreateVisible(false);
                  createForm.resetFields();
                  setImgUrlCreate("");
                  setImgFileCreate(null);
                }}
              >
                Huỷ
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* UPDATE */}
      <Modal
        title="Cập nhật không gian làm việc"
        open={updateVisible}
        footer={null}
        onCancel={() => {
          setUpdateVisible(false);
          updateForm.resetFields();
          setImgUrlUpdate("");
          setImgFileUpdate(null);
          setSelected(null);
        }}
        destroyOnHidden
        width={520}
      >
        <Form form={updateForm} layout="vertical" onFinish={onUpdate}>
          <Form.Item name="workSpaceName" label="Tên không gian">
            <Input placeholder="(không bắt buộc)" />
          </Form.Item>
          <Form.Item
            name="numberOfAccount"
            label="Số tài khoản"
            rules={[{ type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Ảnh (Cloudinary)">
            <UploadCloudinary
              value={imgUrlUpdate}
              onChange={setImgUrlUpdate}
              onFileChange={setImgFileUpdate}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="(không bắt buộc)" />
          </Form.Item>
          <Row justify="end" gutter={8}>
            <Col>
              <Button
                onClick={() => {
                  setUpdateVisible(false);
                  updateForm.resetFields();
                  setImgUrlUpdate("");
                  setImgFileUpdate(null);
                  setSelected(null);
                }}
              >
                Huỷ
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
  title="Xoá không gian làm việc"
  open={deleteVisible}
  onCancel={() => {
    setDeleteVisible(false);
    setDeleteId(null);
  }}
  footer={null}
  destroyOnHidden
  width={400}
>
  <p>Bạn có chắc chắn muốn xoá không gian này? Hành động này không thể hoàn tác.</p>
  <Row justify="end" gutter={8}>
    <Col>
      <Button
        onClick={() => {
          setDeleteVisible(false);
          setDeleteId(null);
        }}
      >
        Huỷ
      </Button>
    </Col>
    <Col>
      <Button
        type="primary"
        danger
        loading={loading}
        onClick={onDelete}
      >
        Xoá
      </Button>
    </Col>
  </Row>
</Modal>

      {/* VIEW */}
      <Modal
        title="Chi tiết không gian"
        open={viewVisible}
        footer={null}
        onCancel={() => {
          setViewVisible(false);
          setViewData(null);
        }}
        destroyOnHidden
        width={700}
      >
        {viewData ? (
          <div>
            <p><strong>ID:</strong> {viewData.id}</p>
            <p><strong>Tên:</strong> {viewData.workSpaceName}</p>
            <p><strong>Mô tả:</strong> {viewData.description}</p>
            <p><strong>Số tài khoản:</strong> {viewData.numberOfAccount}</p>
            <p><strong>Trạng thái:</strong> {viewData.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</p>
            {viewData.imgUrl && (
              <img
                src={viewData.imgUrl}
                alt=""
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }}
              />
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong>Khóa học trong không gian này:</Text>
              <div style={{ marginTop: 8 }}>
                {renderCourseList(coursesByWorkspaceId.get(normalizeId(viewData.id)) || [])}
              </div>
            </div>
          </div>
        ) : (
          <p>Đang tải…</p>
        )}
      </Modal>
    </>
  );
};

export default WorkspaceOrganization;
