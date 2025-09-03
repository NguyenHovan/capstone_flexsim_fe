import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Rate,
  Select,
  Tooltip,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { CourseService } from "../../../services/course.service";
import { ReviewService } from "../../../services/review.service";
import { AccountService } from "../../../services/account.service";

const ReviewManagement = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchUsersAndCourses();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ReviewService.getAllReviews();
      setData(res);
    } catch (err) {
      toast.error("Error when fetch review data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndCourses = async () => {
    const [userList, courseList] = await Promise.all([
      AccountService.getAllAccounts?.(),
      CourseService.getAllCourses(),
    ]);
    setUsers(userList || []);
    setCourses(courseList || []);
  };

  const openModal = (record?: any) => {
    if (record) {
      setIsEditing(true);
      setSelectedId(record.id);
      form.setFieldsValue({
        accountId: record.account?.id,
        courseId: record.course?.id,
        description: record.description,
        rating: record.rating,
      });
    } else {
      setIsEditing(false);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && selectedId) {
        await ReviewService.updateReview(selectedId, values);
        toast.success("Review updated successfully!");
      } else {
        await ReviewService.createReview(values);
        toast.success("Review created successfully!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      toast.error("Error saving review");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this review?",
      onOk: async () => {
        try {
          await ReviewService.deleteReview(id);
          toast.success("Deleted successfully!");
          fetchData();
        } catch {
          toast.error("Delete failed!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Reviewer",
      dataIndex: ["account", "fullName"],
    },
    {
      title: "Course",
      dataIndex: ["course", "courseName"],
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (val: number) => <Rate disabled defaultValue={val} />,
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit">
            <EditOutlined onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              style={{ color: "red" }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>Review Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add new review
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
      />

      <Modal
        title={isEditing ? "Update review" : "Create review"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Edit" : "Create new review"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="User"
            name="accountId"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select placeholder="Select user">
              {users.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Course"
            name="courseId"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select placeholder="Select Course">
              {courses.map((course: any) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.courseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Review content"
            name="description"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: "Olease select rating" }]}
          >
            <Rate allowHalf />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewManagement;
