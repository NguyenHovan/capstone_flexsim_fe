// src/pages/organizationAdmin/OrganizationAdminOverview.tsx
import { Layout, Card, Row, Col, Typography, Spin, Tag } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  AimOutlined
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, Tooltip, Legend, BarElement, ArcElement,
  CategoryScale, LinearScale
} from 'chart.js';
import axiosInstance from '../../api/axiosInstance';
import { API } from '../../api';
import type { ChartOptions } from 'chart.js';
import './organizationAdminOverview.css';

ChartJS.register(Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const { Content } = Layout;
const { Title } = Typography;

type AnyItem = Record<string, any>;
type Counters = { users: number; workspaces: number; orders: number };
type DailyStats = Record<string, Counters>;
const EMPTY: Counters = { users: 0, workspaces: 0, orders: 0 };

const getCurrentOrgId = () => {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null')?.organizationId || ''; }
  catch { return ''; }
};

const withId = (base: string, id: string) => `${base}${base.endsWith('/') ? '' : '/'}${id}`;

const getOrgIdFromItem = (it: AnyItem) =>
  it?.organizationId ?? it?.orgId ?? it?.organizationID ?? null;

const getCreatedDate = (it: AnyItem): string | null => {
  const raw =
    it?.createdAt ?? it?.created_at ??
    it?.createdDate ?? it?.created_date ??
    it?.created_on ?? it?.createdOn ?? null;

  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(+d) ? null : d.toISOString().slice(0, 10);
};

const safeList = (d: any): AnyItem[] =>
  Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.data) ? d.data : [];

const filterByOrgIfPresent = (list: AnyItem[], orgId: string) => {
  const hasOrgField = list.some(x => getOrgIdFromItem(x) != null);
  return hasOrgField ? list.filter(x => getOrgIdFromItem(x) === orgId) : list;
};

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

const OrganizationAdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({});
  const [totals, setTotals] = useState<Counters>(EMPTY);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const orgId = getCurrentOrgId();
      if (!orgId) return;
      setLoading(true);
      try {
        const [accRes, wsRes, ordRes] = await Promise.all([
          axiosInstance.get(withId(API.GET_ALL_ACCOUNT_ORGID, orgId)),
          axiosInstance.get(withId(API.GET_ALL_WORKSPACE_ORGID, orgId)),
          axiosInstance.get(API.GET_ALL_ORDER),
        ]);

        const users      = safeList(accRes.data);
        const workspaces = safeList(wsRes.data);
        const ordersAll  = safeList(ordRes.data);
        const orders     = filterByOrgIfPresent(ordersAll, orgId);

        if (!mounted) return;

        setTotals({
          users: users.length,
          workspaces: workspaces.length,
          orders: orders.length
        });

        const daily: DailyStats = {};
        addDaily(daily, users,      'users');
        addDaily(daily, workspaces, 'workspaces');
        addDaily(daily, orders,     'orders');

        const sorted = Object.fromEntries(
          Object.entries(daily).sort(([a], [b]) => (a < b ? -1 : 1))
        ) as DailyStats;
        setDailyStats(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // week-over-week %
  const dayLabels = useMemo(() => Object.keys(dailyStats), [dailyStats]);
  const last7IdxStart = Math.max(0, dayLabels.length - 7);
  const prev7IdxStart = Math.max(0, dayLabels.length - 14);
  const last7 = dayLabels.slice(last7IdxStart).map(d => dailyStats[d]);
  const prev7 = dayLabels.slice(prev7IdxStart, last7IdxStart).map(d => dailyStats[d]);
  const wow = {
    users:      pct(sum(last7.map(x => x.users)),      sum(prev7.map(x => x.users))),
    workspaces: pct(sum(last7.map(x => x.workspaces)), sum(prev7.map(x => x.workspaces))),
    orders:     pct(sum(last7.map(x => x.orders)),     sum(prev7.map(x => x.orders))),
  };

  // Monthly aggregates
  const monthlyMap: Record<string, Counters> = useMemo(() => {
    const m: Record<string, Counters> = {};
    Object.entries(dailyStats).forEach(([date, c]) => {
      const month = date.slice(0, 7);
      if (!m[month]) m[month] = { ...EMPTY };
      m[month].users      += c.users;
      m[month].workspaces += c.workspaces;
      m[month].orders     += c.orders;
    });
    return Object.fromEntries(Object.entries(m).sort(([a], [b]) => (a < b ? -1 : 1)));
  }, [dailyStats]);

  const monthLabels = Object.keys(monthlyMap);
  const mUsers   = monthLabels.map(m => monthlyMap[m].users);
  const mWs      = monthLabels.map(m => monthlyMap[m].workspaces);
  const mOrders  = monthLabels.map(m => monthlyMap[m].orders);

  // Charts
  const monthlyBarData = useMemo(() => ({
    labels: monthLabels,
    datasets: [
      { label: 'Users',      data: mUsers,   backgroundColor: '#60a5fa', borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
      { label: 'Workspaces', data: mWs,      backgroundColor: '#10b981', borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
      { label: 'Orders',     data: mOrders,  backgroundColor: '#f97316', borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
    ]
  }), [monthLabels.join(','), mUsers.join(','), mWs.join(','), mOrders.join(',')]);

  const monthlyBarOpts: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { labels: { usePointStyle: true, boxWidth: 10 } },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        padding: 12,
        cornerRadius: 8,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}` }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(148,163,184,.25)' } }
    }
  };

  const lastMonthKey = monthLabels[monthLabels.length - 1];
  const latest = lastMonthKey ? monthlyMap[lastMonthKey] : EMPTY;
  const totalLatest = latest.users + latest.workspaces + latest.orders || 1;

  const shareData = useMemo(() => ({
    labels: ['Users', 'Workspaces', 'Orders'],
    datasets: [{
      data: [latest.users, latest.workspaces, latest.orders],
      backgroundColor: ['#60a5fa', '#10b981', '#f97316'],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
      cutout: '62%'
    }]
  }), [latest.users, latest.workspaces, latest.orders]);

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

  const cards = [
    { key: 'users',      title: 'Total Users',      icon: <TeamOutlined />,        value: totals.users,      percent: wow.users,      className: 'metric--peach' },
    { key: 'workspaces', title: 'Total Workspaces', icon: <CheckCircleOutlined />, value: totals.workspaces, percent: wow.workspaces, className: 'metric--teal' },
    { key: 'orders',     title: 'Total Orders',     icon: <ShoppingCartOutlined />,value: totals.orders,     percent: wow.orders,     className: 'metric--blue' },
  ] as const;

  return (
    <Layout className="purple-root">
      <Content className="purple-container">
        <div className="purple-header">
          <Title level={4} className="purple-title"><AimOutlined /> Dashboard</Title>
          <span className="purple-overview">Overview</span>
        </div>

        <Spin spinning={loading}>
          {/* TOP TOTALS */}
          <Row gutter={[20, 20]} className="metric-row equal-cards">
            {cards.map((c) => (
              <Col xs={24} sm={12} lg={8} key={c.key}>
                <Card className={`metric-card ${c.className} metric-equal`} variant={undefined}>
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

          {/* CHARTS */}
          <Row gutter={[20, 20]} className="charts-row">
            <Col xs={24} lg={16}>
              <Card className="panel-card" variant={undefined}>
                <div className="panel-title">Monthly Totals by Month</div>
                <div className="panel-chart">
                  <Bar data={monthlyBarData} options={monthlyBarOpts} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="panel-card" variant={undefined}>
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

export default OrganizationAdminOverview;
