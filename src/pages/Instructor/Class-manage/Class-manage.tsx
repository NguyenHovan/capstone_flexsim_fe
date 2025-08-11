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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { ClassService } from "../../../services/class.service";
import { CourseService } from "../../../services/course.service";

const ClassManagement = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await ClassService.getAll();
      setDataSource(data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const res = await CourseService.getAllCourses();
    setCourses(res || []);
  };

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setSelectedClassId(record.id);
    form.setFieldsValue({
      ...record,
      courseId: record.course?.id,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa lớp học này?",
      onOk: async () => {
        try {
          await ClassService.delete(id);
          toast.success("Xóa thành công!");
          fetchClasses();
        } catch {
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && selectedClassId) {
        await ClassService.update(selectedClassId, values);
        toast.success("Cập nhật lớp học thành công!");
      } else {
        await ClassService.create(values);
        toast.success("Tạo lớp học thành công!");
      }
      setIsModalVisible(false);
      fetchClasses();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Class Name",
      dataIndex: "className",
    },
    {
      title: "Course",
      dataIndex: ["course", "courseName"],
    },
    {
      title: "Số lượng học viên",
      dataIndex: "numberOfStudent",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
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
    <div>
      <div className="header-section">
        <Input.Search placeholder="Search class" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm lớp học
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
        title={isEditing ? "Cập nhật lớp học" : "Tạo lớp học"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên lớp học"
            name="className"
            rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số lượng học viên"
            name="numberOfStudent"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Khóa học"
            name="courseId"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.courseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManagement;
