import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Card,
  Row,
  Col,
  Input,
  Select,
  Typography,
  List,
  Avatar,
  Tag,
  Tooltip,
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { Workspace } from "../../../types/workspace";
import type { Course } from "../../../types/course";
import type { Organization } from "../../../types/organization";
import type { Account } from "../../../types/account";
import { WorkspaceService } from "../../../services/workspace.service";
import { CourseService } from "../../../services/course.service";
import { OrganizationService } from "../../../services/organization-manager.service";
import { AccountService } from "../../../services/account.service";
import "./workspaceManager.css";

const { Title, Text, Paragraph } = Typography;

/* ===================== Helpers (DEFINITIONS FIRST) ===================== */
function norm(s?: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compareStr(a?: string, b?: string): number {
  return (a || "").localeCompare(b || "", "vi", { sensitivity: "base" });
}

/** Chuẩn hoá ID để so khớp (trim + lowercase) */
function normalizeId(s?: string | null): string {
  return (s ?? "").trim().toLowerCase();
}

/** Giá trị placeholder cần bỏ qua khi hiển thị tên */
function isPlaceholder(s?: string | null): boolean {
  const t = (s ?? "").trim().toLowerCase();
  return !t || t === "string" || t === "null" || t === "undefined";
}

const FALLBACK_COURSE_AVATAR =
  "https://ui-avatars.com/api/?background=random&name=C";

/* ===================== Component ===================== */
const WorkspaceManager: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  // Search + Filters
  const [keyword, setKeyword] = useState<string>("");
  const [orgFilter, setOrgFilter] = useState<string | undefined>(undefined);

  // Per-row “show more” state for course list inside table cell
  const [showAllCoursesCell, setShowAllCoursesCell] = useState<Record<string, boolean>>({});

  /* --------------------- Load all --------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ws, cs, orgs, accs] = await Promise.all([
          WorkspaceService.getAll(),
          CourseService.getAllCourses(),
          OrganizationService.getAll(),
          AccountService.getAllAccounts(),
        ]);
        setWorkspaces(Array.isArray(ws) ? ws : []);
        setCourses(Array.isArray(cs) ? cs : []);
        setOrganizations(Array.isArray(orgs) ? orgs : []);
        setAccounts(Array.isArray(accs) ? accs : []);
      } catch (e) {
        console.error(e);
        message.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* --------------------- Indexes --------------------- */
  const organizationsById = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((o) => map.set(normalizeId(o.id), o));
    return map;
  }, [organizations]);

  const accountsById = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(normalizeId(a.id), a));
    return map;
  }, [accounts]);

  const getOrgName = (id?: string) =>
    (id && organizationsById.get(normalizeId(id))?.organizationName) || id || "N/A";

  /** Lấy tên giảng viên theo instructorId (accountId), bỏ qua placeholder */
  function getInstructorFullName(c: Course): { text: string; id: string } {
    const id = normalizeId(c.instructorId);
    if (id) {
      const acc = accountsById.get(id);
      let name =
        !isPlaceholder(acc?.fullName) ? acc?.fullName :
        !isPlaceholder((acc as any)?.displayName) ? (acc as any)?.displayName :
        "";

      if (!name && !isPlaceholder(acc?.userName)) {
        name = acc!.userName!;
      }

      if (name) return { text: name, id: c.instructorId || "" };
    }

    // Fallback từ payload course.instructor nếu BE có gửi
    const ins = (c as any)?.instructor;
    const nested =
      (!isPlaceholder(ins?.fullName) && ins?.fullName) ||
      (!isPlaceholder(ins?.userName) && ins?.userName) ||
      "";
    return { text: nested || "Unknown", id: c.instructorId || "" };
  }

  const coursesByWorkspaceId = useMemo(() => {
    const map = new Map<string, Course[]>();
    courses.forEach((c) => {
      const k = normalizeId(c.workSpaceId);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return map;
  }, [courses]);

  /* --------------------- Delete --------------------- */
  const handleDelete = (record: Workspace) => {
    setWorkspaceToDelete(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete) return;
    setLoading(true);
    try {
      await WorkspaceService.deleteWorkspace(workspaceToDelete.id);
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceToDelete.id));
      message.success("Workspace deleted successfully.");
    } catch (error: any) {
      console.error("Delete error:", error);
      message.error(error?.message || "Failed to delete workspace.");
    } finally {
      setLoading(false);
      setIsDeleteConfirmVisible(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmVisible(false);
    setWorkspaceToDelete(null);
  };

  const handleView = (record: Workspace) => {
    setSelectedWorkspace(record);
    setIsModalVisible(true);
  };

  /* --------------------- Filter --------------------- */
  const filteredWorkspaces = useMemo(() => {
    const kw = norm(keyword);
    return workspaces.filter((ws) => {
      if (orgFilter && ws.organizationId !== orgFilter) return false;
      if (!kw) return true;

      const courseTexts = (coursesByWorkspaceId.get(normalizeId(ws.id)) || []).flatMap((c) => {
        const ins = getInstructorFullName(c).text;
        return [norm(c.courseName), norm(ins)];
      });

      const fields = [
        norm(ws.workSpaceName),
        norm(ws.description),
        norm(ws.id),
        norm(getOrgName(ws.organizationId)),
        ...courseTexts,
      ];
      return fields.some((x) => x.startsWith(kw) || x.includes(kw));
    });
  }, [workspaces, keyword, orgFilter, coursesByWorkspaceId, organizationsById, accountsById]);

  /* --------------------- Render course list (no overflow) --------------------- */
  const renderCourseList = (list: Course[], opts?: { dense?: boolean }) => {
    if (list.length === 0) return <Text type="secondary">No courses.</Text>;
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
                    <Tag color={c.isActive ? "green" : "red"}>{c.isActive ? "Active" : "Inactive"}</Tag>
                  </div>
                }
                description={
                  <div className="course-desc-wrap">
                    <div className="course-meta-line">
                      <Tooltip title={ins.id ? `Instructor ID: ${ins.id}` : ""}>
                        <span>
                          <b>Instructor:</b> {ins.text}
                        </span>
                      </Tooltip>
                      <span>
                        <b>Created:</b>{" "}
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

  /* --------------------- Columns --------------------- */
  const columns: ColumnsType<Workspace> = [
    { title: "ID", dataIndex: "id", key: "id", ellipsis: true, width: 240, sorter: (a, b) => compareStr(a.id, b.id) },
    {
      title: "Workspace Name",
      dataIndex: "workSpaceName",
      key: "workSpaceName",
      ellipsis: true,
      width: 220,
      sorter: (a, b) => compareStr(a.workSpaceName, b.workSpaceName),
    },
    { title: "Order ID", dataIndex: "orderId", key: "orderId", ellipsis: true, width: 160 },
    {
      title: "Organization",
      dataIndex: "organizationId",
      key: "organizationId",
      ellipsis: true,
      width: 220,
      render: (id: string) => getOrgName(id),
      sorter: (a, b) => compareStr(getOrgName(a.organizationId), getOrgName(b.organizationId)),
    },
    {
      title: "Accounts",
      dataIndex: "numberOfAccount",
      key: "numberOfAccount",
      width: 110,
      sorter: (a, b) => (a.numberOfAccount || 0) - (b.numberOfAccount || 0),
    },
    {
      title: "Courses",
      key: "courses",
      width: 460,
      render: (_: any, record: Workspace) => {
        const key = normalizeId(record.id);
        const fullList = coursesByWorkspaceId.get(key) || [];
        const expanded = !!showAllCoursesCell[key];
        const displayList = expanded ? fullList : fullList.slice(0, 3);
        const count = fullList.length;

        return (
          <div>
            <Text strong>{count}</Text> {count === 1 ? "course" : "courses"}
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
                  {expanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Image URL",
      dataIndex: "imgUrl",
      key: "imgUrl",
      width: 120,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "N/A"
        ),
    },
    { title: "Description", dataIndex: "description", key: "description", ellipsis: true, width: 260 },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      render: (isActive: boolean) => (isActive ? "Yes" : "No"),
      sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (text: string) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) =>
        (a.createdAt ? Date.parse(a.createdAt) : 0) - (b.createdAt ? Date.parse(b.createdAt) : 0),
      defaultSortOrder: "descend",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (text: string | null) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) =>
        (a.updatedAt ? Date.parse(a.updatedAt) : 0) - (b.updatedAt ? Date.parse(b.updatedAt) : 0),
    },
    {
      title: "Deleted At",
      dataIndex: "deleteAt",
      key: "deleteAt",
      width: 160,
      render: (text: string | null) => (text ? new Date(text).toLocaleDateString() : "N/A"),
      sorter: (a, b) =>
        (a.deleteAt ? Date.parse(a.deleteAt) : 0) - (b.deleteAt ? Date.parse(b.deleteAt) : 0),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_: any, record: Workspace) => (
        <div>
          <Button style={{ marginRight: 8 }} onClick={() => handleView(record)}>
            View
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onTableChange: TableProps<Workspace>["onChange"] = () => {};

  return (
    <div>
      <Title level={2} style={{ marginBottom: 12 }}>Workspace Manager</Title>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12} lg={10}>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name, description, ID, organization, course, or instructor"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              allowClear
              showSearch
              value={orgFilter}
              onChange={(v) => setOrgFilter(v)}
              style={{ width: "100%" }}
              placeholder="Filter by Organization"
              optionFilterProp="label"
              options={organizations.map((org) => ({
                label: org.organizationName,
                value: org.id,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <Button onClick={() => { setKeyword(""); setOrgFilter(undefined); }}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      <Table<Workspace>
        className="workspace-table"
        bordered
        size="middle"
        tableLayout="fixed"
        columns={columns}
        dataSource={filteredWorkspaces}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 2000 }}
        onChange={onTableChange}
        rowClassName={(_, idx) => (idx % 2 === 0 ? "row-striped" : "row-normal")}
      />

      <Modal
        title="Workspace Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {selectedWorkspace && (
          <div>
            <p><strong>ID:</strong> {selectedWorkspace.id}</p>
            <p><strong>Workspace Name:</strong> {selectedWorkspace.workSpaceName}</p>
            <p><strong>Order ID:</strong> {selectedWorkspace.orderId || "N/A"}</p>
            <p><strong>Organization:</strong> {getOrgName(selectedWorkspace.organizationId)}</p>
            <p><strong>Number of Accounts:</strong> {selectedWorkspace.numberOfAccount}</p>
            <p>
              <strong>Image URL:</strong>{" "}
              {selectedWorkspace.imgUrl ? (
                <a href={selectedWorkspace.imgUrl} target="_blank" rel="noopener noreferrer">View</a>
              ) : ("N/A")}
            </p>
            <p><strong>Description:</strong> {selectedWorkspace.description}</p>
            <p><strong>Active:</strong> {selectedWorkspace.isActive ? "Yes" : "No"}</p>
            <p><strong>Created At:</strong> {new Date(selectedWorkspace.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> {selectedWorkspace.updatedAt ? new Date(selectedWorkspace.updatedAt).toLocaleDateString() : "N/A"}</p>
            <p><strong>Deleted At:</strong> {selectedWorkspace.deleteAt ? new Date(selectedWorkspace.deleteAt).toLocaleDateString() : "N/A"}</p>

            <div style={{ marginTop: 16 }}>
              <Text strong>Courses in this workspace:</Text>
              <div style={{ marginTop: 8 }}>
                {renderCourseList(coursesByWorkspaceId.get(normalizeId(selectedWorkspace.id)) || [])}
              </div>
            </div>

            <Button style={{ marginTop: 16 }} onClick={() => setIsModalVisible(false)}>Close</Button>
          </div>
        )}
      </Modal>

      <Modal
        title="Confirm Delete Workspace"
        open={isDeleteConfirmVisible}
        onOk={handleConfirmDelete}
        okText="Yes, delete"
        okButtonProps={{ danger: true, loading }}
        onCancel={handleCancelDelete}
        cancelText="Cancel"
        maskClosable={false}
        closable={!loading}
        destroyOnHidden
      >
        {workspaceToDelete && (
          <div>
            <p><b>Are you sure you want to permanently delete this workspace?</b></p>
            <p>
              <strong>Name:</strong> {workspaceToDelete.workSpaceName}<br/>
              <strong>ID:</strong> {workspaceToDelete.id}<br/>
              <strong>Number of Accounts:</strong> {workspaceToDelete.numberOfAccount}
            </p>
            <p style={{ color: "red" }}>
              This action <b>cannot be undone</b>. All related data will be permanently removed from the database.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkspaceManager;
