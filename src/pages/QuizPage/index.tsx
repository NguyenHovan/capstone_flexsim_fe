import { useEffect, useState, useRef } from "react";
import { Card, Radio, Button, Typography, message, Flex } from "antd";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { QuizService } from "../../services/quiz.service";
import { QuizSubmitssionService } from "../../services/quiz-submitssion.service";
type Answer = {
  id: string;
  description: string;
};

type Question = {
  id: string;
  description: string;
  answers: Answer[];
};

type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};
const QuizPage = () => {
  const { id } = useParams();
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchData = async () => {
    try {
      const response = await QuizService.getFullQuizById(id ?? "");
      setQuizData(response);
    } catch (error) {
      console.log({ error });
    }
  };
  const submitQuiz = async (isAuto = false) => {
    if (submitted) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const answerArray = Object.entries(answers).map(
      ([questionId, answerId]) => ({
        questionId,
        answerId,
      })
    );
    if (!quizData) {
      return;
    }
    const payload = {
      quizId: quizData.id,
      accountId: currentUser.id,
      answers: answerArray,
    };

    if (!isAuto) {
      const check = window.confirm("Do you want to submit?");
      if (!check) return;
    }

    setSubmitted(true);

    try {
      const res = await QuizSubmitssionService.submitQuiz(payload);
      setResult(res);

      toast.success(
        isAuto ? "Hết giờ, bài đã được nộp tự động" : "Nộp bài thành công"
      );
    } catch (error) {
      toast.error("Nộp bài thất bại");
      setSubmitted(false);
    }
  };
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      submitQuiz(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);
  useEffect(() => {
    fetchData();
  }, []);
  const handleSubmit = () => submitQuiz(false);

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleClearAnswer = (questionId: string) => {
    setAnswers((prev) => {
      const newAns = { ...prev };
      delete newAns[questionId];
      return newAns;
    });
  };

  const handleReset = () => {
    setAnswers({});
    setTimeLeft(300);
    setSubmitted(false);
    message.info("Đã làm mới bài thi!");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const scrollToQuestion = (id: string) => {
    questionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };
  if (submitted && result) {
    return (
      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <Card
          style={{
            maxWidth: 600,
            width: "100%",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Typography.Title
            level={3}
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Kết quả bài thi
          </Typography.Title>

          <Card
            size="small"
            style={{
              maxWidth: 500,
              margin: "0 auto 24px",
              borderRadius: 10,
              background: "#fafafa",
            }}
          >
            <Typography.Paragraph style={{ fontSize: 16 }}>
              <strong>Điểm số:</strong> {result.score}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ fontSize: 16 }}>
              <strong>Số câu đúng:</strong> {result.totalCorrect}/
              {result.totalQuestions}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ fontSize: 16 }}>
              <strong>Thời gian làm bài:</strong> {formatTime(timeLeft)}
            </Typography.Paragraph>
          </Card>

          <Flex justify="center" gap={12}>
            <Button type="primary" size="large" onClick={handleReset}>
              Làm lại bài
            </Button>
            <Button
              danger
              size="large"
              onClick={() => navigate("/course-list")}
            >
              Quay về
            </Button>
          </Flex>
        </Card>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* Cột trái - Câu hỏi */}
      <div style={{ flex: 3 }}>
        {quizData?.questions?.map((q: any, idx: number) => (
          <Card
            key={q.id}
            ref={(el) => {
              questionRefs.current[q.id] = el;
            }}
            title={`Câu ${idx + 1}: ${q.description}`}
            style={{ marginBottom: 16 }}
            extra={
              !submitted && (
                <Button size="small" onClick={() => handleClearAnswer(q.id)}>
                  Xóa lựa chọn
                </Button>
              )
            }
          >
            <Radio.Group
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              value={answers[q.id]}
              disabled={submitted}
            >
              {q.answers.map((a: any) => (
                <Radio
                  key={a.id}
                  value={a.id}
                  style={{ display: "block", margin: "8px 0" }}
                >
                  {a.description}
                </Radio>
              ))}
            </Radio.Group>
          </Card>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          height: "fit-content",
          position: "sticky",
          top: 20,
        }}
      >
        <Typography.Title level={5} style={{ textAlign: "center" }}>
          Thời gian còn lại
        </Typography.Title>
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
            color: timeLeft < 30 ? "red" : "black",
          }}
        >
          {formatTime(timeLeft)}
        </div>

        <Button
          type="primary"
          block
          onClick={handleSubmit}
          disabled={submitted}
          style={{ marginBottom: 10 }}
        >
          Nộp bài
        </Button>

        <Button danger block onClick={handleReset} style={{ marginBottom: 20 }}>
          Làm lại
        </Button>

        <Typography.Text strong>Danh sách câu hỏi</Typography.Text>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
        >
          {quizData?.questions?.map((q: any, idx: number) => {
            const isAnswered = !!answers[q.id];
            return (
              <div
                key={q.id}
                onClick={() => scrollToQuestion(q.id)}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  cursor: "pointer",
                  backgroundColor: isAnswered ? "#4caf50" : "#f44336",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
