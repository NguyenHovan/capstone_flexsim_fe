import {
  Layout, Card, Row, Col, Typography, Spin, Tag, Table,
  DatePicker, Segmented, Button, Space
} from 'antd';
import {
  TeamOutlined, CheckCircleOutlined, ShoppingCartOutlined, AimOutlined,
  BookOutlined, UserOutlined, ReloadOutlined, FilterOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/vi'; // <-- Thêm locale tiếng Việt

import axiosInstance from '../../api/axiosInstance';
import { API } from '../../api';
import { OrderService } from '../../services/order.service';

import './organizationAdminOverview.css';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.locale('vi'); // <-- Bật tiếng Việt cho định dạng ngày/thứ
ChartJS.register(Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const { Content } = Layout;
const { Title } = Typography;

type AnyItem = Record<string, any>;
type Granularity = 'week' | 'month' | 'year';

type Counters = {
  students: number;
  instructors: number;
  workspaces: number;
  courses: number;
  orders: number; // tổng đơn của account hiện tại (mọi trạng thái)
};

// DAILY có thêm 'courses' để tính WoW
type DailyStats = Record<string, Pick<Counters, 'students' | 'instructors' | 'workspaces' | 'orders' | 'courses'>>;

const EMPTY: Counters = { students: 0, instructors: 0, workspaces: 0, courses: 0, orders: 0 };
const EMPTY_DAILY: Pick<Counters, 'students' | 'instructors' | 'workspaces' | 'orders' | 'courses'> = {
  students: 0, instructors: 0, workspaces: 0, orders: 0, courses: 0
};

// Màu dùng cho bar + donut
const ADMIN_COLORS = {
  teal: '#2ED3C6',   // Học viên
  navy: '#223A54',   // Giảng viên
  gray: '#E3E7EF',   // Không gian
  cyan: '#7AD6E0',   // Đơn hàng
};

const VI_DATASET_LABELS = {
  students: 'Học viên',
  instructors: 'Giảng viên',
  workspaces: 'Không gian làm việc',
  orders: 'Đơn hàng',
};

type OrderRow = {
  id: string;
  orderCode?: number | string | null;
  status?: 0 | 1 | 2; // 1=PAID
  createdAt?: string;
  orderTime?: string;
  price?: number;
  totalPrice?: number;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
};

const getCurrent = () => {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null') || {}; }
  catch { return {}; }
};
const getCurrentOrgId = () => String(getCurrent()?.organizationId || '');
const getCurrentAccountId = () => String(getCurrent()?.id || '');
const withId = (base: string, id: string) => `${base}${base.endsWith('/') ? '' : '/'}${id}`;

const getOrgIdFromItem = (it: AnyItem) =>
  it?.organizationId ?? it?.orgId ?? it?.organizationID ?? null;

const getCreatedDate = (it: AnyItem): string | null => {
  const raw =
    it?.createdAt ?? it?.created_at ?? it?.createdDate ?? it?.created_date ??
    it?.created_on ?? it?.createdOn ?? it?.orderTime ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(+d)) return null;
  // về local ISO yyyy-mm-dd để gom theo ngày
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
};

const safeList = (d: any): AnyItem[] =>
  Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.data) ? d.data : [];

const filterByOrgIfPresent = (list: AnyItem[], orgId: string) => {
  const hasOrgField = list.some(x => getOrgIdFromItem(x) != null);
  return hasOrgField ? list.filter(x => String(getOrgIdFromItem(x)) === String(orgId)) : list;
};

const addDaily = (daily: DailyStats, list: AnyItem[], key: keyof DailyStats[string]) => {
  list.forEach((it) => {
    const date = getCreatedDate(it); if (!date) return;
    if (!daily[date]) daily[date] = { ...EMPTY_DAILY };
    daily[date][key] += 1;
  });
};

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const pct = (curr: number, prev: number) =>
  (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100));

// hiển thị phần trăm ±n%
const PctTag: React.FC<{ value: number }> = ({ value }) => {
  const color = value > 0 ? 'green' : value < 0 ? 'red' : 'default';
  const text = `${value > 0 ? '+' : ''}${value}%`;
  return <Tag color={color}>{text}</Tag>;
};

