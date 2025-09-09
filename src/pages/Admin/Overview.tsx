// src/pages/admin/Overview.tsx
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Tag,
  DatePicker,
  Segmented,
  Button,
  Space,
  Table,
} from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  AimOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi";             // ⟵ thêm dòng này
dayjs.locale("vi");                   // ⟵ và dòng này

import { toast } from "sonner";
import axiosInstance from "../../api/axiosInstance";
import { API } from "../../api";

import { OrderService } from "../../services/order.service";
import "./overview.css";
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
ChartJS.register(
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
);

const { Content } = Layout;
const { Title } = Typography;

type AnyItem = Record<string, any>;
type Counters = {
  users: number;
  organizations: number;
  workspaces: number;
  orders: number;
};
type DailyStats = Record<string, Counters>;
type Granularity = "week" | "month" | "year";

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalWorkspaces: number;
  totalOrders: number;
  dailyStats: DailyStats;
}

type OrderRow = {
  id: string;
  orderCode?: number | null;
  status?: 0 | 1 | 2;
  createdAt?: string;
  orderTime?: string;
  price?: number;
  totalPrice?: number;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
};

const EMPTY: Counters = {
  users: 0,
  organizations: 0,
  workspaces: 0,
  orders: 0,
};

const getCreatedDate = (it: AnyItem): string | null => {
  const raw =
    it?.createdAt ??
    it?.created_at ??
    it?.createdDate ??
    it?.created_date ??
    it?.created_on ??
    it?.createdOn ??
    null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(+d)) return null;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};
const safeList = (d: any): AnyItem[] =>
  Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.data)
    ? d.data
    : [];
const safeCount = (d: any): number =>
  Array.isArray(d)
    ? d.length
    : Array.isArray(d?.items)
    ? d.items.length
    : Array.isArray(d?.data)
    ? d.data.length
    : typeof d?.total === "number"
    ? d.total
    : 0;

const addDaily = (daily: DailyStats, list: AnyItem[], key: keyof Counters) => {
  list.forEach((it) => {
    const date = getCreatedDate(it);
    if (!date) return;
    if (!daily[date]) daily[date] = { ...EMPTY };
    daily[date][key] += 1;
  });
};
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const pct = (curr: number, prev: number) =>
  prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
const buildDateRange = (start: Dayjs, end: Dayjs) => {
  const out: string[] = [];
  let d = start.startOf("day");
  const last = end.startOf("day");
  while (d.isBefore(last) || d.isSame(last, "day")) {
    out.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }
  return out;
};
const monthsInYear = (y: number) =>
  Array.from({ length: 12 }, (_, i) =>
    dayjs().year(y).month(i).format("YYYY-MM")
  );
