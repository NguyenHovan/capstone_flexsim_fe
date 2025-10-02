import React, { useEffect, useState } from "react";
import {
  Card,
  Collapse,
  Typography,
  Empty,
  Spin,
  Divider,
  Tag,
  Button,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ObjectService } from "../../services/object.service";
import { CodeOutlined, DatabaseOutlined } from "@ant-design/icons";
import { ScenarioService } from "../../services/scenario.service";

const { Panel } = Collapse;
const { Title, Text } = Typography;

type Script = {
  id?: string;
  scriptName: string;
  code: string;
};

type MethodType = {
  id?: string;
  methodName: string;
  description?: string;
  scriptGets?: Script[];
};

type ObjectType = {
  id?: string;
  scenarioId: string;
  objectName: string;
  description?: string;
  methodGets: MethodType[];
};

export default function ScenarioObjectsView() {
  const { id: scenarioId } = useParams<{ id: string }>();
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [scenario, setScenario] = useState<any>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!scenarioId) return;
    fetchObjects();
    fetchScenarioById();
  }, [scenarioId]);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const res = await ObjectService.getObjejctByScenarioId(
        scenarioId as string
      );
      if (Array.isArray(res)) {
        setObjects(res);
      } else {
        setObjects(res?.data ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarioById = async () => {
    setLoading(true);
    try {
      const res = await ScenarioService.getScenarioById(scenarioId as string);
      setScenario(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      padding: 24,
      maxWidth: 1100,
      margin: "0 auto",
      backgroundColor: "#f7f9fc",
      minHeight: "100vh",
    } as React.CSSProperties,
    card: {
      marginBottom: 20,
      borderRadius: 14,
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      border: "1px solid #f0f0f0",
    },
    title: { fontSize: 20, fontWeight: 700, color: "#222" },
    desc: { color: "#555", marginTop: 4, fontSize: 14 },
    scriptCard: {
      marginBottom: 10,
      borderRadius: 8,
      background: "#f8f8f8",
      border: "1px solid #eee",
    },
    codeBlock: {
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      margin: 0,
      padding: "8px 0",
      fontSize: 13,
      color: "#444",
    } as React.CSSProperties,
    panelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        Quay lại
      </Button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "20px",
        }}
      >
        <div>
          {" "}
          <Title level={3} style={{ marginBottom: 8, color: "#1890ff" }}>
            {scenario?.scenarioName}
          </Title>
          <Typography.Paragraph
            italic
            style={{
              color: "#555",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {scenario?.description}
          </Typography.Paragraph>
        </div>
        {scenario?.fileUrl && (
          <a
            href={scenario?.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary">Tải file</Button>
          </a>
        )}
      </div>

      <Title level={3} style={{ marginBottom: 12 }}>
        <DatabaseOutlined style={{ marginRight: 8 }} />
        Danh sách đối tượng
      </Title>
      <Divider />

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : objects.length === 0 ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        objects.map((obj, objIdx) => (
          <Card
            key={obj.id ?? objIdx}
            style={styles.card}
            bodyStyle={{ padding: 18 }}
          >
            <div>
              <div style={styles.title}>{obj.objectName}</div>
              <div style={styles.desc}>{obj.description}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Collapse
                accordion
                ghost
                style={{ backgroundColor: "transparent" }}
              >
                {(obj.methodGets ?? []).map((m, mIdx) => (
                  <Panel
                    header={
                      <div style={styles.panelHeader}>
                        <div>
                          <Text strong>{m.methodName}</Text>
                          <div style={{ color: "#888", fontSize: 13 }}>
                            {m.description}
                          </div>
                        </div>
                        <Tag color="blue">
                          {m.scriptGets?.length || 0} scripts
                        </Tag>
                      </div>
                    }
                    key={m.id ?? mIdx}
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      marginBottom: 8,
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    {m.scriptGets && m.scriptGets.length > 0 ? (
                      m.scriptGets.map((s, sIdx) => (
                        <Card
                          key={s.id ?? sIdx}
                          size="small"
                          title={
                            <span>
                              <CodeOutlined style={{ marginRight: 6 }} />
                              {s.scriptName}
                            </span>
                          }
                          style={styles.scriptCard}
                          bodyStyle={{ padding: 12 }}
                        >
                          <pre style={styles.codeBlock}>{s.code}</pre>
                        </Card>
                      ))
                    ) : (
                      <Text type="secondary">Không có script</Text>
                    )}
                  </Panel>
                ))}
              </Collapse>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
