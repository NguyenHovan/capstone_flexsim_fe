import { useEffect, useState } from "react";
import {
  Input,
  Button,
  Modal,
  Form,
  Select,
  Upload,
  type UploadFile,
  Row,
  Col,
  Typography,
  Flex,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CourseService } from "../../../services/course.service";
import { toast } from "sonner";
import { CategoryService } from "../../../services/category.service";
import { WorkspaceService } from "../../../services/workspace.service";
import type { Workspace } from "../../../types/workspace";
import type { Category } from "../../../types/category";
import CardCourse from "./components/CardCourse";
import { useNavigate } from "react-router-dom";

const CourseManagement = () => {
  const navigate = useNavigate();

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
    const fetchCategories = async () => {
      try {
        const catRes = await CategoryService.getCategories();
        setCategories(Array.isArray(catRes) ? catRes : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    const fetchWorkspaces = async () => {
      try {
        const wsRes = await WorkspaceService.getAll();
        setWorkspaces(Array.isArray(wsRes) ? wsRes : []);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        setWorkspaces([]);
      }
    };

    fetchCategories();
    fetchWorkspaces();
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getCourseByInstructorId();
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

  // Add new
  const handleAdd = () => {
    form.resetFields();
    setFileList([]);
    setIsEditing(false);
    setSelectedCourseId(null);
    setIsModalVisible(true);
  };

  // Edit
  // const handleEdit = (record: any) => {
  //   setIsEditing(true);
  //   setSelectedCourseId(record.id);

  //   if (record.imgUrl) {
  //     setFileList([
  //       {
  //         uid: "-1",
  //         name: "current-image",
  //         status: "done",
  //         url: record.imgUrl,
  //       },
  //     ]);
  //   } else {
  //     setFileList([]);
  //   }

  //   form.setFieldsValue({
  //     courseName: record.courseName,
  //     description: record.description,
  //     categoryId: record.category?.id || record.categoryId,
  //     workSpaceId: record.workSpaceId,
  //     ratingAverage: record.ratingAverage,
  //   });

  //   setIsModalVisible(true);
  // };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await CourseService.deleteCourse(id);
      toast.success("Xóa thành công!");
      fetchCourses();
    } catch (error) {
      toast.error("Xóa thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let userId: string | undefined;

    const currentUserString = localStorage.getItem("currentUser");
    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      userId = currentUser.id;
    }

    if (!userId) {
      console.error("User ID not found!");
      return;
    }
    try {
      setLoading(true);
      const values = await form.validateFields();

      let imgToSend: File | null = null;

      if (values.imgUrl?.[0]?.originFileObj) {
        imgToSend = values.imgUrl[0].originFileObj;
      } else if (isEditing && selectedCourseId) {
        const currentCourse = dataSource.find((c) => c.id === selectedCourseId);
        if (currentCourse?.imgUrl) {
          const response = await fetch(currentCourse.imgUrl);
          const blob = await response.blob();
          imgToSend = new File([blob], "old-image.jpg", { type: blob.type });
        }
      }

      const formData = new FormData();
      formData.append("courseName", values.courseName);
      formData.append("instructorId", userId);
      formData.append("description", values.description);
      formData.append("categoryId", String(values.categoryId));
      formData.append("workSpaceId", String(values.workSpaceId));
      formData.append("ratingAverage", String(0));
      if (imgToSend) {
        formData.append("imgUrl", imgToSend);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={[12, 12]}>
      <Col span={24}>
        <Flex justify="space-between">
          <Typography style={{ fontSize: "30px", fontWeight: "bold" }}>
            My Course
          </Typography>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add new Course
          </Button>
        </Flex>
      </Col>
      {dataSource?.map((course: any) => (
        <Col
          span={6}
          onClick={() => navigate(`/instructor-course/detail/${course.id}`)}
        >
          <CardCourse
            author=""
            coverUrl={course.imgUrl}
            title={course.courseName}
            rating={course.ratingAverage}
            onEdit={() => {}}
            onDelete={() => handleDelete(course.id)}
          />
        </Col>
      ))}
      <Modal
        title={isEditing ? "Update Course" : "Create Course"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Update" : "Create new"}
        confirmLoading={loading}
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
          {/* <Form.Item label="Rating" name="ratingAverage">
            <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
          </Form.Item> */}
          <Form.Item
            label="Image"
            name="imgUrl"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              maxCount={1}
              listType="picture"
            >
              <Button>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default CourseManagement;
