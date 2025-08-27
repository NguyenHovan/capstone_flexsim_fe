import { useState, useEffect } from "react";
import { Table, Button, Space, Modal, Form, Select, message, Tag } from "antd";
import { EnrollmentRequestService } from "../../../services/enrollment-request.service";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
type StatusKey = 0 | 1 | 2;
const EnrollManage = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrolls, setEnrolls] = useState([]);
  const { id } = useParams();
  const statusMap: Record<StatusKey, { text: string; color: string }> = {
    0: { text: "Pending", color: "orange" },
    1: { text: "Accepted", color: "green" },
    2: { text: "Rejected", color: "red" },
  };

  const fetchEnrolls = async () => {
    setLoading(true);
    try {
      const data = await EnrollmentRequestService.getEnrolmentRequestByCourseId(
        id ?? ""
      );
      setEnrolls(data || []);
    } catch (error) {
      message.error("Không thể tải danh sách enroll");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrolls();
  }, []);

  const handleAcp = async (id: string) => {
    try {
      await EnrollmentRequestService.acpEnrollmentRequest(id);
      toast.success("Chấp nhận thành công");
      fetchEnrolls();
    } catch {
      toast.error("Không thể chấp nhận");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await EnrollmentRequestService.rejectEnrollmentRequest(id);
      toast.success("Từ chối thành công");
      fetchEnrolls();
    } catch {
      toast.error("Không thể từ chối");
    }
  };

  // const handleDelete = async (id: string) => {
  //   try {
  //     await EnrollmentRequestService.deleteEnrollmentRequest(id);
  //     toast.success("Xóa enroll thành công");
  //     fetchEnrolls();
  //   } catch (error) {
  //     toast.error("Không thể xóa enroll");
  //   }
  // };

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
      title: "Status",
      dataIndex: "status",
      render: (status: StatusKey) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.text || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Space style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            type="primary"
            onClick={() => handleAcp(record.id)}
            disabled={record.status === 1}
          >
            Accept
          </Button>
          <Button
            danger
            onClick={() => handleReject(record.id)}
            disabled={record.status === 2}
          >
            Reject
          </Button>
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
        <Form form={form} layout="vertical">
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