const buildDateRange = (start: Dayjs, end: Dayjs) => {
  const out: string[] = [];
  let d = start.startOf('day');
  const last = end.startOf('day');
  while (d.isBefore(last) || d.isSame(last, 'day')) {
    out.push(d.format('YYYY-MM-DD'));
    d = d.add(1, 'day');
  }
  return out;
};
const monthsInYear = (y: number) =>
  Array.from({ length: 12 }, (_, i) => dayjs().year(y).month(i).format('YYYY-MM'));

/** suy luận field “người thanh toán” trong Order */
const getPayerAccountId = (o: AnyItem): string | null => {
  const v =
    o?.paidByAccountId ?? o?.payerAccountId ?? o?.accountId ?? o?.userId ??
    o?.createdByAccountId ?? o?.createdBy ?? o?.payer?.id ?? null;
  return v != null ? String(v) : null;
};

const OrganizationAdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<Counters>(EMPTY);
  const [dailyStats, setDailyStats] = useState<DailyStats>({});

  // Bộ lọc: Tuần/Tháng/Năm
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [anchorDate, setAnchorDate] = useState<Dayjs>(dayjs());

  // Đơn gần đây (đã thanh toán bởi tài khoản này)
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [planNameById, setPlanNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const orgId = getCurrentOrgId();
    if (!orgId) return;

    (async () => {
      setLoading(true);
      try {
        const myId = getCurrentAccountId();

        // Accounts (org)
        const accRes = await axiosInstance.get(withId(API.GET_ALL_ACCOUNT_ORGID, orgId));
        const allAcc = safeList(accRes.data);
        const instructors = allAcc.filter(a => Number(a?.roleId ?? a?.roleID) === 3);
        const students    = allAcc.filter(a => Number(a?.roleId ?? a?.roleID) === 4);

        // Workspaces (org)
        const wsRes = await axiosInstance.get(withId(API.GET_ALL_WORKSPACE_ORGID, orgId));
        const workspaces = safeList(wsRes.data);

        // Courses (org)
        let courses: AnyItem[] = [];
        try {
          const cResOrg = await axiosInstance.get(withId((API as any).GET_ALL_COURSE_ORGID, orgId));
          courses = safeList(cResOrg.data);
        } catch {
          try {
            const cResAll = await axiosInstance.get((API as any).GET_ALL_COURSE);
            courses = filterByOrgIfPresent(safeList(cResAll.data), orgId);
          } catch { courses = []; }
        }

        // Orders (org + all for my total)
        const ordRes = await axiosInstance.get(API.GET_ALL_ORDER);
        const ordersAll = safeList(ordRes.data);
        const ordersOrg = filterByOrgIfPresent(ordersAll, orgId);

        // Tổng đơn của CHÍNH ACCOUNT hiện tại (mọi trạng thái)
        const myOrdersAll = ordersAll.filter((o: any) => getPayerAccountId(o) === myId);

        if (!mounted) return;

        // Tổng quan
        setTotals({
          students: students.length,
          instructors: instructors.length,
          workspaces: workspaces.length,
          courses: courses.length,
          orders: myOrdersAll.length,
        });

        // Thống kê theo ngày
        const daily: DailyStats = {};
        addDaily(daily, students,    'students');
        addDaily(daily, instructors, 'instructors');
        addDaily(daily, workspaces,  'workspaces');
        addDaily(daily, ordersOrg,   'orders');
        addDaily(daily, courses,     'courses');

        const sorted = Object.fromEntries(
          Object.entries(daily).sort(([a], [b]) => (a < b ? -1 : 1))
        ) as DailyStats;
        setDailyStats(sorted);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Đơn gần đây (đã thanh toán bởi tài khoản này)
    (async () => {
      const myId = getCurrentAccountId();
      if (!myId) return;
      setLoadingOrders(true);
      try {
        const [plansRes, orders] = await Promise.all([
          axiosInstance.get(API.GET_ALL_SUBCRIPTION),
          OrderService.getAll()
        ]);

        const plans = Array.isArray(plansRes.data?.data)
          ? plansRes.data.data
          : Array.isArray(plansRes.data)
          ? plansRes.data
          : [];
        const map: Record<string, string> = {};
        plans.forEach((p: any) => {
          const pid = String(p?.id ?? p?.planId ?? p?._id ?? '');
          const pname = String(p?.name ?? p?.planName ?? p?.title ?? p?.displayName ?? p?.code ?? '');
          if (pid) map[pid] = pname;
        });
        if (mounted) setPlanNameById(map);

        const rows: OrderRow[] = (orders ?? [])
          .filter((o: any) => {
            const payer = getPayerAccountId(o);
            return payer && payer === myId && Number(o?.status) === 1; // chỉ PAID cho bảng
          })
          .map((o: any) => {
            const pid = o?.subscriptionId ?? o?.subscriptionPlanId ?? o?.subcriptionPlanId ?? null;
            return {
              id: o.id,
              orderCode: o.orderCode ?? o.code ?? null,
              status: o.status,
              createdAt: o.createdAt,
              orderTime: o.orderTime,
              price: o.price,
              totalPrice: o.totalPrice ?? o.price,
              subscriptionPlanId: pid ?? undefined,
              subscriptionPlanName: (pid && map[String(pid)]) || o.subscriptionPlanName,
            };
          });

        rows.sort(
          (a, b) =>
            new Date(b.createdAt ?? b.orderTime ?? 0).getTime() -
            new Date(a.createdAt ?? a.orderTime ?? 0).getTime()
        );

        if (mounted) setRecentOrders(rows.slice(0, 8));
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // WoW %
  const dayLabelsAll = useMemo(() => Object.keys(dailyStats), [dailyStats]);
  const last7IdxStart = Math.max(0, dayLabelsAll.length - 7);
  const prev7IdxStart = Math.max(0, dayLabelsAll.length - 14);
  const last7 = dayLabelsAll.slice(last7IdxStart).map(d => dailyStats[d]);
  const prev7 = dayLabelsAll.slice(prev7IdxStart, last7IdxStart).map(d => dailyStats[d]);
  const wow = {
    students:    pct(sum(last7.map(x => x.students)),    sum(prev7.map(x => x.students))),
    instructors: pct(sum(last7.map(x => x.instructors)), sum(prev7.map(x => x.instructors))),
    workspaces:  pct(sum(last7.map(x => x.workspaces)),  sum(prev7.map(x => x.workspaces))),
    orders:      pct(sum(last7.map(x => x.orders)),      sum(prev7.map(x => x.orders))),
    courses:     pct(sum(last7.map(x => x.courses)),     sum(prev7.map(x => x.courses))),
  };

  // Chuẩn hóa dữ liệu theo Tuần/Tháng/Năm + Export
  const PRUNE_EMPTY = true;
  const filtered = useMemo(() => {
    const prune = <T extends { students: number; instructors: number; workspaces: number; orders: number; courses?: number }>(rows: (T & { label: string })[]) =>
      PRUNE_EMPTY ? rows.filter(r => r.students || r.instructors || r.workspaces || r.orders || (r as any).courses) : rows;

    if (dayLabelsAll.length === 0) {
      return {
        labelText: 'Không có dữ liệu',
        barLabels: [] as string[],
        barSeries: { Students: [] as number[], Instructors: [] as number[], Workspaces: [] as number[], Orders: [] as number[] },
        share: { students: 0, instructors: 0, workspaces: 0, orders: 0 },
        tableRows: [] as Array<{ label: string; students: number; instructors: number; workspaces: number; orders: number; courses?: number }>,
        dailyTotals: [] as number[],
      };
    }

    if (granularity === 'week') {
      const start = anchorDate.startOf('isoWeek');
      const end = anchorDate.endOf('isoWeek');
      const range = buildDateRange(start, end);

      const rawRows = range.map((d) => ({
        label: dayjs(d).format('dddd'), // sẽ ra Thứ Hai, Thứ Ba...
        ...(dailyStats[d] ?? { ...EMPTY_DAILY })
      }));
      const rows = prune(rawRows);

      const sums = rows.reduce<Pick<Counters,'students'|'instructors'|'workspaces'|'orders'|'courses'>>(
        (a, r) => ({
          students:    a.students    + r.students,
          instructors: a.instructors + r.instructors,
          workspaces:  a.workspaces  + r.workspaces,
          orders:      a.orders      + r.orders,
          courses:     a.courses     + r.courses ,
        }),
        { ...EMPTY_DAILY }
      );

      return {
        labelText: `Tuần ISO ${anchorDate.isoWeek()}, ${anchorDate.year()}`,
        barLabels: rows.map(r => r.label),
        barSeries: {
          Students: rows.map(r => r.students),
          Instructors: rows.map(r => r.instructors),
          Workspaces: rows.map(r => r.workspaces),
          Orders: rows.map(r => r.orders),
        },
        share: {
          students: sums.students,
          instructors: sums.instructors,
          workspaces: sums.workspaces,
          orders: sums.orders,
        },
        tableRows: rows,
        dailyTotals: rows.map(r => r.students + r.instructors + r.workspaces + r.orders),
      };
    }

    if (granularity === 'month') {
      const start = anchorDate.startOf('month');
      const end = anchorDate.endOf('month');
      const range = buildDateRange(start, end);

      const rawRows = range.map((d) => ({
        label: dayjs(d).format('D'),
        ...(dailyStats[d] ?? { ...EMPTY_DAILY })
      }));
      const rows = prune(rawRows);

      const sums = rows.reduce<Pick<Counters,'students'|'instructors'|'workspaces'|'orders'|'courses'>>(
        (a, r) => ({
          students:    a.students    + r.students,
          instructors: a.instructors + r.instructors,
          workspaces:  a.workspaces  + r.workspaces,
          orders:      a.orders      + r.orders,
          courses:     a.courses     + r.courses,
        }),
        { ...EMPTY_DAILY }
      );

      return {
        labelText: anchorDate.format('MMMM YYYY'), // Tiếng Việt nhờ dayjs.locale('vi')
        barLabels: rows.map(r => r.label),
        barSeries: {
          Students: rows.map(r => r.students),
          Instructors: rows.map(r => r.instructors),
          Workspaces: rows.map(r => r.workspaces),
          Orders: rows.map(r => r.orders),
        },
        share: {
          students: sums.students,
          instructors: sums.instructors,
          workspaces: sums.workspaces,
          orders: sums.orders,
        },
        tableRows: rows,
        dailyTotals: rows.map(r => r.students + r.instructors + r.workspaces + r.orders),
      };
    }

    // year
    const year = anchorDate.year();
    const months = monthsInYear(year);
    const rawRows = months.map((m) => {
      const acc = { ...EMPTY_DAILY };
      Object.entries(dailyStats).forEach(([date, c]) => {
        if (date.startsWith(m)) {
          acc.students    += c.students;
          acc.instructors += c.instructors;
          acc.workspaces  += c.workspaces;
          acc.orders      += c.orders;
          acc.courses     += c.courses;
        }
      });
      return { label: m.slice(5), ...acc };
    });
    const rows = PRUNE_EMPTY
      ? rawRows.filter(r => r.students || r.instructors || r.workspaces || r.orders || r.courses)
      : rawRows;

    const sums = rows.reduce<Pick<Counters,'students'|'instructors'|'workspaces'|'orders'|'courses'>>(
      (a, r) => ({
        students:    a.students    + r.students,
        instructors: a.instructors + r.instructors,
        workspaces:  a.workspaces  + r.workspaces,
        orders:      a.orders      + r.orders,
        courses:     a.courses     + r.courses,
      }),
      { ...EMPTY_DAILY }
    );

    return {
      labelText: `${year}`,
      barLabels: rows.map(r => r.label),
      barSeries: {
        Students: rows.map(r => r.students),
        Instructors: rows.map(r => r.instructors),
        Workspaces: rows.map(r => r.workspaces),
        Orders: rows.map(r => r.orders),
      },
      share: {
        students: sums.students,
        instructors: sums.instructors,
        workspaces: sums.workspaces,
        orders: sums.orders,
      },
      tableRows: rows,
      dailyTotals: rows.map(r => r.students + r.instructors + r.workspaces + r.orders),
    };
  }, [dailyStats, dayLabelsAll.length, granularity, anchorDate]);

  // Charts
  const barData = useMemo(() => ({
    labels: filtered.barLabels,
    datasets: [
      { label: VI_DATASET_LABELS.students,    data: filtered.barSeries.Students,    backgroundColor: ADMIN_COLORS.teal,  borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
      { label: VI_DATASET_LABELS.instructors, data: filtered.barSeries.Instructors, backgroundColor: ADMIN_COLORS.navy,  borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
      { label: VI_DATASET_LABELS.workspaces,  data: filtered.barSeries.Workspaces,  backgroundColor: ADMIN_COLORS.gray,  borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
      { label: VI_DATASET_LABELS.orders,      data: filtered.barSeries.Orders,      backgroundColor: ADMIN_COLORS.cyan,  borderRadius: 10, borderSkipped: false, maxBarThickness: 36, barPercentage: 0.8, categoryPercentage: 0.6 },
    ]
  }), [filtered.barLabels.join(','), filtered.barSeries]);

  const barOpts: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { usePointStyle: true, boxWidth: 10 } },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)', padding: 12, cornerRadius: 8,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('vi-VN')}` }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(148,163,184,.25)' } }
    }
  };

  const totalShare =
    (filtered.share.students + filtered.share.instructors + filtered.share.workspaces + filtered.share.orders) || 1;

  const shareData = useMemo(() => ({
    labels: [VI_DATASET_LABELS.students, VI_DATASET_LABELS.instructors, VI_DATASET_LABELS.workspaces, VI_DATASET_LABELS.orders],
    datasets: [{
      data: [
        filtered.share.students,
        filtered.share.instructors,
        filtered.share.workspaces,
        filtered.share.orders
      ],
      backgroundColor: [
        ADMIN_COLORS.teal,
        ADMIN_COLORS.navy,
        ADMIN_COLORS.gray,
        ADMIN_COLORS.cyan
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
      cutout: '62%',
    }]
  }), [filtered.share]);

  const shareOpts: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed as number;
            const percent = Math.round((val / totalShare) * 100);
            return ` ${ctx.label}: ${val.toLocaleString('vi-VN')} (${percent}%)`;
          }
        }
      }
    }
  };

  // Xuất CSV
  const handleExportCSV = () => {
    const header = ['nhan', 'hoc_vien', 'giang_vien', 'khong_gian', 'don_hang']; // header tiếng Việt/slug
    const rows = filtered.tableRows.map(r =>
      [r.label, r.students, r.instructors, r.workspaces, r.orders].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const prefix = granularity === 'week' ? `tuan-${anchorDate.isoWeek()}-${anchorDate.year()}`
      : granularity === 'month' ? anchorDate.format('YYYY-MM')
      : `${anchorDate.year()}`;
    a.href = url;
    a.download = `bang-dieu-khien-${granularity}-${prefix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToday = () => setAnchorDate(dayjs());

  // Thẻ chỉ số
  const cards = [
    { key: 'students',    title: 'Tổng học viên',      icon: <TeamOutlined />,         value: totals.students,    percent: wow.students,    className: 'metric--tealSolid'   },
    { key: 'instructors', title: 'Tổng giảng viên',    icon: <UserOutlined />,         value: totals.instructors, percent: wow.instructors, className: 'metric--navySolid'   },
    { key: 'workspaces',  title: 'Tổng không gian làm việc', icon: <CheckCircleOutlined />,  value: totals.workspaces,  percent: wow.workspaces,  className: 'metric--graySolid'   },
    { key: 'courses',     title: 'Tổng khóa học',      icon: <BookOutlined />,         value: totals.courses,     percent: wow.courses,     className: 'metric--purpleSolid' },
    { key: 'orders',      title: 'Tổng đơn hàng',      icon: <ShoppingCartOutlined />, value: totals.orders,      percent: wow.orders,      className: 'metric--cyanSolid'   },
  ] as const;

  // Cột bảng
  const orderCols = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (_: any, r: OrderRow) => r.orderCode ?? r.id?.slice(-6)?.toUpperCase() ?? '—',
    },
    {
      title: 'Gói đăng ký',
      dataIndex: 'subscriptionPlanName',
      key: 'plan',
      render: (_: any, r: OrderRow) =>
        r.subscriptionPlanName || (r.subscriptionPlanId ? planNameById[r.subscriptionPlanId!] : '') || '—',
    },
    {
      title: 'Giá',
      dataIndex: 'totalPrice',
      key: 'price',
      render: (_: any, r: OrderRow) =>
        typeof r.totalPrice === 'number' ? `${r.totalPrice.toLocaleString('vi-VN')} ₫` : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: OrderRow['status']) => {
        const label = s === 1 ? 'ĐÃ THANH TOÁN' : s === 2 ? 'ĐÃ HỦY' : 'CHỜ XỬ LÝ';
        const color = s === 1 ? 'green' : s === 2 ? 'red' : 'gold';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_: any, r: OrderRow) => {
        const t = r.createdAt ?? r.orderTime ?? null;
        return t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '—';
      },
    },
  ];

  return (
    <Layout className="purple-root">
      <Content className="purple-container">
        {/* Header */}
        <div className="purple-header">
          <Title level={4} className="purple-title"><AimOutlined /> Trang tổng quan</Title>
          <span className="purple-overview">Tổng quan</span>
        </div>

        {/* Thanh lọc */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col flex="auto">
            <Space size="middle" wrap>
              <Segmented
                value={granularity}
                onChange={(v) => setGranularity(v as Granularity)}
                options={[
                  { label: 'Tuần', value: 'week' },
                  { label: 'Tháng', value: 'month' },
                  { label: 'Năm', value: 'year' },
                ]}
              />
              {granularity === 'week' && (
                <DatePicker
                  picker="week"
                  value={anchorDate}
                  onChange={(d) => d && setAnchorDate(d)}
                  placeholder="Chọn tuần"
                />
              )}
              {granularity === 'month' && (
                <DatePicker
                  picker="month"
                  value={anchorDate}
                  onChange={(d) => d && setAnchorDate(d)}
                  placeholder="Chọn tháng"
                />
              )}
              {granularity === 'year' && (
                <DatePicker
                  picker="year"
                  value={anchorDate}
                  onChange={(d) => d && setAnchorDate(d)}
                  placeholder="Chọn năm"
                />
              )}
              <Button icon={<ReloadOutlined />} onClick={resetToday}>Hôm nay</Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<FilterOutlined />} disabled>
                {filtered.labelText}
              </Button>
              <Button icon={<DownloadOutlined />} type="primary" onClick={handleExportCSV}>
                Xuất CSV
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* THẺ CHỈ SỐ */}
          <Row gutter={[20, 20]} className="metric-row equal-cards">
            {cards.map((c) => (
              <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4} key={c.key}>
                <Card className={`metric-card ${c.className} metric-equal`}>
                  <div className="metric-top">
                    <div className="metric-icon">{c.icon}</div>
                    <div className="metric-title">{c.title}</div>
                  </div>
                  <div className="metric-value">{c.value.toLocaleString('vi-VN')}</div>
                  <div className="metric-trend">
                    <PctTag value={c.percent} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* BIỂU ĐỒ */}
          <Row gutter={[20, 20]} className="charts-row">
            <Col xs={24} lg={16}>
              <Card className="panel-card">
                <div className="panel-title">
                  {granularity === 'week' && 'BÁO CÁO THEO TUẦN'}
                  {granularity === 'month' && 'BÁO CÁO THEO THÁNG'}
                  {granularity === 'year' && 'BÁO CÁO THEO NĂM'}
                </div>
                <div className="panel-chart" style={{ height: 420 }}>
                  <Bar data={barData} options={barOpts} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="panel-card">
                <div className="panel-title">Tỷ trọng thực thể — {filtered.labelText}</div>
                <div className="panel-chart donut" style={{ height: 360 }}>
                  <Doughnut data={shareData} options={shareOpts} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* ĐƠN HÀNG GẦN ĐÂY */}
          <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
            <Col span={24}>
              <Card className="panel-card">
                <div className="panel-title">Đơn hàng gần đây (bạn đã thanh toán)</div>
                <Table
                  size="middle"
                  rowKey="id"
                  loading={loadingOrders}
                  columns={orderCols as any}
                  dataSource={recentOrders}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Content>
    </Layout>
  );
};

export default OrganizationAdminOverview;
