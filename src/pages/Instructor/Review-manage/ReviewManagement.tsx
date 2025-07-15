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
      toast.error("Lỗi khi lấy dữ liệu review");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndCourses = async () => {
    const [userList, courseList] = await Promise.all([
      AccountService.getAllAccount?.(),
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
        toast.success("Cập nhật review thành công!");
      } else {
        await ReviewService.createReview(values);
        toast.success("Tạo review thành công!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi lưu review");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa review này?",
      onOk: async () => {
        try {
          await ReviewService.deleteReview(id);
          toast.success("Xóa thành công!");
          fetchData();
        } catch {
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Người đánh giá",
      dataIndex: ["account", "fullName"],
    },
    {
      title: "Khóa học",
      dataIndex: ["course", "courseName"],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      render: (val: number) => <Rate disabled defaultValue={val} />,
    },
    {
      title: "Hành động",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Sửa">
            <EditOutlined onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
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
        <h2>Quản lý đánh giá</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm đánh giá
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
        title={isEditing ? "Cập nhật đánh giá" : "Tạo đánh giá"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Người dùng"
            name="accountId"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select placeholder="Chọn người dùng">
              {users.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Khóa học"
            name="courseId"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course: any) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.courseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nội dung đánh giá"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Số sao"
            name="rating"
            rules={[{ required: true, message: "Vui lòng chọn sao" }]}
          >
            <Rate allowHalf />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewManagement;
