import React, { useMemo, useState } from "react";
import {
  Upload,
  Button,
  Card,
  Typography,
  Space,
  message,
  Row,
  Col,
  Tag,
  Radio,
  Alert,
  Progress,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { FlexsimService } from "../../services/flexsim.service";

const { Title, Text, Paragraph } = Typography;

type Difficulty = "easy" | "medium" | "hard" | string;

type QuizQuestion = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  topic?: string;
  difficulty?: Difficulty;
  explanation?: string;
};

const DIFF_COLOR: Record<string, string> = {
  easy: "green",
  medium: "orange",
  hard: "red",
};

function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number | undefined>>(
    {}
  );
  const [locked, setLocked] = useState<Record<string, boolean>>({});

  const score = useMemo(
    () =>
      questions.reduce(
        (s, q) =>
          s + (locked[q.id] && answers[q.id] === q.correctIndex ? 1 : 0),
        0
      ),
    [answers, locked, questions]
  );

  const styles = {
    card: { borderRadius: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.06)" },
    stem: { fontWeight: 600, fontSize: 16 },
    option: (
      chosen: boolean,
      ok: boolean,
      done: boolean
    ): React.CSSProperties => ({
      padding: "8px 12px",
      borderRadius: 10,
      background: chosen
        ? ok && done
          ? "rgba(34,197,94,0.12)"
          : done
          ? "rgba(239,68,68,0.08)"
          : "rgba(99,102,241,0.08)"
        : done && ok
        ? "rgba(34,197,94,0.08)"
        : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }),
  } as const;

  const onPick = (qid: string, idx: number) =>
    setAnswers((p) => ({ ...p, [qid]: idx }));
  const onCheck = (qid: string) => setLocked((p) => ({ ...p, [qid]: true }));

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <Card style={{ ...styles.card }} bodyStyle={{ padding: 16 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text strong>Questions: {questions.length}</Text>
          <Text strong>
            Score: {score}/{questions.length}
          </Text>
        </Space>
      </Card>

      {questions.map((q, i) => {
        const chosen = answers[q.id];
        const done = !!locked[q.id];
        const correct = done && chosen === q.correctIndex;

        return (
          <Card
            key={q.id}
            style={styles.card}
            title={
              <Space wrap>
                <Text>Q{i + 1}.</Text>
                <Text style={styles.stem as any}>{q.stem}</Text>
                {q.topic && <Tag color="blue">{q.topic}</Tag>}
                {q.difficulty && (
                  <Tag color={DIFF_COLOR[q.difficulty] || "default"}>
                    {q.difficulty}
                  </Tag>
                )}
              </Space>
            }
            extra={
              done ? (
                correct ? (
                  <Space>
                    <CheckCircleTwoTone twoToneColor="#22c55e" />
                    <Text strong style={{ color: "#16a34a" }}>
                      Correct
                    </Text>
                  </Space>
                ) : (
                  <Space>
                    <CloseCircleTwoTone twoToneColor="#ef4444" />
                    <Text strong style={{ color: "#ef4444" }}>
                      Incorrect
                    </Text>
                  </Space>
                )
              ) : null
            }
          >
            <Radio.Group
              value={chosen}
              onChange={(e: any) => onPick(q.id, Number(e.target.value))}
              disabled={done}
              style={{ display: "grid", gap: 10 }}
            >
              {q.options.map((opt: string, idx: number) => {
                const isCorrect = idx === q.correctIndex;
                const isChosen = chosen === idx;
                return (
                  <div
                    key={idx}
                    style={styles.option(isChosen, isCorrect, done)}
                  >
                    <Radio value={idx}>
                      <Text
                        style={{
                          fontWeight:
                            done && isCorrect ? 700 : isChosen ? 600 : 400,
                        }}
                      >
                        {opt}
                      </Text>
                    </Radio>
                    {done &&
                      (isCorrect ? (
                        <CheckCircleTwoTone twoToneColor="#22c55e" />
                      ) : isChosen ? (
                        <CloseCircleTwoTone twoToneColor="#ef4444" />
                      ) : (
                        <span />
                      ))}
                  </div>
                );
              })}
            </Radio.Group>

            <Space style={{ marginTop: 12 }}>
              {!done ? (
                <Button
                  type="primary"
                  onClick={() => onCheck(q.id)}
                  disabled={chosen === undefined}
                >
                  Check
                </Button>
              ) : (
                q.explanation && (
                  <Alert
                    type={correct ? "success" : "error"}
                    showIcon
                    message={<Text strong>Giải thích</Text>}
                    description={
                      <Paragraph style={{ margin: 0 }}>
                        {q.explanation}
                      </Paragraph>
                    }
                  />
                )
              )}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}

export default function QuizUploadPage() {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);

  const beforeUpload = (file: File) => {
    const okType =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      [".xlsx", ".xls", ".csv", ".json"].some((ext) => file.name.endsWith(ext));
    if (!okType) {
      message.error("Vui lòng chọn file Excel/CSV/JSON đúng định dạng");
      return Upload.LIST_IGNORE as any;
    }
    const okSize = file.size / 1024 / 1024 < 20;
    if (!okSize) {
      message.error("File quá lớn (>20MB)");
      return Upload.LIST_IGNORE as any;
    }
    setFileList([file]);
    return false;
  };

  const doUpload = async () => {
    const file = fileList[0];
    if (!file) return message.warning("Chọn 1 file để upload");

    setUploading(true);
    setProgress(0);
    try {
      const res = await FlexsimService.flexsimUpload(file as File);
      if (!res?.questions || !Array.isArray(res.questions)) {
        throw new Error("Phản hồi không đúng định dạng { questions: [...] }");
      }
      setQuestions(res.questions as QuizQuestion[]);
      message.success(`Tải lên thành công • ${res.questions.length} câu hỏi`);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const resetAll = () => {
    setFileList([]);
    setQuestions(null);
    setProgress(0);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <span
              style={{
                background: "linear-gradient(90deg,#6366f1,#22c55e)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Upload FlexSim → Generate Quiz
            </span>
          </Title>
          <Text type="secondary">
            Tải file mô phỏng (Excel/CSV), hệ thống sinh câu hỏi tự động.
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetAll}
              disabled={uploading}
            >
              Reset
            </Button>
          </Space>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
      >
        <Upload.Dragger
          multiple={false}
          accept=".xlsx,.xls,.csv,.json"
          beforeUpload={beforeUpload}
          fileList={fileList as any} // giữ nguyên hành vi hiện tại
          onRemove={() => {
            setFileList([]);
            return true;
          }}
          itemRender={(originNode) => originNode}
          style={{ borderRadius: 12 }}
        >
          <p className="ant-upload-drag-icon">
            <FileExcelOutlined />
          </p>
          <p className="ant-upload-text">Kéo thả hoặc bấm để chọn file</p>
          <p className="ant-upload-hint">
            Hỗ trợ: .xlsx, .xls, .csv, .json • Tối đa 20MB
          </p>
        </Upload.Dragger>

        <Space style={{ marginTop: 12 }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={doUpload}
            loading={uploading}
            disabled={!fileList.length}
          >
            Upload & Generate
          </Button>
          {uploading && (
            <div style={{ minWidth: 220 }}>
              <Progress percent={progress} status="active" />
            </div>
          )}
        </Space>
      </Card>

      {questions && (
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          }}
          bodyStyle={{ padding: 16 }}
          title={`Kết quả: ${questions.length} câu hỏi`}
        >
          <QuizView questions={questions} />
        </Card>
      )}
    </div>
  );
}
