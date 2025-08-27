import { useEffect, useRef, useState } from "react";
import { List, Button, Typography, Divider, Row, Col, Flex } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { LessonService } from "../../services/lesson.service";
import { LessonProgressService } from "../../services/lessonProgress.service";
import { toast } from "sonner";
import { LessonSubmission } from "../../services/lessonSubmission.service";

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userString = localStorage.getItem("currentUser");
  const currentUser = userString ? JSON.parse(userString) : null;
  const currentAccountId = currentUser?.id || "";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>();
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [maxWatchTime, setMaxWatchTime] = useState(0);
  const fetchTopicDetail = async () => {
    try {
      const response = await LessonService.getLessonByTopic(id ?? "");
      setData(response);
      setSelectedLesson(response[0]);
    } catch (error: any) {
      console.log({ error });
    }
  };
  const handleVideoEnded = () => {
    setIsCompleted(true);
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      if (current > maxWatchTime) {
        setMaxWatchTime(current);
      }
    }
  };

  const handleSeeking = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime > maxWatchTime + 2) {
        // người dùng tua vượt quá chỗ đã xem + 2s → chặn
        videoRef.current.currentTime = maxWatchTime;
      }
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

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file trước khi nộp!");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("lessonId", selectedLesson.id);
      formData.append("accountId", currentAccountId);
      formData.append("fileUrl", selectedFile);
      formData.append("note", note);

      await LessonSubmission.submitLesson(formData);
      toast.success("Upload file thành công!");
      fetchTopicDetail();
      setSelectedFile(null);
      setNote("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload thất bại!");
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
            {selectedLesson.fileUrl && (
              <video
                style={{
                  width: "80%",
                  maxWidth: "720px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                controls
                src={selectedLesson.fileUrl}
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeeking}
                onEnded={handleVideoEnded}
              />
            )}

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
            {selectedLesson?.scenario && (
              <>
                <Divider />
                <Typography.Title level={5}>Scenario</Typography.Title>
                <Row gutter={24}>
                  <Col
                    span={12}
                    style={{
                      borderRight: "1px solid #eee",
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#fafafa",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography.Title level={5}>
                      {selectedLesson.scenario.scenarioName}
                    </Typography.Title>
                    <Typography.Paragraph style={{ whiteSpace: "pre-line" }}>
                      {selectedLesson.scenario.description}
                    </Typography.Paragraph>
                    {selectedLesson.scenario.fileUrl && (
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          borderRadius: "6px",
                          background:
                            "linear-gradient(90deg, #4facfe, #00f2fe)",
                          border: "none",
                          color: "white",
                          fontWeight: 600,
                          boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                        }}
                        onClick={() =>
                          window.open(selectedLesson.scenario.fileUrl, "_blank")
                        }
                      >
                        Tải file xuống
                      </Button>
                    )}
                  </Col>

                  <Col
                    span={12}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#fafafa",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <Typography.Title level={5}>
                      Nộp file của bạn
                    </Typography.Title>

                    <label
                      htmlFor="fileUpload"
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        border: "2px dashed #ddd",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: "#fff",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLLabelElement
                        ).style.borderColor = "#4facfe")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLLabelElement
                        ).style.borderColor = "#ddd")
                      }
                    >
                      <span style={{ fontSize: "32px", marginBottom: "8px" }}>
                        📤
                      </span>
                      <span style={{ color: "#555" }}>
                        Click hoặc kéo file vào đây
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          marginTop: "4px",
                        }}
                      >
                        Chỉ định dạng file hợp lệ
                      </span>
                    </label>

                    <input
                      type="file"
                      id="fileUpload"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSelectedFile(file);
                        toast.success(`Chọn file: ${file.name}`);
                      }}
                    />

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú cho file nộp..."
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        resize: "vertical",
                        fontSize: "14px",
                      }}
                    />

                    {/* Nút nộp file */}
                    <Button
                      type="primary"
                      style={{
                        borderRadius: "6px",
                        background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
                        border: "none",
                        color: "white",
                        fontWeight: 600,
                        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                        width: "100%",
                      }}
                      onClick={handleSubmit}
                    >
                      Nộp file
                    </Button>
                    {selectedLesson.lessonSubmissions &&
                      selectedLesson.lessonSubmissions.length > 0 && (
                        <div style={{ width: "100%", marginTop: "24px" }}>
                          <Typography.Title level={5}>
                            Các bài đã nộp
                          </Typography.Title>
                          <List
                            itemLayout="horizontal"
                            dataSource={selectedLesson.lessonSubmissions}
                            renderItem={(item: any) => (
                              <List.Item
                                style={{
                                  padding: "12px",
                                  borderRadius: "6px",
                                  background: "#fff",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  marginBottom: "8px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <Typography.Text strong>
                                    {item.fileUrl?.split("/").pop()}
                                  </Typography.Text>
                                  {item.note && (
                                    <Typography.Paragraph
                                      type="secondary"
                                      style={{ margin: 0 }}
                                    >
                                      Note: {item.note}
                                    </Typography.Paragraph>
                                  )}
                                  {item.submitTime && (
                                    <Typography.Paragraph
                                      type="secondary"
                                      style={{ margin: 0, fontSize: 12 }}
                                    >
                                      Nộp lúc:{" "}
                                      {new Date(
                                        item.submitTime
                                      ).toLocaleString()}
                                    </Typography.Paragraph>
                                  )}
                                </div>
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download
                                </a>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                  </Col>
                </Row>
              </>
            )}

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
                        <Flex gap={24}>
                          {quiz.quizSubmissions?.length ? (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() =>
                                navigate(`/quiz-review/${quiz.id}`)
                              }
                              style={{
                                borderRadius: "8px",
                                background:
                                  "linear-gradient(90deg, #5fb7ffffrgba(123, 195, 254, 1)7b)",
                                border: "none",
                                color: "white",
                                fontWeight: 600,
                                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) =>
                                ((
                                  e.currentTarget as HTMLButtonElement
                                ).style.boxShadow =
                                  "0 6px 12px rgba(0,0,0,0.15)")
                              }
                              onMouseLeave={(e) =>
                                ((
                                  e.currentTarget as HTMLButtonElement
                                ).style.boxShadow = "0 3px 6px rgba(0,0,0,0.1)")
                              }
                            >
                              Review Quiz
                            </Button>
                          ) : (
                            <></>
                          )}

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
                        </Flex>
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
              disabled={selectedLesson?.fileUrl ? !isCompleted : false}
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
