import {
  Table,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QuizService } from "../../../services/quiz.service";
import { TopicService } from "../../../services/topic.service";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [quizRes, topicRes] = await Promise.all([
        QuizService.getAllQuizzes(),
        TopicService.getAllTopics(),
      ]);
      setQuizzes(quizRes);
      setTopics(topicRes);
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      questions: [
        {
          description: "",
          answers: [
            {
              description: "",
              isAnswerCorrect: false,
            },
          ],
        },
      ],
    });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setIsEditing(true);
    setSelectedQuizId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xóa quiz này?",
      onOk: async () => {
        try {
          await QuizService.deleteQuiz(id);
          toast.success("Xóa quiz thành công");
          fetchData();
        } catch {
          toast.error("Xóa thất bại");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && selectedQuizId) {
        await QuizService.updateQuiz(selectedQuizId, values);
        toast.success("Cập nhật thành công!");
      } else {
        await QuizService.createFullQuiz(values);
        toast.success("Tạo quiz thành công!");
      }

      setIsModalVisible(false);
      fetchData();
    } catch (e) {
      toast.error("Lỗi khi lưu quiz");
    }
  };

  return (
    <div>
      <div className="header-section" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Tìm quiz" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Quiz
        </Button>
      </div>

      <Table
        dataSource={quizzes}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        bordered
        columns={[
          { title: "Tên Quiz", dataIndex: "quizName" },
          { title: "Điểm", dataIndex: "score" },
          {
            title: "Topic",
            dataIndex: ["topic", "topicName"],
            render: (_, record) => record?.topic?.topicName || "N/A",
          },
          {
            title: "Hành động",
            render: (_: any, record: any) => (
              <Space>
                <Tooltip title="Sửa">
                  <EditOutlined onClick={() => handleEdit(record)} />
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
        ]}
      />

      <Modal
        open={isModalVisible}
        title={isEditing ? "Cập nhật Quiz" : "Tạo Quiz"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={isEditing ? "Cập nhật" : "Tạo mới"}
        width={800}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên Quiz"
            name="quizName"
            rules={[{ required: true, message: "Vui lòng nhập tên quiz" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Score"
            name="score"
            rules={[{ required: true, message: "Vui lòng nhập điểm số" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Topic"
            name="topicId"
            rules={[{ required: true, message: "Chọn topic" }]}
          >
            <Input.Group compact>
              <Form.Item name="topicId" noStyle>
                <select style={{ width: "100%" }}>
                  {topics.map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.topicName}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, i) => (
                  <Card
                    key={field.key}
                    title={`Câu hỏi ${i + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      <Button
                        danger
                        type="link"
                        onClick={() => remove(field.name)}
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Form.Item
                      {...field}
                      label="Mô tả câu hỏi"
                      name={[field.name, "description"]}
                      rules={[{ required: true, message: "Nhập mô tả" }]}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.List name={[field.name, "answers"]}>
                      {(
                        answerFields,
                        { add: addAnswer, remove: removeAnswer }
                      ) => (
                        <>
                          {answerFields.map((af, j) => (
                            <div key={af.key} style={{ marginBottom: 8 }}>
                              <Form.Item
                                {...af}
                                name={[af.name, "description"]}
                                label={`Đáp án ${j + 1}`}
                                rules={[
                                  { required: true, message: "Nhập đáp án" },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                {...af}
                                name={[af.name, "isAnswerCorrect"]}
                                valuePropName="checked"
                              >
                                <label>
                                  <input type="checkbox" /> Là đáp án đúng?
                                </label>
                              </Form.Item>
                              <Button
                                danger
                                type="link"
                                onClick={() => removeAnswer(af.name)}
                              >
                                Xóa đáp án
                              </Button>
                            </div>
                          ))}
                          <Button type="dashed" onClick={() => addAnswer()}>
                            Thêm đáp án
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  Thêm câu hỏi
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default QuizManagement;
