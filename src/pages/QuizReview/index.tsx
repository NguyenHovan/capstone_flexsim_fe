import { Card, List, Tag, Empty } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QuizService } from "../../services/quiz.service";

const QuizReview = () => {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);

  const fetchDataReview = async () => {
    try {
      if (!id) {
        setData([]);
        return;
      }
      const response = await QuizService.reviewQuiz(id);
      setData(response || []);
    } catch (error) {
      console.log({ error });
      setData([]);
    }
  };

  useEffect(() => {
    fetchDataReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!data || data.length === 0) {
    return (
      <div style={{ maxWidth: 1000, margin: "40px auto" }}>
        <Empty description="Chưa có dữ liệu review cho bài thi này." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", marginTop: 50 }}>
      {data.map((q, index) => {
        const userAnswer = q.answers.find((a: any) => a.answerId === q.selectedAnswerId);
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
              renderItem={(answer: any) => {
                const isSelected = answer.answerId === q.selectedAnswerId;
                const correct = answer.isCorrect;

                return (
                  <List.Item>
                    <span>{answer.description}</span>
                    {isSelected && (
                      <Tag color={isCorrect ? "green" : "red"}>
                        {isCorrect ? "Bạn chọn - Đúng" : "Bạn chọn - Sai"}
                      </Tag>
                    )}
                    {!isSelected && correct && <Tag color="blue">Đáp án đúng</Tag>}
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
