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
      console.log("Error in scoring:", error);
    }
  };

  return (
    <div>
      <h2>List of students who have submitted their work</h2>
      <Table dataSource={submissions} rowKey="submissionId" pagination={false}>
        <Table.Column title="Student Name" dataIndex="studentName" key="name" />
        <Table.Column
          title="File submitted"
          dataIndex="fileUrl"
          key="file"
          render={(fileUrl: string) =>
            fileUrl ? (
              <Button type="link" href={fileUrl} target="_blank">
                View file
              </Button>
            ) : (
              <Text type="secondary">Not submitted</Text>
            )
          }
        />
        <Table.Column
          title="Submission time"
          dataIndex="submitTime"
          key="time"
          render={(time: string) => new Date(time).toLocaleString()}
        />
        <Table.Column
          title="Score"
          dataIndex="totalScore"
          key="score"
          render={(score: number | null) =>
            score !== null ? score : <Text type="warning">Not yet marked</Text>
          }
        />
        <Table.Column
          title="Action"
          key="action"
          render={(_, record: Submission) => (
            <Button type="primary" onClick={() => handleGrade(record)}>
              Scoring
            </Button>
          )}
        />
      </Table>

      <Modal
        open={visible}
        title={currentSubmission?.studentName}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        okText="Save score"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Score"
            name="totalScore"
            rules={[{ required: true, message: "Please enter score" }]}
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
