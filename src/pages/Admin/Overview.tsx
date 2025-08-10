import { Layout, Card, Row, Col, Typography, Spin, Tag } from 'antd';
import {
  AppstoreOutlined, TeamOutlined, CheckCircleOutlined,
  ShoppingCartOutlined, AimOutlined
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, Tooltip, Legend, BarElement, ArcElement,
  CategoryScale, LinearScale
} from 'chart.js';
import { toast } from 'sonner';
import axiosInstance from '../../api/axiosInstance';
import { API } from '../../api';
import type { ChartOptions } from 'chart.js';
import './overview.css';

ChartJS.register(Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const { Content } = Layout;
const { Title } = Typography;

type AnyItem = Record<string, any>;
type Counters = { users: number; organizations: number; workspaces: number; orders: number; };
type DailyStats = Record<string, Counters>;

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalWorkspaces: number;
  totalOrders: number;
  dailyStats: DailyStats;
}

const EMPTY: Counters = { users: 0, organizations: 0, workspaces: 0, orders: 0 };

// helpers
const getCreatedDate = (it: AnyItem): string | null => {
  const raw =
    it?.createdAt ?? it?.created_at ?? it?.createdDate ?? it?.created_date ??
    it?.created_on ?? it?.createdOn ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(+d)) return null;
  return d.toISOString().slice(0, 10);
};
const safeList = (d: any): AnyItem[] =>
  Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.data) ? d.data : [];
const safeCount = (d: any): number =>
  Array.isArray(d) ? d.length :
  Array.isArray(d?.items) ? d.items.length :
  Array.isArray(d?.data) ? d.data.length :
  (typeof d?.total === 'number' ? d.total : 0);
