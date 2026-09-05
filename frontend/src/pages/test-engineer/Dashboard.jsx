import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity,
  Loader2,
} from "lucide-react";

const TYPE_BADGE = {
  API: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30",
  SEC: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  SECURITY: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30",
  E2E: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30",
  UNIT: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30",
  FUNCTIONAL: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
  NEGATIVE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  BOUNDARY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
};

const CATEGORY_COLORS = {
  Functional: "#3b82f6",
  Negative: "#f43f5e",
  Boundary: "#eab308",
  API: "#06b6d4",
  Security: "#8b5cf6",
  Performance: "#10b981",
  Regression: "#6366f1",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 shadow-xl">
        <p className="text-xs font-semibold text-[var(--text-secondary)]">{label}</p>
        <p className="text-xs font-bold text-[var(--accent)]">
          {payload[0].value} Test Cases
        </p>
      </div>
    );
  }
  return null;
};

const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 shadow-xl">
        <p className="text-xs font-bold" style={{ color: data.payload.color }}>
          {data.name}
        </p>
        <p className="text-xs font-semibold text-[var(--text-primary)]">
          {data.value} Tests
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8000/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load dashboard metrics from backend.");
        }

        const resData = await response.json();
        setData(resData);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Fetching live MongoDB metrics...
        </p>
      </div>
    );
  }

  // Extract dynamic values from backend
  const metrics = data?.metrics || {
    total_tests: 0,
    functional: 0,
    api: 0,
    security: 0,
    pass_rate: "100%",
  };

  const runs = data?.recent_runs || [];

  // Top stat cards mapping
  const STATS = [
    { label: "Total Tests", value: metrics.total_tests, icon: FlaskConical },
    { label: "Functional", value: metrics.functional, icon: CheckCircle2 },
    { label: "API", value: metrics.api, icon: Zap },
    { label: "Security", value: metrics.security, icon: Activity },
    {
      label: "Pass Rate",
      value: metrics.pass_rate,
      icon: TrendingUp,
      highlight: true,
    },
  ];

  // Dynamic Donut Chart Data generated from real test counts
  const distributionMap = data?.distribution || {
    Functional: metrics.functional || 0,
    API: metrics.api || 0,
    Security: metrics.security || 0,
  };

  const distributionData = Object.entries(distributionMap)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => ({
      name: key,
      value: val,
      color: CATEGORY_COLORS[key] || "#8884d8",
    }));

  const totalDistributed = distributionData.reduce((a, b) => a + b.value, 0);

  // Dynamic or Fallback Weekly Activity Trend
  const activityData = data?.activity_trend || [
    { day: "Mon", tests: Math.round(metrics.total_tests * 0.1) },
    { day: "Tue", tests: Math.round(metrics.total_tests * 0.2) },
    { day: "Wed", tests: Math.round(metrics.total_tests * 0.4) },
    { day: "Thu", tests: Math.round(metrics.total_tests * 0.7) },
    { day: "Fri", tests: metrics.total_tests },
  ];

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1 text-[var(--text-primary)] tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Real-time metrics and recent test executions.
        </p>
      </motion.div>

      {/* Top Stat Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
      >
        {STATS.map(({ label, value, icon: Icon, highlight }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`relative overflow-hidden flex flex-col justify-between p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] 
              shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all ${
                highlight
                  ? "border-b-[3px] border-b-amber-500 shadow-amber-500/10"
                  : "hover:border-blue-500/40"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {label}
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  highlight ? "bg-amber-500/10" : "bg-[var(--bg-primary)]"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    highlight ? "text-amber-500" : "text-[var(--text-muted)]"
                  }
                />
              </div>
            </div>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                highlight ? "text-amber-500" : "text-[var(--text-primary)]"
              }`}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Test Runs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 
            shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base text-[var(--text-primary)] tracking-wide">
              Recent Test Runs
            </h2>
            <button
              onClick={() => (window.location.href = "/test-history")}
              className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all text-[var(--accent)] cursor-pointer"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {runs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-lg">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                No test suites found in database. Generate a suite to see live metrics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[550px]">
                <thead>
                  <tr className="text-xs border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="font-semibold pb-3 whitespace-nowrap">
                      Requirement / File
                    </th>
                    <th className="font-semibold pb-3 px-3">Tests</th>
                    <th className="font-semibold pb-3 px-3">Types</th>
                    <th className="font-semibold pb-3 px-3">Status</th>
                    <th className="font-semibold pb-3 pl-3 text-right">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {runs.map((run) => {
                    const failed = run.status === "Failed";
                    const badgeKey = run.types[0]?.toUpperCase() || "UNIT";
                    return (
                      <motion.tr
                        key={run.id}
                        whileHover={{
                          backgroundColor: "var(--bg-surface-hover)",
                        }}
                        className="transition-colors group"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-[var(--text-primary)] mb-0.5 group-hover:text-[var(--accent)] transition-colors">
                            {run.filename || "Requirement Spec"}
                          </p>
                          <p className="text-xs font-mono text-[var(--text-muted)]">
                            {run.created_at || "Just now"}
                          </p>
                        </td>
                        <td className="py-4 px-3 font-semibold text-[var(--text-primary)]">
                          {run.total_tests}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {run.types.map((t) => (
                              <span
                                key={t}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                                  TYPE_BADGE[t.toUpperCase()] ||
                                  TYPE_BADGE.UNIT
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                              failed
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            }`}
                          >
                            {failed ? (
                              <XCircle size={14} />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            {run.status || "Success"}
                          </span>
                        </td>
                        <td className="py-4 pl-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold text-[var(--text-secondary)]">
                              {run.coverage || 100}%
                            </span>
                            <div className="w-16 h-2 rounded-full overflow-hidden bg-[var(--border-color)] p-0.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${run.coverage || 100}%` }}
                                transition={{
                                  duration: 0.8,
                                  ease: "easeOut",
                                }}
                                className={`h-full rounded-full ${
                                  failed ? "bg-rose-500" : "bg-emerald-500"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right Column: Test Activity Graph & Test Type Distribution Donut */}
        <div className="space-y-6">
          {/* Test Activity Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 
              shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-[var(--accent)]">
                  <Activity size={16} />
                </div>
                <h2 className="font-bold text-sm text-[var(--text-primary)]">
                  Test Activity
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Live MongoDB
              </span>
            </div>

            {/* Recharts Area Graph */}
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent)"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tests"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Test Type Distribution Donut Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 
              shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-[var(--accent)]">
                <PieChartIcon size={16} />
              </div>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">
                Test Type Distribution
              </h2>
            </div>

            {/* Donut Chart & Legend Container */}
            <div className="flex flex-col items-center gap-3">
              {distributionData.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                  No categorical test data available yet.
                </div>
              ) : (
                <>
                  <div className="h-40 w-40 relative flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<DonutTooltip />} />
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Total Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-sm font-extrabold text-[var(--text-primary)]">
                        {totalDistributed.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Categorical Legend Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs w-full pt-2 border-t border-[var(--border-color)]">
                    {distributionData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-[var(--text-secondary)] truncate text-[11px]">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}