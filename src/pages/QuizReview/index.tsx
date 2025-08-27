import { Card, List, Tag } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QuizService } from "../../services/quiz.service";

const QuizReview = () => {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);
  const fetchDataReview = async () => {
    try {
      if (!id) {
        return setData([]);
      }
      const response = await QuizService.reviewQuiz(id);
      setData(response);
    } catch (error) {
      console.log({ error });
    }
  };
  useEffect(() => {
    fetchDataReview();
  }, []);
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", marginTop: 50 }}>
      {data.map((q, index) => {
        const userAnswer = q.answers.find(
          (a) => a.answerId === q.selectedAnswerId
        );
        const isCorrect = userAnswer?.isCorrect;

        return (
          <Card
            key={q.questionId}
            title={`Câu ${index + 1}: ${q.questionDescription}`}
            style={{ marginBottom: 16, borderRadius: 8 }}
            headStyle={{ background: "#fafafa" }}
          >
            <List
              dataSource={q.answers}
              renderItem={(answer) => {
                const isSelected = answer.answerId === q.selectedAnswerId;
                const correct = answer.isCorrect;

                let color: "default" | "success" | "error" | "processing" =
                  "default";
                if (isSelected && correct) color = "success"; // chọn đúng
                else if (isSelected && !correct) color = "error"; // chọn sai
                else if (!isSelected && correct) color = "processing"; // đáp án đúng nhưng chưa chọn

                return (
                  <List.Item>
                    <span>{answer.description}</span>
                    {isSelected && (
                      <Tag color={isCorrect ? "green" : "red"}>
                        {isCorrect ? "Bạn chọn - Đúng" : "Bạn chọn - Sai"}
                      </Tag>
                    )}
                    {!isSelected && correct && (
                      <Tag color="blue">Đáp án đúng</Tag>
                    )}
                  </List.Item>
                );
              }}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default QuizReview;