const addDaily = (daily: DailyStats, list: AnyItem[], key: keyof Counters) => {
  list.forEach((it) => {
    const date = getCreatedDate(it); if (!date) return;
    if (!daily[date]) daily[date] = { ...EMPTY };
    daily[date][key] += 1;
  });
};
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const pct = (curr: number, prev: number) =>
  (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100));

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0, totalUsers: 0, totalWorkspaces: 0, totalOrders: 0, dailyStats: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [orgRes, userRes, wsRes, orderRes] = await Promise.all([
          axiosInstance.get(API.GET_ALL_ORGANIZATION),
          axiosInstance.get(API.GET_ALL_ACCOUNT),
          axiosInstance.get(API.GET_ALL_WORKSPACE),
          axiosInstance.get(API.GET_ALL_ORDER),
        ]);

        const orgList = safeList(orgRes.data);
        const userList = safeList(userRes.data);
        const wsList = safeList(wsRes.data);
        const orderList = safeList(orderRes.data);

        const daily: DailyStats = {};
        addDaily(daily, userList, 'users');
        addDaily(daily, orgList, 'organizations');
        addDaily(daily, wsList, 'workspaces');
        addDaily(daily, orderList, 'orders');

        const sorted = Object.fromEntries(
          Object.entries(daily).sort(([a], [b]) => (a < b ? -1 : 1))
        ) as DailyStats;

        if (!mounted) return;
        setStats({
          totalOrganizations: safeCount(orgRes.data),
          totalUsers: safeCount(userRes.data),
          totalWorkspaces: safeCount(wsRes.data),
          totalOrders: safeCount(orderRes.data),
          dailyStats: sorted
        });
      } catch (e) {
        console.error(e);
        toast.error('Không tải được dữ liệu dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ===== cards (WoW 7d) =====
  const dayLabels = useMemo(() => Object.keys(stats.dailyStats), [stats.dailyStats]);
  const last7IdxStart = Math.max(0, dayLabels.length - 7);
  const prev7IdxStart = Math.max(0, dayLabels.length - 14);
  const last7 = dayLabels.slice(last7IdxStart).map(d => stats.dailyStats[d]);
  const prev7 = dayLabels.slice(prev7IdxStart, last7IdxStart).map(d => stats.dailyStats[d]);
  const wow = {
    users: pct(sum(last7.map(x => x.users)), sum(prev7.map(x => x.users))),
    organizations: pct(sum(last7.map(x => x.organizations)), sum(prev7.map(x => x.organizations))),
    workspaces: pct(sum(last7.map(x => x.workspaces)), sum(prev7.map(x => x.workspaces))),
    orders: pct(sum(last7.map(x => x.orders)), sum(prev7.map(x => x.orders))),
  };

  const cards = [
    { key: 'users', title: 'Total Users', icon: <TeamOutlined />, value: stats.totalUsers, percent: wow.users, className: 'metric--peach' },
    { key: 'organizations', title: 'Total Organizations', icon: <AppstoreOutlined />, value: stats.totalOrganizations, percent: wow.organizations, className: 'metric--violet' },
    { key: 'workspaces', title: 'Total Workspaces', icon: <CheckCircleOutlined />, value: stats.totalWorkspaces, percent: wow.workspaces, className: 'metric--teal' },
    { key: 'orders', title: 'Total Orders', icon: <ShoppingCartOutlined />, value: stats.totalOrders, percent: wow.orders, className: 'metric--blue' },
  ] as const;

  // ===== MONTHLY aggregates (YYYY-MM -> totals) =====
  const monthlyMap: Record<string, Counters> = useMemo(() => {
    const m: Record<string, Counters> = {};
    Object.entries(stats.dailyStats).forEach(([date, c]) => {
      const month = date.slice(0, 7);
      if (!m[month]) m[month] = { users: 0, organizations: 0, workspaces: 0, orders: 0 };
      m[month].users += c.users;
      m[month].organizations += c.organizations;
      m[month].workspaces += c.workspaces;
      m[month].orders += c.orders;
    });
    return Object.fromEntries(Object.entries(m).sort(([a], [b]) => (a < b ? -1 : 1)));
  }, [stats.dailyStats]);

  const monthLabels = Object.keys(monthlyMap);
  const monthlyUsers = monthLabels.map(m => monthlyMap[m].users);
  const monthlyOrgs  = monthLabels.map(m => monthlyMap[m].organizations);
  const monthlyWs    = monthLabels.map(m => monthlyMap[m].workspaces);
  const monthlyOrd   = monthLabels.map(m => monthlyMap[m].orders);

  // ===== CHARTS =====
  // (2) BAR theo THÁNG — mỗi tháng là nhóm cột Users/Orgs/WS/Orders
  const monthlyBarData = useMemo(() => ({
    labels: monthLabels,
    datasets: [
      { label: 'Users',         data: monthlyUsers, backgroundColor: '#60a5fa', borderRadius: 8, borderSkipped: false, maxBarThickness: 30 },
      { label: 'Organizations', data: monthlyOrgs,  backgroundColor: '#f97316', borderRadius: 8, borderSkipped: false, maxBarThickness: 30 },
      { label: 'Workspaces',    data: monthlyWs,    backgroundColor: '#f472b6', borderRadius: 8, borderSkipped: false, maxBarThickness: 30 },
      { label: 'Orders',        data: monthlyOrd,   backgroundColor: '#34d399', borderRadius: 8, borderSkipped: false, maxBarThickness: 30 },
    ]
  }), [monthLabels.join(','), monthlyUsers.join(','), monthlyOrgs.join(','), monthlyWs.join(','), monthlyOrd.join(',')]);

  const monthlyBarOpts: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { labels: { usePointStyle: true, boxWidth: 10 } },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)', padding: 12, cornerRadius: 8,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}` }
      }
    },
    scales: {
      x: { stacked: false, grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(148,163,184,.25)' } }
    }
  };

  // (3) DOUGHNUT % theo THÁNG MỚI NHẤT — tỉ trọng các thực thể
  const lastMonthKey = monthLabels[monthLabels.length - 1];
  const latest = lastMonthKey ? monthlyMap[lastMonthKey] : { users: 0, organizations: 0, workspaces: 0, orders: 0 };
  const totalLatest = (latest.users + latest.organizations + latest.workspaces + latest.orders) || 1;

  const shareData = useMemo(() => ({
    labels: ['Users', 'Organizations', 'Workspaces', 'Orders'],
    datasets: [{
      data: [
        latest.users,
        latest.organizations,
        latest.workspaces,
        latest.orders
      ],
      backgroundColor: ['#60a5fa', '#f97316', '#f472b6', '#34d399'],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
      cutout: '60%'
    }]
  }), [latest.users, latest.organizations, latest.workspaces, latest.orders]);

  const shareOpts: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed as number;
            const percent = Math.round((val / totalLatest) * 100);
            return ` ${ctx.label}: ${val} (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <Layout className="purple-root">
      <Content className="purple-container">
        <div className="purple-header">
          <Title level={4} className="purple-title"><AimOutlined /> Dashboard</Title>
          <span className="purple-overview">Overview</span>
        </div>

        <Spin spinning={loading}>
          {/* === TOP TOTALS === */}
          <Row gutter={[16, 16]} className="metric-row equal-cards">
            {cards.map((c) => (
              <Col xs={24} sm={12} lg={6} key={c.key}>
                <Card className={`metric-card ${c.className} metric-equal`} bordered={false}>
                  <div className="metric-top">
                    <div className="metric-icon">{c.icon}</div>
                    <div className="metric-title">{c.title}</div>
                  </div>
                  <div className="metric-value">{c.value.toLocaleString()}</div>
                  <div className="metric-trend">
                    <Tag color={c.percent >= 0 ? 'green' : 'red'}>
                      WoW: {c.percent >= 0 ? 'Up' : 'Down'} {Math.abs(c.percent)}%
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* === CHARTS === */}
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} lg={16}>
              <Card className="panel-card" bordered={false}>
                <div className="panel-title">Monthly Totals by Month</div>
                <div className="panel-chart">
                  <Bar data={monthlyBarData} options={monthlyBarOpts} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="panel-card" bordered={false}>
                <div className="panel-title">Entity Share (%) — {lastMonthKey || 'N/A'}</div>
                <div className="panel-chart donut">
                  <Doughnut data={shareData} options={shareOpts} />
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      </Content>
    </Layout>
  );
};

export default AdminOverview;
