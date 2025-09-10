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
      toast.error("Lỗi tải dữ liệu đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndCourses = async () => {
    try {
      const [userList, courseList] = await Promise.all([
        AccountService.getAllAccounts?.(),
        CourseService.getAllCourses(),
      ]);
      setUsers(userList || []);
      setCourses(courseList || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách người dùng/khóa học");
    }
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
        toast.success("Cập nhật đánh giá thành công!");
      } else {
        await ReviewService.createReview(values);
        toast.success("Tạo đánh giá thành công!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      toast.error("Lưu đánh giá thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa đánh giá này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
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
      title: "Nội dung đánh giá",
      dataIndex: "description",
    },
    {
      title: "Xếp hạng",
      dataIndex: "rating",
      render: (val: number) => <Rate disabled defaultValue={val} />,
    },
    {
      title: "Thao tác",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
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
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Người dùng"
            name="accountId"
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
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
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
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
            <Input.TextArea rows={3} placeholder="Nhập nội dung đánh giá..." />
          </Form.Item>

          <Form.Item
            label="Xếp hạng"
            name="rating"
            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
          >
            <Rate allowHalf />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewManagement;