const COLORS = {
  teal: "#2ED3C6", // Người dùng
  navy: "#223A54", // Tổ chức
  gray: "#E3E7EF", // Workspace
  cyan: "#7AD6E0", // Đơn hàng
};

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalWorkspaces: 0,
    totalOrders: 0,
    dailyStats: {},
  });
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [anchorDate, setAnchorDate] = useState<Dayjs>(dayjs());

  // Đơn hàng gần đây
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [planNameById, setPlanNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    // tải các tổng & daily stats
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
        addDaily(daily, userList, "users");
        addDaily(daily, orgList, "organizations");
        addDaily(daily, wsList, "workspaces");
        addDaily(daily, orderList, "orders");

        const sorted = Object.fromEntries(
          Object.entries(daily).sort(([a], [b]) => (a < b ? -1 : 1))
        ) as DailyStats;

        if (!mounted) return;
        setStats({
          totalOrganizations: safeCount(orgRes.data),
          totalUsers: safeCount(userRes.data),
          totalWorkspaces: safeCount(wsRes.data),
          totalOrders: safeCount(orderRes.data),
          dailyStats: sorted,
        });
      } catch (e) {
        console.error(e);
        toast.error("Không tải được dữ liệu tổng quan");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    (async () => {
      setLoadingOrders(true);
      try {
        const [plansRes, orders] = await Promise.all([
          axiosInstance.get(API.GET_ALL_SUBCRIPTION),
          OrderService.getAll(),
        ]);

        const plans = Array.isArray(plansRes.data?.data)
          ? plansRes.data.data
          : Array.isArray(plansRes.data)
          ? plansRes.data
          : [];
        const planMap: Record<string, string> = {};
        plans.forEach((p: any) => {
          const pid = String(p?.id ?? p?.planId ?? p?._id ?? "");
          const pname = String(
            p?.name ??
              p?.planName ??
              p?.title ??
              p?.displayName ??
              p?.code ??
              ""
          );
          if (pid) planMap[pid] = pname;
        });
        if (mounted) setPlanNameById(planMap);

        const rows: OrderRow[] = (orders ?? []).map((o: any) => {
          const pid =
            o?.subscriptionId ??
            o?.subscriptionPlanId ??
            o?.subcriptionPlanId ??
            null;
          return {
            id: o.id,
            orderCode: o.orderCode ?? null,
            status: o.status,
            createdAt: o.createdAt,
            orderTime: o.orderTime,
            price: o.price,
            totalPrice: o.totalPrice ?? o.price,
            subscriptionPlanId: pid ?? undefined,
            subscriptionPlanName:
              (pid && planMap[String(pid)]) || o.subscriptionPlanName,
          };
        });

        rows.sort(
          (a, b) =>
            new Date(b.createdAt ?? b.orderTime ?? 0).getTime() -
            new Date(a.createdAt ?? a.orderTime ?? 0).getTime()
        );
        if (mounted) setRecentOrders(rows.slice(0, 8));
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách đơn hàng");
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const dayLabelsAll = useMemo(
    () => Object.keys(stats.dailyStats),
    [stats.dailyStats]
  );
  const last7IdxStart = Math.max(0, dayLabelsAll.length - 7);
  const prev7IdxStart = Math.max(0, dayLabelsAll.length - 14);
  const last7 = dayLabelsAll
    .slice(last7IdxStart)
    .map((d) => stats.dailyStats[d]);
  const prev7 = dayLabelsAll
    .slice(prev7IdxStart, last7IdxStart)
    .map((d) => stats.dailyStats[d]);
  const wow = {
    users: pct(sum(last7.map((x) => x.users)), sum(prev7.map((x) => x.users))),
    organizations: pct(
      sum(last7.map((x) => x.organizations)),
      sum(prev7.map((x) => x.organizations))
    ),
    workspaces: pct(
      sum(last7.map((x) => x.workspaces)),
      sum(prev7.map((x) => x.workspaces))
    ),
    orders: pct(
      sum(last7.map((x) => x.orders)),
      sum(prev7.map((x) => x.orders))
    ),
  };

  const cards = [
    {
      key: "users",
      title: "Tổng số người dùng",
      icon: <TeamOutlined />,
      value: stats.totalUsers,
      percent: wow.users,
      className: "metric--tealSolid",
    },
    {
      key: "organizations",
      title: "Tổng số tổ chức",
      icon: <AppstoreOutlined />,
      value: stats.totalOrganizations,
      percent: wow.organizations,
      className: "metric--navySolid",
    },
    {
      key: "workspaces",
      title: "Tổng số workspace",
      icon: <CheckCircleOutlined />,
      value: stats.totalWorkspaces,
      percent: wow.workspaces,
      className: "metric--graySolid",
    },
    {
      key: "orders",
      title: "Tổng số đơn hàng",
      icon: <ShoppingCartOutlined />,
      value: stats.totalOrders,
      percent: wow.orders,
      className: "metric--cyanSolid",
    },
  ] as const;

  const PRUNE_EMPTY = true;

  const filtered = useMemo(() => {
    const prune = (rows: Array<{ label: string } & Counters>) =>
      PRUNE_EMPTY
        ? rows.filter(
            (r) => r.users || r.organizations || r.workspaces || r.orders
          )
        : rows;

    if (dayLabelsAll.length === 0) {
      return {
        labelText: "Không có dữ liệu",
        barLabels: [] as string[],
        barSeries: {
          "Người dùng": [] as number[],
          "Tổ chức": [] as number[],
          "Workspace": [] as number[],
          "Đơn hàng": [] as number[],
        },
        share: { users: 0, organizations: 0, workspaces: 0, orders: 0 },
        tableRows: [] as Array<{ label: string } & Counters>,
        dailyTotals: [] as number[],
      };
    }

    if (granularity === "week") {
      const start = anchorDate.startOf("isoWeek");
      const end = anchorDate.endOf("isoWeek");
      const range = buildDateRange(start, end);

      const rawRows = range.map((d) => ({
        label: dayjs(d).format("dddd"),
        ...(stats.dailyStats[d] ?? { ...EMPTY }),
      }));
      const rows = prune(rawRows);
      const sums = rows.reduce(
        (a, r) => ({
          users: a.users + r.users,
          organizations: a.organizations + r.organizations,
          workspaces: a.workspaces + r.workspaces,
          orders: a.orders + r.orders,
        }),
        { ...EMPTY }
      );

      return {
        labelText: `Tuần ISO ${anchorDate.isoWeek()}, ${anchorDate.year()}`,
        barLabels: rows.map((r) => r.label),
        barSeries: {
          "Người dùng": rows.map((r) => r.users),
          "Tổ chức": rows.map((r) => r.organizations),
          "Workspace": rows.map((r) => r.workspaces),
          "Đơn hàng": rows.map((r) => r.orders),
        },
        share: sums,
        tableRows: rows,
        dailyTotals: rows.map(
          (r) => r.users + r.organizations + r.workspaces + r.orders
        ),
      };
    }

    if (granularity === "month") {
      const start = anchorDate.startOf("month");
      const end = anchorDate.endOf("month");
      const range = buildDateRange(start, end);

      const rawRows = range.map((d) => ({
        label: dayjs(d).format("D"),
        ...(stats.dailyStats[d] ?? { ...EMPTY }),
      }));
      const rows = prune(rawRows);
      const sums = rows.reduce(
        (a, r) => ({
          users: a.users + r.users,
          organizations: a.organizations + r.organizations,
          workspaces: a.workspaces + r.workspaces,
          orders: a.orders + r.orders,
        }),
        { ...EMPTY }
      );

      return {
        labelText: anchorDate.format("MMMM YYYY"),
        barLabels: rows.map((r) => r.label),
        barSeries: {
          "Người dùng": rows.map((r) => r.users),
          "Tổ chức": rows.map((r) => r.organizations),
          "Workspace": rows.map((r) => r.workspaces),
          "Đơn hàng": rows.map((r) => r.orders),
        },
        share: sums,
        tableRows: rows,
        dailyTotals: rows.map(
          (r) => r.users + r.organizations + r.workspaces + r.orders
        ),
      };
    }

    // year
    const year = anchorDate.year();
    const months = monthsInYear(year);
    const rawRows = months.map((m) => {
      const acc = { ...EMPTY };
      Object.entries(stats.dailyStats).forEach(([date, c]) => {
        if (date.startsWith(m)) {
          acc.users += c.users;
          acc.organizations += c.organizations;
          acc.workspaces += c.workspaces;
          acc.orders += c.orders;
        }
      });
      return { label: m.slice(5), ...acc }; // "01".."12"
    });
    const rows = PRUNE_EMPTY
      ? rawRows.filter(
          (r) => r.users || r.organizations || r.workspaces || r.orders
        )
      : rawRows;

    const sums = rows.reduce(
      (a, r) => ({
        users: a.users + r.users,
        organizations: a.organizations + r.organizations,
        workspaces: a.workspaces + r.workspaces,
        orders: a.orders + r.orders,
      }),
      { ...EMPTY }
    );

    return {
      labelText: `${year}`,
      barLabels: rows.map((r) => r.label),
      barSeries: {
        "Người dùng": rows.map((r) => r.users),
        "Tổ chức": rows.map((r) => r.organizations),
        "Workspace": rows.map((r) => r.workspaces),
        "Đơn hàng": rows.map((r) => r.orders),
      },
      share: sums,
      tableRows: rows,
      dailyTotals: rows.map(
        (r) => r.users + r.organizations + r.workspaces + r.orders
      ),
    };
  }, [stats.dailyStats, dayLabelsAll.length, granularity, anchorDate]);

  const barData = useMemo(
    () => ({
      labels: filtered.barLabels,
      datasets: [
        {
          label: "Người dùng",
          data: filtered.barSeries["Người dùng"],
          backgroundColor: COLORS.teal,
          borderWidth: 0,
          borderSkipped: false,
          borderRadius: 0,
          barThickness: 24,
          maxBarThickness: 30,
          categoryPercentage: 0.64,
          barPercentage: 0.72,
        },
        {
          label: "Tổ chức",
          data: filtered.barSeries["Tổ chức"],
          backgroundColor: COLORS.navy,
          borderWidth: 0,
          borderSkipped: false,
          borderRadius: 0,
          barThickness: 24,
          maxBarThickness: 30,
          categoryPercentage: 0.64,
          barPercentage: 0.72,
        },
        {
          label: "Workspace",
          data: filtered.barSeries["Workspace"],
          backgroundColor: COLORS.gray,
          borderWidth: 0,
          borderSkipped: false,
          borderRadius: 0,
          barThickness: 24,
          maxBarThickness: 30,
          categoryPercentage: 0.64,
          barPercentage: 0.72,
        },
        {
          label: "Đơn hàng",
          data: filtered.barSeries["Đơn hàng"],
          backgroundColor: COLORS.cyan,
          borderWidth: 0,
          borderSkipped: false,
          borderRadius: 0,
          barThickness: 24,
          maxBarThickness: 30,
          categoryPercentage: 0.64,
          barPercentage: 0.72,
        },
      ],
    }),
    [filtered.barLabels.join(","), filtered.barSeries]
  );

  const barOpts: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 6, right: 6 } },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, boxWidth: 10 },
      },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.92)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        offset: true,
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 10,
          padding: 6,
        },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(148,163,184,.18)" },
      },
    },
  };

  const totalShare =
    filtered.share.users +
      filtered.share.organizations +
      filtered.share.workspaces +
      filtered.share.orders || 1;

  const shareData = useMemo(
    () => ({
      labels: ["Người dùng", "Tổ chức", "Workspace", "Đơn hàng"],
      datasets: [
        {
          data: [
            filtered.share.users,
            filtered.share.organizations,
            filtered.share.workspaces,
            filtered.share.orders,
          ],
          backgroundColor: [COLORS.teal, COLORS.navy, COLORS.gray, COLORS.cyan],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 4,
          cutout: "65%",
        },
      ],
    }),
    [filtered.share]
  );

  const shareOpts: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed as number;
            const percent = Math.round((val / totalShare) * 100);
            return ` ${ctx.label}: ${val.toLocaleString()} (${percent}%)`;
          },
        },
      },
    },
  };

  const handleExportCSV = () => {
    const header = [
      granularity === "week" ? "Tuần" : granularity === "month" ? "Ngày" : "Tháng",
      "Người dùng",
      "Tổ chức",
      "Workspace",
      "Đơn hàng",
    ];
    const rows = filtered.tableRows.map((r) =>
      [r.label, r.users, r.organizations, r.workspaces, r.orders].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const prefix =
      granularity === "week"
        ? `tuan-${anchorDate.isoWeek()}-${anchorDate.year()}`
        : granularity === "month"
        ? anchorDate.format("YYYY-MM")
        : `${anchorDate.year()}`;
    a.href = url;
    a.download = `tong-quan-${granularity}-${prefix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToday = () => setAnchorDate(dayjs());

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (_: any, r: OrderRow) =>
        r.orderCode ?? r.id?.slice(-6)?.toUpperCase() ?? "—",
    },
    {
      title: "Gói đăng ký",
      dataIndex: "subscriptionPlanName",
      key: "plan",
      render: (_: any, r: OrderRow) =>
        r.subscriptionPlanName ||
        (r.subscriptionPlanId ? planNameById[r.subscriptionPlanId] : "") ||
        "—",
    },
    {
      title: "Giá",
      dataIndex: "totalPrice",
      key: "price",
      render: (_: any, r: OrderRow) =>
        typeof r.totalPrice === "number"
          ? `${r.totalPrice.toLocaleString("vi-VN")} ₫`
          : "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: OrderRow["status"]) => {
        const label = s === 1 ? "ĐÃ THANH TOÁN" : s === 2 ? "ĐÃ HỦY" : "ĐANG XỬ LÝ";
        const color = s === 1 ? "green" : s === 2 ? "red" : "gold";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: any, r: OrderRow) => {
        const t = r.createdAt ?? r.orderTime ?? null;
        return t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "—";
      },
    },
  ];

  return (
    <Layout className="purple-root">
      <Content className="purple-container">
        <div className="purple-header">
          <Title level={4} className="purple-title">
            <AimOutlined /> Trang tổng quan
          </Title>
          <span className="purple-overview">Tổng quan</span>
        </div>

        <Spin spinning={loading}>
          {/* THANH BỘ LỌC */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 12 }}
          >
            <Col flex="auto">
              <Space size="middle" wrap>
                <Segmented
                  value={granularity}
                  onChange={(v) => setGranularity(v as Granularity)}
                  options={[
                    { label: "Tuần", value: "week" },
                    { label: "Tháng", value: "month" },
                    { label: "Năm", value: "year" },
                  ]}
                />
                {granularity === "week" && (
                  <DatePicker
                    picker="week"
                    value={anchorDate}
                    onChange={(d) => d && setAnchorDate(d)}
                  />
                )}
                {granularity === "month" && (
                  <DatePicker
                    picker="month"
                    value={anchorDate}
                    onChange={(d) => d && setAnchorDate(d)}
                  />
                )}
                {granularity === "year" && (
                  <DatePicker
                    picker="year"
                    value={anchorDate}
                    onChange={(d) => d && setAnchorDate(d)}
                  />
                )}
                <Button icon={<ReloadOutlined />} onClick={resetToday}>
                  Hôm nay
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<FilterOutlined />} disabled>
                  {filtered.labelText}
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  type="primary"
                  onClick={handleExportCSV}
                >
                  Xuất CSV
                </Button>
              </Space>
            </Col>
          </Row>

          {/* THẺ CHỈ SỐ */}
          <Row gutter={[16, 16]} className="metric-row equal-cards">
            {cards.map((c) => (
              <Col xs={24} sm={12} lg={6} key={c.key}>
                <Card className={`metric-card ${c.className} metric-equal`}>
                  <div className="metric-top">
                    <div className="metric-icon">{c.icon}</div>
                    <div className="metric-title">{c.title}</div>
                  </div>
                  <div className="metric-value">{c.value.toLocaleString("vi-VN")}</div>
                  <div className="metric-trend">
                    <Tag color={c.percent >= 0 ? "green" : "red"}>
                      WoW: {c.percent >= 0 ? "Tăng" : "Giảm"} {Math.abs(c.percent)}%
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* BIỂU ĐỒ */}
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} lg={16}>
              <Card className="panel-card">
                <div className="panel-title">
                  {granularity === "week" && "BÁO CÁO THEO TUẦN"}
                  {granularity === "month" && "BÁO CÁO THEO THÁNG"}
                  {granularity === "year" && "BÁO CÁO THEO NĂM"}
                </div>
                <div className="panel-chart" style={{ height: 420 }}>
                  <Bar data={barData} options={barOpts} />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="panel-card">
                <div className="panel-title">
                  Tỷ trọng theo nhóm — {filtered.labelText}
                </div>
                <div className="panel-chart donut" style={{ height: 360 }}>
                  <Doughnut data={shareData} options={shareOpts} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* ĐƠN HÀNG GẦN ĐÂY */}
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col span={24}>
              <Card className="panel-card">
                <div className="panel-title">Đơn hàng gần đây</div>
                <Table
                  size="middle"
                  rowKey="id"
                  loading={loadingOrders}
                  columns={columns as any}
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

export default AdminOverview;
