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
  const [enrolls, setEnrolls] = useState<any[]>([]);
  const { id } = useParams();

  // Map trạng thái -> nhãn & màu
  const statusMap: Record<StatusKey, { text: string; color: string }> = {
    0: { text: "Đang chờ", color: "orange" },
    1: { text: "Đã chấp nhận", color: "green" },
    2: { text: "Đã từ chối", color: "red" },
  };

  const fetchEnrolls = async () => {
    setLoading(true);
    try {
      const data = await EnrollmentRequestService.getEnrolmentRequestByCourseId(id ?? "");
      setEnrolls(data || []);
    } catch (error) {
      message.error("Không thể tải danh sách yêu cầu ghi danh");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAcp = async (reqId: string) => {
    try {
      await EnrollmentRequestService.acpEnrollmentRequest(reqId);
      toast.success("Chấp nhận yêu cầu thành công");
      fetchEnrolls();
    } catch {
      toast.error("Không thể chấp nhận yêu cầu");
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await EnrollmentRequestService.rejectEnrollmentRequest(reqId);
      toast.success("Từ chối yêu cầu thành công");
      fetchEnrolls();
    } catch {
      toast.error("Không thể từ chối yêu cầu");
    }
  };

  // const handleDelete = async (reqId: string) => {
  //   try {
  //     await EnrollmentRequestService.deleteEnrollmentRequest(reqId);
  //     toast.success("Xoá yêu cầu ghi danh thành công");
  //     fetchEnrolls();
  //   } catch (error) {
  //     toast.error("Không thể xoá yêu cầu ghi danh");
  //   }
  // };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["account", "fullName"],
    },
    {
      title: "Email",
      dataIndex: ["account", "email"],
    },
    {
      title: "Số điện thoại",
      dataIndex: ["account", "phone"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: StatusKey) => (
        <Tag color={statusMap[status]?.color || "default"}>
          {statusMap[status]?.text || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_: any, record: any) => (
        <Space style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            type="primary"
            onClick={() => handleAcp(record.id)}
            disabled={record.status === 1}
          >
            Chấp nhận
          </Button>
          <Button
            danger
            onClick={() => handleReject(record.id)}
            disabled={record.status === 2}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={enrolls}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal Cập nhật */}
      <Modal
        title="Cập nhật yêu cầu ghi danh"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={0}>Đang chờ</Select.Option>
              <Select.Option value={1}>Đã chấp nhận</Select.Option>
              <Select.Option value={2}>Đã từ chối</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EnrollManage;
