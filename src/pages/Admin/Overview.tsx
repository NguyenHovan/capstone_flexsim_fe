import { Layout, Card, Statistic, Row, Col, Typography } from 'antd';
import { TeamOutlined, UserOutlined, AppstoreOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Content } = Layout;
const { Title } = Typography;

// Giả lập dữ liệu (thay thế bằng API thực tế)
interface DashboardStats {
  totalOrganizations: number;
  totalOrgAdmins: number;
  totalUsers: number;
  totalWorkspaces: number;
  pendingWorkspaces: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalOrgAdmins: 0,
    totalUsers: 0,
    totalWorkspaces: 0,
    pendingWorkspaces: 0,
  });

  // Giả lập fetch dữ liệu
  useEffect(() => {
    const fetchStats = async () => {
      const mockData: DashboardStats = {
        totalOrganizations: 25,
        totalOrgAdmins: 50,
        totalUsers: 1000,
        totalWorkspaces: 75,
        pendingWorkspaces: 10,
      };
      setStats(mockData);
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: ['Organizations', 'OrgAdmins', 'Users', 'Workspaces', 'Pending Workspaces'],
    datasets: [
      {
        label: 'System Overview',
        data: [
          stats.totalOrganizations,
          stats.totalOrgAdmins,
          stats.totalUsers,
          stats.totalWorkspaces,
          stats.pendingWorkspaces,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)', // Blue
          'rgba(34, 197, 94, 0.85)', // Green
          'rgba(234, 179, 8, 0.85)', // Yellow
          'rgba(236, 72, 153, 0.85)', // Pink
          'rgba(239, 68, 68, 0.85)', // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#1f2937',
          padding: 15,
          boxWidth: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        padding: 12,
        borderColor: '#d1d5db',
        borderWidth: 1,
      },
      title: {
        display: true,
        text: 'System Overview Breakdown',
        font: { size: 18, weight: 'bold' },
        color: '#1f2937',
        padding: { top: 10, bottom: 20 },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    cutout: '60%',
  };

  return (
    <Layout style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <style>
        {`
          .ant-card {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
          }

          .ant-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          }

          .statistic-card .ant-statistic-title {
            font-size: 16px;
            color: #595959;
            font-weight: 500;
            display: flex;
            align-items: center;
          }

          .statistic-card .ant-statistic-content {
            font-size: 24px;
            font-weight: 600;
          }

          .dashboard-title {
            margin-bottom: 24px;
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
          }

          .chart-card .ant-card-head {
            border-bottom: 1px solid #e5e7eb;
            padding: 16px;
          }

          .chart-card .ant-card-head-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }

          .chart-container {
            max-width: 600px;
            height: 300px;
            margin: 0 auto;
          }
        `}
      </style>
      <Content className="max-w-5xl mx-auto">
        <Title level={2} className="dashboard-title">
          System Dashboard
        </Title>
        <Row gutter={[16, 16]}>
          {[
            {
              title: 'Organizations',
              value: stats.totalOrganizations,
              icon: <AppstoreOutlined />,
              color: '#3b82f6',
            },
            {
              title: 'OrgAdmins',
              value: stats.totalOrgAdmins,
              icon: <UserOutlined />,
              color: '#22c55e',
            },
            {
              title: 'Users',
              value: stats.totalUsers,
              icon: <TeamOutlined />,
              color: '#eab308',
            },
            {
              title: 'Workspaces',
              value: stats.totalWorkspaces,
              icon: <CheckCircleOutlined />,
              color: '#ec4899',
            },
            {
              title: 'Pending Workspaces',
              value: stats.pendingWorkspaces,
              icon: <CheckCircleOutlined />,
              color: '#ef4444',
            },
          ].map((s, i) => (
            <Col xs={24} sm={12} md={8} lg={4} key={i}>
              <Card
                hoverable
                className="statistic-card"
                style={{ borderTop: `4px solid ${s.color}` }}
              >
                <Statistic
                  title={
                    <span className="statistic-title">
                      {s.icon}
                      <span className="ml-2">{s.title}</span>
                    </span>
                  }
                  value={s.value}
                  valueStyle={{ color: s.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card
              title={<span className="chart-title">System Overview Chart</span>}
              className="chart-card"
            >
              <div className="chart-container">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AdminOverview;