import { useEffect, useState } from "react";
import { Card, Button, Radio, Row, Col, Badge } from "antd";
import { useParams } from "react-router-dom";
import { LessonService } from "../../services/lesson.service";

const quizData = [
  {
    question:
      "The palace was decorated with ___ furnishings and artwork. (Chọn từ trái nghĩa với 'modest')",
    options: ["simple", "modest", "sumptuous", "sparse"],
    correct: 2,
  },
  {
    question: "He gave a ___ performance that amazed everyone.",
    options: ["dull", "incredible", "lazy", "weak"],
    correct: 1,
  },
];

export default function QuizApp() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(quizData.length).fill(null));
  const { id } = useParams();
  const handleAnswer = (value: number) => {
    const updated = [...answers];
    updated[currentQ] = value;
    setAnswers(updated);
  };
  const fetchQuizLesson = async () => {
    try {
      const response = await LessonService.getQuizzLesson(id);
      setQuizzes(response);
    } catch (error) {
      setQuizzes([]);
      console.log({ error });
    }
  };
  useEffect(() => {
    fetchQuizLesson();
  }, []);
  return (
    <div className="container">
      <Row gutter={16} style={{ padding: 24 }}>
        <Col xs={24} md={16}>
          <Card title={`English Quiz - Q ${currentQ + 1} / ${quizData.length}`}>
            <p
              style={{
                backgroundColor: "#f6ffed",
                padding: 12,
                borderRadius: 6,
              }}
            >
              {quizData[currentQ].question}
            </p>

            <Radio.Group
              onChange={(e) => handleAnswer(e.target.value)}
              value={answers[currentQ]}
              style={{ display: "block", marginTop: 16 }}
            >
              {quizData[currentQ].options.map((opt, idx) => (
                <Radio
                  style={{ display: "block", margin: "8px 0" }}
                  key={idx}
                  value={idx}
                >
                  {opt}
                </Radio>
              ))}
            </Radio.Group>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button
                onClick={() => setCurrentQ((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQ((prev) => Math.min(prev + 1, quizData.length - 1))
                }
              >
                Next
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Quiz Status">
            <Row gutter={[8, 8]}>
              {quizData.map((_, idx) => {
                const isAnswered = answers[idx] !== null;
                const isCurrent = currentQ === idx;
                return (
                  <Col span={6} key={idx}>
                    <Badge
                      color={
                        isCurrent ? "green" : isAnswered ? "blue" : "default"
                      }
                      text={
                        <Button
                          size="small"
                          type={isCurrent ? "primary" : "default"}
                          onClick={() => setCurrentQ(idx)}
                        >
                          Q{idx + 1}
                        </Button>
                      }
                    />
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
