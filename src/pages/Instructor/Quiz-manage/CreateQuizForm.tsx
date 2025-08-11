import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, Input, Select, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { LessonService } from "../../../services/lesson.service";
import { QuizService } from "../../../services/quiz.service";

const { Option } = Select;

const CreateQuizForm = ({ onCreated }: { onCreated: () => void }) => {
  const [lessons, setLessons] = useState([]);

  // Load danh sách lessons
  const fetchLessons = async () => {
    try {
      const response = await LessonService.getAllLessons();
      setLessons(response);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const onFinish = async (values: any) => {
    const payload = {
      lessonId: values.lessonId,
      quizName: values.quizName,
      totalScore: 0,
      questions: values.questions.map((q: any) => ({
        description: q.description,
        answers: q.answers.map((a: any) => ({
          description: a.description,
          isAnswerCorrect: !!a.isAnswerCorrect,
        })),
      })),
    };

    try {
      await QuizService.createFullQuiz(payload);
      toast.success("Tạo quiz thành công!");
      onCreated?.();
    } catch (err) {
      console.error("Error creating quiz", err);
      toast.error("Tạo quiz thất bại!");
    }
  };

  return (
    <Card title="Tạo Quiz Mới">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Bài học" name="lessonId" rules={[{ required: true }]}>
          <Select placeholder="Chọn bài học">
            {lessons.map((lesson: any) => (
              <Option key={lesson.id} value={lesson.id}>
                {lesson.lessonName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tên Quiz"
          name="quizName"
          rules={[{ required: true }]}
        >
          <Input placeholder="Nhập tên quiz" />
        </Form.Item>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  title={`Câu hỏi ${index + 1}`}
                  style={{ marginBottom: 16 }}
                  extra={
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  }
                >
                  <Form.Item
                    {...field}
                    label="Mô tả câu hỏi"
                    name={[field.name, "description"]}
                    rules={[{ required: true, message: "Nhập mô tả câu hỏi" }]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>

                  <Form.List name={[field.name, "answers"]}>
                    {(
                      answerFields,
                      { add: addAnswer, remove: removeAnswer }
                    ) => (
                      <>
                        {answerFields.map((ansField, idx) => (
                          <Space
                            key={ansField.key}
                            style={{ display: "flex", marginBottom: 8 }}
                            align="start"
                          >
                            <Form.Item
                              {...ansField}
                              name={[ansField.name, "description"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Nhập nội dung đáp án",
                                },
                              ]}
                            >
                              <Input placeholder={`Đáp án ${idx + 1}`} />
                            </Form.Item>

                            <Form.Item
                              name={[ansField.name, "isAnswerCorrect"]}
                              valuePropName="checked"
                            >
                              <Checkbox>Đáp án đúng</Checkbox>
                            </Form.Item>

                            <MinusCircleOutlined
                              onClick={() => removeAnswer(ansField.name)}
                            />
                          </Space>
                        ))}

                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => addAnswer()}
                            icon={<PlusOutlined />}
                            block
                          >
                            Thêm đáp án
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm câu hỏi
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tạo Quiz
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateQuizForm;
