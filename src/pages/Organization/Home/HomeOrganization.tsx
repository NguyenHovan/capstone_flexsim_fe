// Không cần tách CSS nếu không custom riêng
import { Card, Table, Switch, Row, Col, Statistic, Tag, Typography } from "antd";
const { Title } = Typography;

const workspaceData = [
  {
    key: "1",
    workSpaceName: "Warehouse Management",
    description: "Main warehouse simulation for 2024",
    isActive: true,
  },
  {
    key: "2",
    workSpaceName: "Port Operations",
    description: "Port operations scenarios",
    isActive: false,
  },
];
const packageData = [
  {
    key: "basic",
    name: "Basic",
    price: "$8",
    features: [
      "2 Workspaces",
      "10 Courses (total)",
      "2 Scenes/workspace",
      "50 users included",
      "Standard support",
    ],
    color: "#4096ff",
    purchasedAt: "2023-06-20",
  },
  {
    key: "standard",
    name: "Standard",
    price: "$12",
    features: [
      "6 Workspaces",
      "30 Courses (total)",
      "5 Scenes/workspace",
      "150 users included",
      "Advanced analytics",
    ],
    color: "#ffd700",
    purchasedAt: "2024-01-10",
  },
];
const workspaceColumns = [
  { title: "Workspace Title", dataIndex: "workSpaceName", key: "workSpaceName" },
  { title: "Description", dataIndex: "description", key: "description", render: (desc: string) => desc || "--" },
  { title: "Active", dataIndex: "isActive", key: "isActive", render: (isActive: boolean) => <Switch checked={isActive} disabled /> },
];

export default function HomeOrganization() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, marginTop: 0 }}>Overview</Title>
      <Row gutter={32} style={{ marginBottom: 16 }}>
        <Col span={6}><Card bordered={false}><Statistic title="Workspaces" value={workspaceData.length} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Users" value={35} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Courses" value={8} /></Card></Col>
        <Col span={6}><Card bordered={false}><Statistic title="Packages" value={packageData.length} /></Card></Col>
      </Row>
      <Card title="Workspaces You're Taking" style={{ marginTop: 24, marginBottom: 32 }}>
        <Table
          columns={workspaceColumns}
          dataSource={workspaceData}
          pagination={false}
          rowKey="key"
          locale={{
            emptyText: (
              <div style={{ padding: 30 }}>
                <img
                  alt="no-data"
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  width={55}
                  style={{ opacity: 0.3, marginBottom: 10 }}
                />
                <div>No data</div>
              </div>
            ),
          }}
        />
      </Card>
      <Title level={4} style={{ margin: "32px 0 16px" }}>Organization Subscription</Title>
      <Row gutter={24} style={{ marginBottom: 32 }}>
        {packageData.map((pkg) => (
          <Col xs={24} md={8} key={pkg.key}>
            <Card
              bordered={false}
              style={{
                borderTop: `6px solid ${pkg.color}`,
                borderRadius: 12,
                marginBottom: 20,
                minHeight: 320,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              title={<div style={{ fontWeight: 600, fontSize: 18, color: pkg.color }}>{pkg.name}</div>}
              headStyle={{ border: "none" }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: "#333", marginBottom: 8 }}>
                {pkg.price}
                <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 2 }}>/month</span>
              </div>
              <ul style={{ paddingLeft: 18, marginBottom: 14, fontSize: 15 }}>
                {pkg.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Tag
                color={pkg.color === "#4096ff" ? "blue" : pkg.color === "#ffd700" ? "gold" : "red"}
                style={{ fontWeight: 500, fontSize: 13, borderRadius: 6, marginTop: 4 }}
              >
                Purchased on: {pkg.purchasedAt}
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
