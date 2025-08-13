import { useEffect, useState } from "react";
import { Card, Button, Radio, Row, Col, Badge, Empty } from "antd";
import { useParams } from "react-router-dom";
import { LessonService } from "../../services/lesson.service";

interface Quiz {
  quizId: string;
  quizName: string;
  options?: string[];
  correct?: number;
}

export default function QuizApp() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { id } = useParams();

  const fetchQuizLesson = async () => {
    try {
      const response = await LessonService.getQuizzLesson(id ?? "");
      if (response && response.length > 0) {
        setQuizzes(response);
        setAnswers(Array(response.length).fill(null));
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.log({ error });
      setQuizzes([]);
    }
  };

  useEffect(() => {
    fetchQuizLesson();
  }, [id]);

  const handleAnswer = (value: number) => {
    const updated = [...answers];
    updated[currentQ] = value;
    setAnswers(updated);
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Bài giảng không có quiz" />
      </div>
    );
  }

  const currentQuiz = quizzes[currentQ];

  return (
    <div className="container">
      <Row gutter={16} style={{ padding: 24 }}>
        <Col xs={24} md={16}>
          <Card title={`Quiz - Q ${currentQ + 1} / ${quizzes.length}`}>
            <p
              style={{
                backgroundColor: "#f6ffed",
                padding: 12,
                borderRadius: 6,
              }}
            >
              {currentQuiz.quizName}
            </p>

            {currentQuiz.options && currentQuiz.options.length > 0 && (
              <Radio.Group
                onChange={(e) => handleAnswer(e.target.value)}
                value={answers[currentQ]}
                style={{ display: "block", marginTop: 16 }}
              >
                {currentQuiz.options.map((opt, idx) => (
                  <Radio
                    style={{ display: "block", margin: "8px 0" }}
                    key={idx}
                    value={idx}
                  >
                    {opt}
                  </Radio>
                ))}
              </Radio.Group>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <Button
                onClick={() => setCurrentQ((prev) => Math.max(prev - 1, 0))}
                disabled={currentQ === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQ((prev) => Math.min(prev + 1, quizzes.length - 1))
                }
                disabled={currentQ === quizzes.length - 1}
              >
                Next
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Quiz Status">
            <Row gutter={[8, 8]}>
              {quizzes.map((_, idx) => {
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
