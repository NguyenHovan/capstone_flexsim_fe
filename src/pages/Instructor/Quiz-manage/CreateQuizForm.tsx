import { Button, Card, Checkbox, Form, Input, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { QuizService } from "../../../services/quiz.service";
import { useNavigate, useParams } from "react-router-dom";

const CreateQuizForm = ({ onCreated }: { onCreated: () => void }) => {
  const { lessonId, topicId } = useParams();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    if (!values.quizName?.trim()) {
      toast.error("Vui lòng nhập tên quiz.");
      return;
    }
    if (!Array.isArray(values.questions) || values.questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 câu hỏi.");
      return;
    }
    for (let i = 0; i < values.questions.length; i++) {
      const q = values.questions[i];
      if (!q?.description?.trim()) {
        toast.error(`Câu hỏi ${i + 1} chưa có mô tả.`);
        return;
      }
      if (!Array.isArray(q.answers) || q.answers.length === 0) {
        toast.error(`Câu hỏi ${i + 1} cần ít nhất 1 đáp án.`);
        return;
      }
      const hasCorrect = q.answers.some((a: any) => !!a.isAnswerCorrect);
      if (!hasCorrect) {
        toast.error(`Vui lòng chọn đáp án đúng cho câu hỏi ${i + 1}.`);
        return;
      }
      const anyBlank = q.answers.some((a: any) => !a?.description?.trim());
      if (anyBlank) {
        toast.error(`Một số đáp án ở câu hỏi ${i + 1} chưa có nội dung.`);
        return;
      }
    }

    const payload = {
      lessonId: lessonId,
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
      navigate(`/instructor-course/detail/${topicId}`);
    } catch (err) {
      console.error("Error creating quiz", err);
      toast.error("Tạo quiz thất bại!");
    }
  };

  return (
    <Card title="Tạo Quiz Mới">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên Quiz"
          name="quizName"
          rules={[{ required: true, message: "Vui lòng nhập tên quiz" }]}
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
                    <MinusCircleOutlined
                      onClick={() => remove(field.name)}
                      title="Xoá câu hỏi"
                    />
                  }
                >
                  <Form.Item
                    {...field}
                    label="Mô tả câu hỏi"
                    name={[field.name, "description"]}
                    rules={[{ required: true, message: "Nhập mô tả câu hỏi" }]}
                  >
                    <Input.TextArea rows={2} placeholder="Nhập nội dung câu hỏi" />
                  </Form.Item>

                  <Form.List name={[field.name, "answers"]}>
                    {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
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
                                { required: true, message: "Nhập nội dung đáp án" },
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
                              title="Xoá đáp án"
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
