import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  message,
  Radio,
  Tag,
  Alert,
  InputNumber,
} from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  UploadOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { FlexsimService } from "../../services/flexsim.service";

const { Title, Text, Paragraph } = Typography;

const PRESETS = [
  {
    label: "Content.csv",
    url: "https://res.cloudinary.com/dsfrqevvg/raw/upload/v1756923749/LogiSimEdu_File/Content.csv",
  },
  {
    label: "Output.csv",
    url: "https://res.cloudinary.com/dsfrqevvg/raw/upload/v1756923781/LogiSimEdu_File/Output.csv",
  },
];

const DIFF_COLOR: Record<string, string> = {
  easy: "green",
  medium: "orange",
  hard: "red",
};

const mimeFromExt = (ext: string) => {
  const e = ext.toLowerCase();
  if (e === "csv") return "text/csv";
  if (e === "json") return "application/json";
  if (e === "xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (e === "xls") return "application/vnd.ms-excel";
  return "application/octet-stream";
};

const filenameFromUrl = (url: string) => {
  try {
    const clean = url.split("?")[0];
    return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1));
  } catch {
    return `dataset_${Date.now()}`;
  }
};

async function fetchUrlAsFile(url: string): Promise<File> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok)
    throw new Error(`Không tải được file từ URL (HTTP ${res.status})`);
  const blob = await res.blob();
  const name = filenameFromUrl(url);
  const ext = name.includes(".") ? name.split(".").pop()! : "bin";
  const type = mimeFromExt(ext);
  return new File([blob], name, { type });
}

function QuizView({ questions }: { questions: any[] }) {
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
              onChange={(e) =>
                setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
              }
              disabled={done}
              style={{ display: "grid", gap: 10 }}
            >
              {q.options.map((opt: any, idx: number) => {
                const ok = idx === q.correctIndex;
                const isChosen = chosen === idx;
                return (
                  <div key={idx} style={styles.option(isChosen, ok, done)}>
                    <Radio value={idx}>
                      <Text
                        style={{
                          fontWeight: done && ok ? 700 : isChosen ? 600 : 400,
                        }}
                      >
                        {opt}
                      </Text>
                    </Radio>
                    {done &&
                      (ok ? (
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
              ) : q.explanation ? (
                <Alert
                  type={correct ? "success" : "error"}
                  showIcon
                  message={<Text strong>Giải thích</Text>}
                  description={
                    <Paragraph style={{ margin: 0 }}>{q.explanation}</Paragraph>
                  }
                />
              ) : null}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}

export default function QuizFromPresetsPage() {
  const [selectedUrl, setSelectedUrl] = useState<string>(PRESETS[0].url);
  const [maxQuestions, setMaxQuestions] = useState<number | null>(10);
  const [lang] = useState<string>("vi");
  const [uploading, setUploading] = useState(false);
  const [, setPercent] = useState(0);
  const [questions, setQuestions] = useState<any[] | null>(null);

  const resetAll = () => {
    setQuestions(null);
    setPercent(0);
  };

  const start = async () => {
    try {
      setUploading(true);
      setPercent(0);

      const file = await fetchUrlAsFile(selectedUrl);

      const res = await FlexsimService.flexsimUpload(
        file,
        { maxQuestions: maxQuestions ?? undefined, lang, filename: file.name },
        setPercent
      );

      if (!res?.questions || !Array.isArray(res.questions)) {
        throw new Error("Phản hồi không đúng định dạng { questions: [...] }");
      }
      setQuestions(res.questions);
      message.success(`OK • ${res.questions.length} câu hỏi`);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Xử lý thất bại");
    } finally {
      setUploading(false);
    }
  };
  const file = {
    label: "Scene_1.fsm",
    url: "https://res.cloudinary.com/dsfrqevvg/raw/upload/v1756923724/LogiSimEdu_File/Scene_1.fsm",
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
              Use Preset Dataset → Generate Quiz
            </span>
          </Title>
          <Text type="secondary">
            Chọn 1 dataset có sẵn rồi gửi lên backend.
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              href={file.url}
              download={file.label}
            >
              Download {file.label}
            </Button>
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
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text strong>Chọn dataset:</Text>
          <Radio.Group
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            style={{ display: "grid", gap: 8 }}
          >
            {PRESETS.map((p) => (
              <Radio key={p.url} value={p.url}>
                {p.label}
              </Radio>
            ))}
          </Radio.Group>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={8}>
              <Text style={{ display: "block", marginBottom: 4 }}>
                Max questions
              </Text>
              <InputNumber
                min={0}
                placeholder="0 = để BE quyết"
                style={{ width: "100%" }}
                value={maxQuestions as any}
                onChange={(v) => setMaxQuestions(v as number | null)}
              />
            </Col>
          </Row>

          <Space style={{ marginTop: 8 }}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={start}
              loading={uploading}
            >
              Generate from preset
            </Button>
          </Space>
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
