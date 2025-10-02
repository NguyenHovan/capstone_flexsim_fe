// src/pages/ScenarioObjectsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Collapse,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Divider,
  Empty,
  Spin,
  Typography,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { ObjectService } from "../../../services/object.service";

const { Panel } = Collapse;
const { Title, Text } = Typography;

/** Types */
type Script = {
  id?: string;
  scriptName: string;
  code?: string;
  /** local-only temp id to help React lists */
  _tmpId?: string;
};

type MethodType = {
  id?: string;
  methodName: string;
  description?: string;
  scripts?: Script[];
  _tmpId?: string;
};

type ObjectType = {
  id?: string;
  scenarioId?: string;
  objectName: string;
  description?: string;
  methods: MethodType[];
  _tmpId?: string;
};

/** Helpers */
const makeTmpId = (prefix = "") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Component */
export default function ScenarioObjectsPage() {
  const { id: scenarioId } = useParams<{ id: string }>();
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!scenarioId) return;
    fetchObjects();
  }, [scenarioId]);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const res = await ObjectService.getObjejctByScenarioId(
        scenarioId as string
      );
      const arr = Array.isArray(res) ? res : res?.data ?? [];
      const normalized: ObjectType[] = arr.map((o: any) => ({
        id: o.id,
        scenarioId: o.scenarioId,
        objectName: o.objectName ?? "",
        description: o.description ?? "",
        methods: (o.methodGets ?? []).map((m: any) => ({
          id: m.id,
          methodName: m.methodName ?? "",
          description: m.description ?? "",
          scripts: (m.scriptGets ?? []).map((s: any) => ({
            id: s.id,
            scriptName: s.scriptName ?? "",
            code: s.code ?? "",
            _tmpId: makeTmpId("s"),
          })),
          _tmpId: makeTmpId("m"),
        })),
        _tmpId: makeTmpId("o"),
      }));
      setObjects(normalized);
    } catch (err) {
      console.error(err);
      message.error("Tải dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue({
      objectName: "",
      description: "",
      methods: [
        {
          methodName: "",
          description: "",
          scripts: [{ scriptName: "", code: "" }],
        },
      ],
    });
    setIsModalOpen(true);
  };

  /** Open edit modal prefilled from objects[index] */
  const openEditModal = (index: number) => {
    const obj = objects[index];
    if (!obj) return;
    setEditingIndex(index);
    // map to form values
    form.setFieldsValue({
      objectName: obj.objectName,
      description: obj.description,
      methods: (obj.methods ?? []).map((m) => ({
        id: m.id,
        methodName: m.methodName,
        description: m.description,
        scripts: (m.scripts ?? []).map((s) => ({
          id: s.id,
          scriptName: s.scriptName,
          code: s.code,
        })),
      })),
    });
    setIsModalOpen(true);
  };

  const handleModalFinish = async (vals: any) => {
    setLoading(true);

    try {
      if (editingIndex === null) {
        const payloadForCreate = [
          {
            scenarioId,
            objectName: vals.objectName,
            description: vals.description ?? "",
            methods: (vals.methods ?? []).map((m: any) => ({
              methodName: m.methodName,
              description: m.description ?? "",
              scripts: (m.scripts ?? []).map((s: any) => ({
                scriptName: s.scriptName,
                code: s.code ?? "",
              })),
            })),
          },
        ];

        await ObjectService.createObjectBulk(payloadForCreate);
        message.success("Tạo object thành công!");
      } else {
        // ✅ CẬP NHẬT → PUT /api/object/update-many/:scenarioId
        const oldObj = objects[editingIndex];
        const payloadForUpdate = {
          objectUpdates: [
            {
              id: oldObj.id, // ⚠ phải có id từ server
              objectName: vals.objectName,
              description: vals.description ?? "",
              methodUpdates: (vals.methods ?? []).map((m: any) => ({
                id: m.id, // id method từ server, nếu có
                methodName: m.methodName,
                description: m.description ?? "",
                scriptUpdates: (m.scripts ?? []).map((s: any) => ({
                  id: s.id, // id script từ server, nếu có
                  scriptName: s.scriptName,
                  code: s.code ?? "",
                })),
              })),
            },
          ],
        };

        await ObjectService.updateObjects(
          scenarioId as string,
          payloadForUpdate
        );
        message.success("Cập nhật object thành công!");
      }

      // ✅ Reload lại danh sách sau khi tạo/cập nhật
      setIsModalOpen(false);
      form.resetFields();
      setEditingIndex(null);
      await fetchObjects();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObject = async (objectId?: string, idx?: number) => {
    if (!objectId) {
      if (typeof idx === "number") {
        const next = objects.filter((_, i) => i !== idx);
        setObjects(next);
        message.success("Đã xóa (local).");
      }
      return;
    }
    try {
      setLoading(true);
      await ObjectService.deleteObject(objectId);
      message.success("Xóa object thành công");
      fetchObjects();
    } catch (err) {
      console.error(err);
      message.error("Xóa object thất bại");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      padding: 20,
      maxWidth: 1100,
      margin: "0 auto",
    } as React.CSSProperties,
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    },
    objectTitle: { fontSize: 18, fontWeight: 700 },
    meta: { color: "#666", marginTop: 6 },
    methodHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Chi tiết thành phần
          </Title>
        </div>

        <Space>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={openCreateModal}
            style={{ borderRadius: 8 }}
          >
            Tạo Object
          </Button>

          <Button onClick={fetchObjects} style={{ borderRadius: 8 }}>
            Refresh
          </Button>
        </Space>
      </div>

      <Divider />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : objects.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Empty description="No objects" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {objects.map((obj, objIdx) => (
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}
              key={obj.id ?? obj._tmpId ?? objIdx}
            >
              <Card style={styles.card} bodyStyle={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={styles.objectTitle}>{obj.objectName}</div>
                    <div style={styles.meta}>{obj.description}</div>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ marginLeft: 8, color: "#777" }}>
                        {(obj?.methods ?? []).length} methods
                      </Text>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(objIdx)}
                    />
                    <Popconfirm
                      title="Xác nhận xóa object?"
                      onConfirm={() => handleDeleteObject(obj.id, objIdx)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Collapse accordion>
                    {(obj.methods ?? []).map((m, mIdx) => (
                      <Panel
                        header={
                          <div style={styles.methodHeader}>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {m.methodName || (
                                  <Text type="secondary">No name</Text>
                                )}
                              </div>
                              <div style={{ color: "#777", fontSize: 12 }}>
                                {m.description}
                              </div>
                            </div>
                            <div>
                              <Tag>{m.scripts?.length ?? 0} scripts</Tag>
                            </div>
                          </div>
                        }
                        key={m.id ?? m._tmpId ?? `${objIdx}-${mIdx}`}
                        style={{ borderRadius: 8, marginBottom: 8 }}
                      >
                        <div>
                          {(m.scripts ?? []).length > 0 ? (
                            m.scripts!.map((s, sIdx) => (
                              <Card
                                key={s.id ?? s._tmpId ?? sIdx}
                                type="inner"
                                size="small"
                                style={{ marginBottom: 8 }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 600 }}>
                                      {s.scriptName}
                                    </div>
                                    <pre
                                      style={{
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                      }}
                                    >
                                      {s.code}
                                    </pre>
                                  </div>
                                  <div style={{ color: "#999", fontSize: 12 }}>
                                    {s.id ? "Saved" : "New"}
                                  </div>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <Text type="secondary">No scripts</Text>
                          )}
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          editingIndex === null
            ? "Create Object (local)"
            : "Edit Object (local)"
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalFinish}
          initialValues={{
            methods: [
              {
                methodName: "",
                description: "",
                scripts: [{ scriptName: "", code: "" }],
              },
            ],
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="objectName"
                label="Object name"
                rules={[{ required: true, message: "Nhập tên object" }]}
              >
                <Input placeholder="Object name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="description" label="Description">
                <Input placeholder="Mô tả (tuỳ chọn)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Methods list */}
          <Form.List name="methods">
            {(methodsFields, { add: addMethod, remove: removeMethod }) => (
              <>
                {methodsFields.map((mf) => (
                  <Card key={mf.key} size="small" style={{ marginBottom: 12 }}>
                    <Space
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Form.Item
                          name={[mf.name, "methodName"]}
                          label="Method name"
                          rules={[
                            { required: true, message: "Nhập tên method" },
                          ]}
                        >
                          <Input placeholder="methodName" />
                        </Form.Item>

                        <Form.Item
                          name={[mf.name, "description"]}
                          label="Method description"
                        >
                          <Input placeholder="description" />
                        </Form.Item>

                        {/* Scripts nested */}
                        <Form.List name={[mf.name, "scripts"]}>
                          {(
                            scriptFields,
                            { add: addScript, remove: removeScript }
                          ) => (
                            <>
                              {scriptFields.map((sf) => (
                                <Row
                                  key={sf.key}
                                  gutter={8}
                                  style={{ marginBottom: 8 }}
                                >
                                  <Col span={10}>
                                    <Form.Item
                                      name={[sf.name, "scriptName"]}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Nhập tên script",
                                        },
                                      ]}
                                    >
                                      <Input placeholder="scriptName" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item name={[sf.name, "code"]}>
                                      <Input placeholder="code (optional)" />
                                    </Form.Item>
                                  </Col>
                                  <Col
                                    span={2}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Button
                                      danger
                                      type="text"
                                      onClick={() => removeScript(sf.name)}
                                      style={{ padding: 0 }}
                                    >
                                      Xóa
                                    </Button>
                                  </Col>
                                </Row>
                              ))}

                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => addScript()}
                                  block
                                >
                                  + Thêm script
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </div>

                      <div
                        style={{
                          width: 120,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <Button danger onClick={() => removeMethod(mf.name)}>
                          Xóa method
                        </Button>
                        {/* small helper to add script to this method from outside */}
                        <Button
                          onClick={() =>
                            addMethod({
                              methodName: "",
                              description: "",
                              scripts: [{ scriptName: "", code: "" }],
                            })
                          }
                        >
                          Thêm method
                        </Button>
                      </div>
                    </Space>
                  </Card>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() =>
                      addMethod({
                        methodName: "",
                        description: "",
                        scripts: [{ scriptName: "", code: "" }],
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm method mới
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
