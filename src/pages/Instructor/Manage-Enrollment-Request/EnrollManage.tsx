import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { EnrollmentRequestService } from "../../../services/enrollment-request.service";

const EnrollManage = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnroll, setEditingEnroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enrolls, setEnrolls] = useState([]);

  const statusMap = {
    0: { text: "Pending", color: "orange" },
    1: { text: "Accepted", color: "green" },
    2: { text: "Rejected", color: "red" },
  };

  const fetchEnrolls = async () => {
    setLoading(true);
    try {
      const data = await EnrollmentRequestService.getEnrolmentRequest();
      setEnrolls(data || []);
    } catch (error) {
      message.error("Không thể tải danh sách enroll");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrolls();
  }, []);

  const handleAccept = async (id) => {
    try {
      await EnrollmentRequestService.acceptEnrollmentRequest(id);
      message.success("Chấp nhận enroll thành công");
      fetchEnrolls();
    } catch (error) {
      message.error("Không thể chấp nhận enroll");
    }
  };

  const handleDelete = async (id) => {
    try {
      await EnrollmentRequestService.deleteEnrollmentRequest(id);
      message.success("Xóa enroll thành công");
      fetchEnrolls();
    } catch (error) {
      message.error("Không thể xóa enroll");
    }
  };

  const handleUpdate = (values) => {
    message.info(
      `Update enroll id: ${editingEnroll.id} với status: ${values.status} (demo)`
    );
    setIsModalOpen(false);
  };

  const openUpdateModal = (record) => {
    setEditingEnroll(record);
    form.setFieldsValue({ status: record.status });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: ["account", "fullName"],
    },
    {
      title: "Email",
      dataIndex: ["account", "email"],
    },
    {
      title: "Phone",
      dataIndex: ["account", "phone"],
    },
    {
      title: "Course",
      dataIndex: ["course", "courseName"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.text || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleAccept(record.id)}
            disabled={record.status === 1}
          >
            Accept
          </Button>
          {/* <Button size="small" onClick={() => openUpdateModal(record)}>
            Update
          </Button> */}
          <Popconfirm
            title="Bạn có chắc muốn xóa enroll này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={enrolls}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal Update */}
      <Modal
        title="Cập nhật Enroll"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value={0}>Pending</Select.Option>
              <Select.Option value={1}>Accepted</Select.Option>
              <Select.Option value={2}>Rejected</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EnrollManage;
