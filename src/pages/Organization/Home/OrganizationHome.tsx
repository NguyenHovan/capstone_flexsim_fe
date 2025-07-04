import React from 'react';
import {
  Card,
  Table,
  Switch,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  BookOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import 'antd/dist/reset.css';
import './OrrganizationHome.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { Title } = Typography;

const workspaceData = [
  {
    key: '1',
    workSpaceName: 'Warehouse Management',
    description: 'Main warehouse simulation for 2024',
    isActive: true,
  },
  {
    key: '2',
    workSpaceName: 'Port Operations',
    description: 'Port operations scenarios',
    isActive: false,
  },
];

const packageData = [
  {
    key: 'basic',
    name: 'Basic',
    price: '$8',
    features: [
      '2 Workspaces',
      '10 Courses (total)',
      '2 Scenes/workspace',
      '50 users included',
      'Standard support',
    ],
    color: '#3b82f6',
    purchasedAt: '2023-06-20',
  },
  {
    key: 'standard',
    name: 'Standard',
    price: '$12',
    features: [
      '6 Workspaces',
      '30 Courses (total)',
      '5 Scenes/workspace',
      '150 users included',
      'Advanced analytics',
    ],
    color: '#eab308',
    purchasedAt: '2024-01-10',
  },
];

const workspaceColumns = [
   { title: 'Workspace Title', dataIndex: 'workSpaceName', key: 'workSpaceName' },
   {
     title: 'Description',
     dataIndex: 'description',
     key: 'description',
     render: (desc: string) => desc || '--',
   },
   {
     title: 'Active',
     dataIndex: 'isActive',
     key: 'isActive',
   
    render: (active: boolean) => (
      <Switch defaultChecked={active} />
    ),
   },
 ];

const chartData = {
  labels: ['Workspaces', 'Users', 'Courses', 'Packages'],
  datasets: [
    {
      label: 'Overview',
      data: [workspaceData.length, 35, 8, packageData.length],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    
      barThickness: 12,
      maxBarThickness: 16,
    },
  ],
};

const chartOptions: ChartOptions<'bar'> = {
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#4b5563',
        font: { size: 12 },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        color: '#4b5563',
        font: { size: 12 },
      },
      grid: {
        color: '#e5e7eb',
      },
    },
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Overview Breakdown',
      font: {
        size: 16,
        weight: 600,      
      },
      color: '#1f2937',
      padding: { bottom: 12 },
    },
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      cornerRadius: 6,
    },
  },
};

export default function HomeOrganization() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Title level={3} className="text-2xl font-semibold text-gray-800 mb-6">
        Overview
      </Title>

      <Row gutter={[16, 16]} justify="space-around">
        {[
          {
            title: 'Workspaces',
            value: workspaceData.length,
            icon: <AppstoreOutlined />,
            color: '#3b82f6',
          },
          {
            title: 'Users',
            value: 35,
            icon: <TeamOutlined />,
            color: '#22c55e',
          },
          {
            title: 'Courses',
            value: 8,
            icon: <BookOutlined />,
            color: '#eab308',
          },
          {
            title: 'Packages',
            value: packageData.length,
            icon: <ContainerOutlined />,
            color: '#ec4899',
          },
        ].map((s, i) => (
          <Col xs={24} sm={12} md={5} key={i}>
            <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition">
              <Statistic
                title={
                  <span className="flex items-center">
                    {s.icon}
                    <span className="ml-2">{s.title}</span>
                  </span>
                }
                value={s.value}
                valueStyle={{ color: s.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="bg-white rounded-xl shadow-sm mt-8 p-4">
        <div
          className="mx-auto"
          style={{ width: '100%', maxWidth: 500, height: 250 }}
        >
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      <Card
        className="bg-white rounded-xl shadow-sm mt-8 p-4"
        title="Workspaces You’re Taking"
      >
        <Table
          columns={workspaceColumns}
          dataSource={workspaceData}
          pagination={false}
          rowKey="key"
          locale={{
            emptyText: (
              <div className="text-center py-6 text-gray-500">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  width={40}
                  className="opacity-30 mb-2 mx-auto"
                />
                No Data
              </div>
            ),
          }}
        />
      </Card>

      <Title
        level={4}
        className="text-xl font-semibold text-gray-800 mt-10 mb-4"
      >
        Organization Subscription
      </Title>
      <Row gutter={[24, 24]}>
        {packageData.map((pkg) => (
          <Col xs={24} sm={12} md={8} key={pkg.key}>
            <Card
              bordered={false}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition"
              headStyle={{ border: 'none' }}
              bodyStyle={{ padding: 20 }}
              style={{ borderTop: `6px solid ${pkg.color}` }}
              title={
                <span
                  style={{ fontSize: 18, fontWeight: 600, color: pkg.color }}
                >
                  {pkg.name}
                </span>
              }
            >
              <div className="text-3xl font-bold mb-4">
                {pkg.price}
                <span className="text-base font-normal text-gray-500 ml-2">
                  /month
                </span>
              </div>
              <ul className="text-gray-600 mb-4">
                {pkg.features.map((f) => (
                  <li key={f} className="mb-2 flex items-center">
                    <span className="text-green-500 mr-2">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Tag
                color={
                  pkg.color === '#3b82f6'
                    ? 'blue'
                    : pkg.color === '#eab308'
                    ? 'gold'
                    : 'red'
                }
              >
                Purchased: {pkg.purchasedAt}
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
