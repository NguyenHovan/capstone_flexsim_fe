import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Select,
  Upload,
  type UploadFile,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CourseService } from "../../../services/course.service";
import dayjs from "dayjs";
import { toast } from "sonner";
import { CategoryService } from "../../../services/category.service";
import { WorkspaceService } from "../../../services/workspace.service";
import type { Workspace } from "../../../types/workspace";
import type { Category } from "../../../types/category";

const CourseManagement = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, wsRes] = await Promise.all([
          CategoryService.getCategories(),
          WorkspaceService.getAll(),
        ]);
        console.log("Category Response:", catRes); // Debug
        console.log("Workspace Response:", wsRes); // Debug
        setCategories(Array.isArray(catRes) ? catRes : []);
        setWorkspaces(Array.isArray(wsRes) ? wsRes : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  console.log({ categories, workspaces });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      setDataSource(data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setSelectedCourseId(record.id);
    form.setFieldsValue({
      ...record,
      categoryId: record.category?.id,
      workSpaceId: record.workSpaceId,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa khóa học này?",
      onOk: async () => {
        try {
          await CourseService.deleteCourse(id);
          toast.success("Xóa thành công!");
          fetchCourses();
        } catch (error) {
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Lấy file image (nếu có)
      const file = values.imgUrl?.[0]?.originFileObj || null;
      const formData = new FormData();
      formData.append("courseName", values.courseName);
      formData.append("description", values.description);
      formData.append("categoryId", values.categoryId);
      formData.append("workSpaceId", values.workSpaceId);
      formData.append("ratingAverage", values.ratingAverage || 0);
      if (file) {
        formData.append("imgUrl", file);
      }

      if (isEditing && selectedCourseId) {
        await CourseService.updateCourse(selectedCourseId, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await CourseService.createCourse(formData);
        toast.success("Tạo mới thành công!");
      }

      setIsModalVisible(false);
      fetchCourses();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra!");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Course Name",
      dataIndex: "courseName",
    },
    {
      title: "Category",
      dataIndex: ["category", "categoryName"],
    },
    {
      title: "Workspace",
      dataIndex: "workSpaceId",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (val) => (val ? "active" : "inactive"),
    },
    {
      title: "Create At",
      dataIndex: "createdAt",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    {
      title: "Update At",
      dataIndex: "updatedAt",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="course-management-wrapper">
      <div className="header-section">
        <Input.Search placeholder="Search course" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add new Course
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 6 }}
        rowKey="id"
        loading={loading}
        bordered
      />

      <Modal
        title={isEditing ? "Update Course" : "Create Course"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Update" : "Create new"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[{ required: true, message: "Require field course name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Require field description" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select placeholder="Chọn category">
              {categories.map((cat: Category) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Workspace"
            name="workSpaceId"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select placeholder="Chọn workspace">
              {workspaces.map((ws: Workspace) => (
                <Select.Option key={ws.id} value={ws.id}>
                  {ws.workSpaceName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Rating" name="ratingAverage">
            <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Image"
            name="imgUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload
              beforeUpload={() => false} // ngăn upload tự động
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              maxCount={1}
            >
              <Button>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
