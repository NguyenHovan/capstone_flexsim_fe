import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Tabs,
  List,
  Button,
  Space,
  Input,
  Radio,
  Modal,
  Form,
  Checkbox,
  Flex,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import { QuizSubmitssionService } from "../../../services/quiz-submitssion.service";
import { QuizService } from "../../../services/quiz.service";
import { toast } from "sonner";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

interface Student {
  accountId: string;
  fullName: string;
  quizId: string;
  quizName: string;
  submitTime: string;
  totalScore: number;
}

interface ClassData {
  className: string;
  students: Student[];
}

interface Answer {
  id: string;
  description: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  description: string;
  answers: Answer[];
}

interface Quiz {
  id: string;
  quizName: string;
  questions: Question[];
}

const QuizDetail: React.FC = () => {
  const [studentData, setStudentData] = useState<ClassData[]>([]);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const { id } = useParams();

  const fetchQuizSubmissions = async () => {
    try {
      const response = await QuizSubmitssionService.getQuizSubmitLessonByQuizId(
        id ?? ""
      );
      setStudentData(response);
    } catch (error) {
      console.log({ error });
    }
  };

  const fetchQuizDetail = async () => {
    try {
      const response = await QuizService.getFullQuizById(id ?? "");
      setQuizData(response);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchQuizSubmissions();
    fetchQuizDetail();
  }, []);

  const columns: ColumnsType<Student> = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Bài kiểm tra",
      dataIndex: "quizName",
      key: "quizName",
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submitTime",
      key: "submitTime",
      render: (time) =>
        new Date(time).toLocaleString("vi-VN", {
          hour12: false,
        }),
    },
    {
      title: "Điểm số",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => (
        <Tag color={score >= 8 ? "green" : score >= 5 ? "orange" : "red"}>
          {score}
        </Tag>
      ),
    },
  ];

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    form.setFieldsValue(question);
    setOpenModal(true);
  };

  const handleSaveQuestion = async () => {
    try {
      const values = await form.validateFields();
      const updated: Question = {
        ...editingQuestion!,
        description: values.description,
        answers: values.answers,
      };

      await QuizService.updateQuiz(quizData!.id, {
        quizName: quizData!.quizName,
        questions: [updated],
      });

      const newQuestions = quizData!.questions.map((q) =>
        q.id === updated.id ? updated : q
      );
      setQuizData({ ...quizData!, questions: newQuestions });

      toast.success("Cập nhật câu hỏi thành công");
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại ❌");
    }
  };

  const handleOk = async () => {
    try {
      if (!id) return;
      const values = await form.validateFields();

      const formatted = values.questions.map((q: any) => ({
        description: q.description,
        answers: q.answers.map((a: any) => ({
          description: a.description,
          isAnswerCorrect: a.isAnswerCorrect || false,
        })),
      }));

      await QuizService.createNewQuestions(id, formatted);
      fetchQuizDetail();
      setVisible(false);
      form.resetFields();
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2} style={{ textAlign: "center" }}>
        Chi tiết Quiz
      </Typography.Title>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="📊 Kết quả học sinh" key="1">
          {studentData.map((cls, idx) => (
            <Card
              key={idx}
              title={
                <Typography.Title level={4}>{cls.className}</Typography.Title>
              }
              style={{
                marginBottom: 24,
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
            >
              <Table
                rowKey="submitTime"
                columns={columns}
                dataSource={cls.students}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          ))}
        </Tabs.TabPane>

        <Tabs.TabPane tab="📝 Câu hỏi & đáp án" key="2">
          {quizData ? (
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
            >
              <Flex gap={24} align="center" justify="space-between">
                <Typography.Title level={4}>
                  {quizData.quizName}
                </Typography.Title>
                <Button type="primary" onClick={() => setVisible(true)}>
                  Thêm câu hỏi
                </Button>
              </Flex>
              <List
                itemLayout="vertical"
                dataSource={quizData.questions}
                renderItem={(q, idx) => (
                  <Card
                    key={q.id}
                    style={{ marginBottom: 16, borderRadius: 12 }}
                    title={`Câu ${idx + 1}: ${q.description}`}
                    extra={
                      <Button onClick={() => handleEditQuestion(q)}>
                        ✏️ Cập nhật
                      </Button>
                    }
                  >
                    <Radio.Group
                      value={q.answers.find((a) => a.isCorrect)?.id}
                      disabled
                    >
                      <Space direction="vertical">
                        {q.answers.map((a) => (
                          <Radio key={a.id} value={a.id}>
                            {a.description}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Card>
                )}
              />
            </Card>
          ) : (
            <Typography.Text>Đang tải dữ liệu quiz...</Typography.Text>
          )}
        </Tabs.TabPane>
      </Tabs>

      {/* Modal cập nhật câu hỏi */}
      <Modal
        title="Cập nhật câu hỏi"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSaveQuestion}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="description"
            label="Mô tả câu hỏi"
            rules={[{ required: true, message: "Nhập mô tả câu hỏi" }]}
          >
            <Input placeholder="Nhập mô tả câu hỏi" />
          </Form.Item>

          <Form.List name="answers">
            {(fields) => (
              <div>
                {fields.map(({ key, name, ...rest }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...rest}
                      name={[name, "description"]}
                      rules={[{ required: true, message: "Nhập đáp án" }]}
                    >
                      <Input placeholder="Nội dung đáp án" />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, "isCorrect"]}
                      valuePropName="checked"
                    >
                      <Checkbox>Đúng</Checkbox>
                    </Form.Item>
                  </Space>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal thêm câu hỏi mới */}
      <Modal
        title="Thêm câu hỏi"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical" name="quizForm">
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      border: "1px solid #eee",
                      padding: 16,
                      marginBottom: 16,
                      borderRadius: 8,
                    }}
                  >
                    <Space
                      align="baseline"
                      style={{ justifyContent: "space-between", width: "100%" }}
                    >
                      <h4>Câu hỏi {index + 1}</h4>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>

                    <Form.Item
                      {...field}
                      name={[field.name, "description"]}
                      label="Mô tả câu hỏi"
                      rules={[
                        { required: true, message: "Vui lòng nhập câu hỏi!" },
                      ]}
                    >
                      <Input placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>

                    <Form.List name={[field.name, "answers"]}>
                      {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                        <>
                          {answerFields.map((answerField) => (
                            <Space
                              key={answerField.key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...answerField}
                                name={[answerField.name, "description"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập đáp án!",
                                  },
                                ]}
                              >
                                <Input placeholder="Nội dung đáp án" />
                              </Form.Item>
                              <Form.Item
                                name={[answerField.name, "isAnswerCorrect"]}
                                valuePropName="checked"
                              >
                                <Checkbox>Đáp án đúng</Checkbox>
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => removeAnswer(answerField.name)}
                              />
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addAnswer()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm đáp án
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
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

export default QuizDetail;
