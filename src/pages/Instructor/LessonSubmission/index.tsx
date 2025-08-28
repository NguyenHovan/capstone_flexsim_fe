import { useEffect, useState } from "react";
import { Table, Button, Modal, InputNumber, Typography, Form } from "antd";
import { useParams } from "react-router-dom";
import { LessonSubmission } from "../../../services/lessonSubmission.service";

const { Text } = Typography;

interface Submission {
  submissionId: string;
  studentId: string;
  studentName: string;
  fileUrl?: string;
  note?: string;
  totalScore?: number | null;
  submitTime: string;
}

const ClassSubmissionsTable = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const { id } = useParams();
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      if (!id) return;
      const response = await LessonSubmission.getLessonSubmissions(id);
      const allSubmissions = Object.values(response).flat() as Submission[];
      setSubmissions(allSubmissions);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrade = (submission: Submission) => {
    setCurrentSubmission(submission);
    form.setFieldsValue({
      totalScore: submission.totalScore || 0,
      note: submission.note || "",
    });
    setVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (currentSubmission) {
        await LessonSubmission.gradeSubmission(
          currentSubmission.submissionId,
          values.totalScore
        );
        fetchData();

        setSubmissions((prev) =>
          prev.map((s) =>
            s.submissionId === currentSubmission.submissionId
              ? { ...s, totalScore: values.totalScore, note: values.note }
              : s
          )
        );

        setVisible(false);
        setCurrentSubmission(null);
      }
    } catch (error) {
      console.log("Lỗi khi chấm điểm:", error);
    }
  };

  return (
    <div>
      <h2>Danh sách học sinh đã nộp bài</h2>
      <Table dataSource={submissions} rowKey="submissionId" pagination={false}>
        <Table.Column title="Tên học sinh" dataIndex="studentName" key="name" />
        <Table.Column
          title="File nộp"
          dataIndex="fileUrl"
          key="file"
          render={(fileUrl: string) =>
            fileUrl ? (
              <Button type="link" href={fileUrl} target="_blank">
                Xem file
              </Button>
            ) : (
              <Text type="secondary">Chưa nộp</Text>
            )
          }
        />
        <Table.Column
          title="Thời gian nộp"
          dataIndex="submitTime"
          key="time"
          render={(time: string) => new Date(time).toLocaleString()}
        />
        <Table.Column
          title="Điểm"
          dataIndex="totalScore"
          key="score"
          render={(score: number | null) =>
            score !== null ? score : <Text type="warning">Chưa chấm</Text>
          }
        />
        <Table.Column
          title="Hành động"
          key="action"
          render={(_, record: Submission) => (
            <Button type="primary" onClick={() => handleGrade(record)}>
              Chấm điểm
            </Button>
          )}
        />
      </Table>

      <Modal
        open={visible}
        title={currentSubmission?.studentName}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        okText="Lưu điểm"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Điểm"
            name="totalScore"
            rules={[{ required: true, message: "Vui lòng nhập điểm" }]}
          >
            <InputNumber min={0} max={10} style={{ width: "100%" }} />
          </Form.Item>
          {/* <Form.Item label="Note" name="note">
            <TextArea rows={3} />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default ClassSubmissionsTable;
