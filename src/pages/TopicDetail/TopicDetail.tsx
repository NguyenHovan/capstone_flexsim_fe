import { useEffect, useState } from "react";
import { List, Button, Typography, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { LessonService } from "../../services/lesson.service";
import { LessonProgressService } from "../../services/lessonProgress.service";
import { toast } from "sonner";

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userString = localStorage.getItem("currentUser");
  const currentUser = userString ? JSON.parse(userString) : null;
  const currentAccountId = currentUser?.id || "";
  const [data, setData] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>();
  const fetchTopicDetail = async () => {
    try {
      const response = await LessonService.getLessonByTopic(id ?? "");
      setData(response);
      setSelectedLesson(response[0]);
    } catch (error: any) {
      console.log({ error });
    }
  };
  const handleComplete = async () => {
    try {
      await LessonProgressService.updateLessonProgress(
        currentUser.id,
        selectedLesson.id
      );
      toast.success("Cập nhật thành công");
      fetchTopicDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };
  useEffect(() => {
    fetchTopicDetail();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        gap: "24px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #eee",
          paddingRight: "16px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography.Title level={4} style={{ marginBottom: "16px" }}>
          Lessons
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(lesson: any, index: number) => {
            const progress = lesson.lessonProgresses.find(
              (p: any) => p.accountId === currentAccountId && p.status === 2
            );

            let disabled = false;
            if (index > 0) {
              const prevLesson = data[index - 1];
              const prevProgress = prevLesson.lessonProgresses.find(
                (p: any) => p.accountId === currentAccountId && p.status === 2
              );
              if (!prevProgress) disabled = true;
            }

            return (
              <List.Item
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  background:
                    selectedLesson?.id === lesson.id ? "#e6f7ff" : "white",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  boxShadow:
                    selectedLesson?.id === lesson.id
                      ? "0 4px 12px rgba(0,0,0,0.1)"
                      : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: disabled ? 0.5 : 1, // mờ nếu disabled
                }}
                onMouseEnter={(e) =>
                  !disabled &&
                  ((e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  !disabled &&
                  ((e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)")
                }
                onClick={() => !disabled && setSelectedLesson(lesson)}
              >
                <span role="img" aria-label="lesson">
                  <span role="img" aria-label="lesson">
                    {progress ? "✅" : "📘"}
                  </span>
                </span>
                <Typography.Text strong>{lesson.lessonName}</Typography.Text>
              </List.Item>
            );
          }}
        />
      </div>

      <div style={{ flex: 1, paddingLeft: "16px" }}>
        {selectedLesson ? (
          <>
            <Typography.Title level={4}>
              {selectedLesson.lessonName}
            </Typography.Title>
            <Typography.Paragraph>
              {selectedLesson.description
                .split("\n")
                .map((line: any, idx: number) => (
                  <p key={idx}>{line}</p>
                ))}
            </Typography.Paragraph>

            <Divider />
            {selectedLesson?.quizzes?.length && (
              <>
                <Typography.Title level={5}>Quizzes</Typography.Title>
                <List
                  itemLayout="horizontal"
                  dataSource={selectedLesson.quizzes}
                  renderItem={(quiz: any) => {
                    const latestSubmission = quiz.quizSubmissions?.length
                      ? [...quiz.quizSubmissions].sort(
                          (a, b) =>
                            new Date(b.submitTime).getTime() -
                            new Date(a.submitTime).getTime()
                        )[0]
                      : null;

                    return (
                      <List.Item
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #f0f0f0",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLDivElement
                          ).style.background = "#fafafa")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLDivElement
                          ).style.background = "white")
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              role="img"
                              aria-label="quiz"
                              style={{ fontSize: "18px" }}
                            >
                              📝
                            </span>
                            <span>{quiz.quizName}</span>
                          </div>

                          {latestSubmission && (
                            <div style={{ fontSize: "12px", color: "#555" }}>
                              <div>
                                <b>Điểm:</b> {latestSubmission.totalScore}
                              </div>
                              <div>
                                <b>Nộp:</b>{" "}
                                {new Date(
                                  latestSubmission.submitTime
                                ).toLocaleString("vi-VN")}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          type="primary"
                          size="small"
                          onClick={() => navigate(`/quiz-test/${quiz.id}`)}
                          style={{
                            borderRadius: "8px",
                            background:
                              "linear-gradient(90deg, #ff7e5f, #feb47b)",
                            border: "none",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            ((
                              e.currentTarget as HTMLButtonElement
                            ).style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)")
                          }
                          onMouseLeave={(e) =>
                            ((
                              e.currentTarget as HTMLButtonElement
                            ).style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)")
                          }
                        >
                          Làm bài
                        </Button>
                      </List.Item>
                    );
                  }}
                />
              </>
            )}

            <Button
              type="primary"
              style={{ marginTop: "16px", borderRadius: "6px" }}
              onClick={() => handleComplete()}
            >
              Completed
            </Button>
          </>
        ) : (
          <Typography.Text>No lesson selected</Typography.Text>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
