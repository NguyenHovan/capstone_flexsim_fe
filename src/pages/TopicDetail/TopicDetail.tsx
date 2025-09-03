import { useEffect, useRef, useState } from "react";
import {
  List,
  Button,
  Typography,
  Divider,
  Row,
  Col,
  Flex,
  Modal,
  Input,
  Tag,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { LessonService } from "../../services/lesson.service";
import { LessonProgressService } from "../../services/lessonProgress.service";
import { toast } from "sonner";
import { LessonSubmission } from "../../services/lessonSubmission.service";

const { TextArea } = Input;

interface QuizSubmission {
  id: string;
  accountId: string;
  totalScore?: number;
  submitTime: string;
}

interface Quiz {
  id: string;
  quizName: string;
  quizSubmissions?: QuizSubmission[];
}

interface Scenario {
  scenarioName: string;
  description: string;
  fileUrl?: string;
}

interface LessonProgress {
  accountId: string;
  status: number;
}

interface LessonSubmissionItem {
  id: string;
  fileUrl: string;
  note?: string;
  totalScore?: number;
  submitTime?: string;
}

interface LessonItem {
  id: string;
  lessonName: string;
  description: string;
  fileUrl?: string; // video url
  scenario?: Scenario;
  lessonSubmissions?: LessonSubmissionItem[];
  quizzes?: Quiz[];
  lessonProgresses: LessonProgress[];
  orderIndex: number;
  scenarioId: string;
  topic: any;
}

interface MyLessonSubmit {
  totalScore?: number;
  [key: string]: any;
}
function extractMaxScore(lessons: any) {
  let maxScore: number | null = null;
  let meta: { lessonId: string; lessonName?: string; quizId: string } | null =
    null;

  for (const lesson of lessons ?? []) {
    for (const q of lesson.quizzes ?? []) {
      const raw = (q.latestScore ?? q.totalScore ?? 0) as number | string;
      const score = Number(raw);
      if (!Number.isFinite(score)) continue;

      if (maxScore === null || score > maxScore) {
        maxScore = score;
        meta = {
          lessonId: lesson.id,
          lessonName: lesson.lessonName,
          quizId: q.id,
        };
      }
    }
  }
  return { maxScore, meta };
}
const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userString = localStorage.getItem("currentUser");
  const currentUser = userString ? JSON.parse(userString) : null;
  const currentAccountId: string = currentUser?.id || "";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");
  const [data, setData] = useState<LessonItem[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchRef = useRef<number>(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] =
    useState<LessonSubmissionItem | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [myLessonSubmit, setMyLessonSubmit] = useState<MyLessonSubmit | null>(
    null
  );
  const [quizMaxScore, setQuizMaxScore] = useState<number>(0);
  const [editLoading, setEditLoading] = useState(false);

  const fetchQuizSubmitssionScore = async () => {
    try {
      const response = await LessonService.getQuizScoreByTopicId(id ?? "");
      const { maxScore } = extractMaxScore(response);
      setQuizMaxScore(Number(maxScore));
    } catch (error) {
      console.log({ error });
    }
  };
  const fetchTopicDetail = async () => {
    try {
      const response: LessonItem[] = await LessonService.getLessonByTopic(
        id ?? ""
      );
      setData(response);
      setSelectedLesson(response?.[0] ?? null);
    } catch (error: any) {
      console.log({ error });
      toast.error(
        error?.response?.data?.message || "Không tải được dữ liệu topic"
      );
    }
  };

  const fetchMyLessonSubmit = async (lessonId: string) => {
    try {
      const response = await LessonSubmission.getMyLessonSubmitssion(lessonId);
      setMyLessonSubmit(response ?? null);
    } catch (error) {
      console.log({ error });
      setMyLessonSubmit(null);
    }
  };

  useEffect(() => {
    fetchTopicDetail();
    fetchQuizSubmitssionScore();
  }, []);

  useEffect(() => {
    if (selectedLesson?.id) {
      fetchMyLessonSubmit(selectedLesson.id);

      setIsCompleted(false);
      maxWatchRef.current = 0;

      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0;
        } catch {}
      }
    }
  }, [selectedLesson?.id]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime > maxWatchRef.current) {
      maxWatchRef.current = video.currentTime;
    }
    const progress = video.duration ? video.currentTime / video.duration : 0;
    if (progress >= 0.75 && !isCompleted) {
      setIsCompleted(true);
    }
  };

  const handleSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime > maxWatchRef.current + 2) {
      v.currentTime = maxWatchRef.current;
    }
  };

  const handleVideoEnded = () => {
    setIsCompleted(true);
  };

  const handleComplete = async () => {
    if (!currentUser || !selectedLesson) return;
    try {
      await LessonProgressService.updateLessonProgress(
        currentUser.id,
        selectedLesson.id
      );
      toast.success("Cập nhật thành công");
      fetchTopicDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file trước khi nộp!");
      return;
    }
    if (!selectedLesson) return;

    try {
      const formData = new FormData();
      formData.append("lessonId", selectedLesson.id);
      formData.append("accountId", currentAccountId);
      formData.append("fileUrl", selectedFile);
      formData.append("note", note);

      await LessonSubmission.submitLesson(formData);
      toast.success("Upload file thành công!");
      // fetchTopicDetail();
      setSelectedFile(null);
      setSelectedLesson(selectedLesson);
      setNote("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload thất bại!");
    }
  };

  const handleEditSubmit = async () => {
    if (!editingSubmission || !selectedLesson) return;
    try {
      setEditLoading(true);

      const formData = new FormData();
      formData.append("lessonId", selectedLesson.id);
      formData.append("accountId", currentAccountId);
      if (editFile) {
        formData.append("fileUrl", editFile);
      } else {
        formData.append("fileUrl", editingSubmission.fileUrl);
      }
      formData.append("note", editNote);

      await LessonSubmission.updateLessonSubmitssion(
        editingSubmission.id,
        formData
      );

      toast.success("Cập nhật bài nộp thành công!");
      fetchTopicDetail();
      setIsModalOpen(false);
      setEditingSubmission(null);
      setEditFile(null);
      setEditNote("");
    } catch (err: any) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài nộp"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // const latestQuizScore: number = useMemo(() => {
  //   const quizzes = selectedLesson?.quizzes ?? [];
  //   const allMySubs: QuizSubmission[] = quizzes.flatMap((q) =>
  //     (q.quizSubmissions ?? []).filter((s) => s.accountId === currentAccountId)
  //   );

  //   if (allMySubs.length === 0) return 0;

  //   allMySubs.sort(
  //     (a, b) =>
  //       new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()
  //   );
  //   return Number(allMySubs[0]?.totalScore ?? 0);
  // }, [selectedLesson?.quizzes, currentAccountId]);

  const getDisabled = () => {
    const fileUrlTruthy = !!selectedLesson?.fileUrl;
    const total = Number(myLessonSubmit?.totalScore ?? 0);

    let allConditions = true;

    if (quizMaxScore || selectedLesson?.quizzes?.length) {
      allConditions = allConditions && quizMaxScore > 8;
    }

    if (total || selectedLesson?.scenarioId) {
      allConditions = allConditions && total > 5;
    }

    if (fileUrlTruthy) {
      allConditions = allConditions && isCompleted;
    }

    return !allConditions;
  };
  console.log({ selectedLesson });
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
          {data?.[0]?.topic?.topicName}
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(lesson: LessonItem, index: number) => {
            const progress = lesson.lessonProgresses?.find(
              (p: any) => p.accountId === currentAccountId && p.status === 2
            );

            let disabled = false;
            if (index > 0) {
              const prevLesson = data[index - 1];
              const prevProgress = prevLesson.lessonProgresses?.find(
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
                  opacity: disabled ? 0.5 : 1,
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
                  {progress ? "✅" : "📘"} #{lesson.orderIndex}
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
                ref={videoRef}
                style={{
                  width: "80%",
                  maxWidth: "1000px",
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
                ?.split("\n")
                .map((line: string, idx: number) => (
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
                          window.open(
                            selectedLesson.scenario!.fileUrl!,
                            "_blank"
                          )
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
                      disabled={!!myLessonSubmit} // đã nộp rồi thì khoá nút nộp mới
                    >
                      Nộp file
                    </Button>

                    {/* Danh sách đã nộp */}
                    {selectedLesson.lessonSubmissions &&
                      selectedLesson.lessonSubmissions.length > 0 && (
                        <div style={{ width: "100%", marginTop: "24px" }}>
                          <Typography.Title level={5}>
                            Các bài đã nộp
                          </Typography.Title>
                          <List
                            itemLayout="horizontal"
                            dataSource={selectedLesson.lessonSubmissions}
                            renderItem={(item: LessonSubmissionItem) => (
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
                                actions={[
                                  <a
                                    key="dl"
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download
                                  </a>,
                                  myLessonSubmit && (
                                    <Button
                                      key="edit"
                                      type="link"
                                      onClick={() => {
                                        setEditingSubmission(item);
                                        setEditNote(item.note || "");
                                        setEditFile(null);
                                        setIsModalOpen(true);
                                      }}
                                    >
                                      Sửa
                                    </Button>
                                  ),
                                ]}
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
                                  {typeof item.totalScore !== "undefined" && (
                                    <Typography.Paragraph
                                      type="secondary"
                                      style={{ margin: 0 }}
                                    >
                                      Score:{" "}
                                      <Tag color="blue">{item.totalScore}</Tag>
                                    </Typography.Paragraph>
                                  )}
                                  {item.submitTime && (
                                    <Typography.Paragraph
                                      type="secondary"
                                      style={{ margin: 0, fontSize: 12 }}
                                    >
                                      Nộp lúc:{" "}
                                      {new Date(item.submitTime).toLocaleString(
                                        "vi-VN"
                                      )}
                                    </Typography.Paragraph>
                                  )}
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}

                    <Modal
                      title="Chỉnh sửa bài nộp"
                      open={isModalOpen}
                      onCancel={() => setIsModalOpen(false)}
                      onOk={handleEditSubmit}
                      okText="Cập nhật"
                      cancelText="Hủy"
                      confirmLoading={editLoading}
                    >
                      {editingSubmission?.fileUrl && (
                        <div style={{ marginBottom: 12 }}>
                          <span>File hiện tại: </span>
                          <a
                            href={editingSubmission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1677ff" }}
                          >
                            Xem / Tải xuống
                          </a>
                        </div>
                      )}

                      <input
                        type="file"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditFile(file);
                        }}
                      />

                      <TextArea
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Chỉnh sửa ghi chú..."
                        style={{ marginTop: 12 }}
                      />
                      {!editFile && (
                        <p style={{ marginTop: 8, color: "red", fontSize: 13 }}>
                          ⚠️ Bạn cần nộp lại file nếu muốn thay đổi. Nếu không
                          chọn file mới, hệ thống sẽ giữ nguyên file cũ.
                        </p>
                      )}
                    </Modal>
                  </Col>
                </Row>
              </>
            )}

            <Divider />

            {/* Quizzes */}
            {selectedLesson?.quizzes?.length ? (
              <>
                <Typography.Title level={5}>Quizzes</Typography.Title>
                <List
                  itemLayout="horizontal"
                  dataSource={selectedLesson.quizzes}
                  renderItem={(quiz: Quiz) => {
                    const latestSubmission = quiz.quizSubmissions?.length
                      ? [...quiz.quizSubmissions]
                          .filter((s) => s.accountId === currentAccountId)
                          .sort(
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
                                <b>Điểm:</b>{" "}
                                <Tag color="blue">
                                  {latestSubmission.totalScore}
                                </Tag>
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
                          {quiz.quizSubmissions?.some(
                            (s) => s.accountId === currentAccountId
                          ) ? (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() =>
                                navigate(`/quiz-review/${quiz.id}`)
                              }
                              style={{
                                borderRadius: "8px",
                                background:
                                  "linear-gradient(90deg, #5fb7ff, rgba(123, 195, 254, 1))",
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
                          ) : null}

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
            ) : null}

            <Button
              type="primary"
              style={{ marginTop: "16px", borderRadius: "6px" }}
              onClick={handleComplete}
              disabled={getDisabled()}
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
