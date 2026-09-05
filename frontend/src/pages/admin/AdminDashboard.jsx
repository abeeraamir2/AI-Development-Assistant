// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
  LayoutGrid,
  Folder,
  Users,
  CheckSquare,
  FileSearch,
  FlaskConical,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import CreateProjectModal from "../../components/modals/CreateProjectModal";
import EditProjectModal from "../../components/modals/EditProjectModal";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";
import { parseDate, formatRelativeTime } from "../../utils/dateUtils";

const API_BASE = "http://localhost:8000";

const STATUS_COLORS = {
  Completed: "#10b981", // Emerald
  "In Progress": "#3b82f6", // Blue
  "Not Started": "#71717a", // Zinc
};

const CATEGORY_COLORS = {
  Backend: "#6366f1",
  Frontend: "#06b6d4",
  DevOps: "#f59e0b",
  Testing: "#ec4899",
};

export default function AdminDashboard({ authToken, userRole, userEmail }) {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getToken = useCallback(
    () => authToken || localStorage.getItem("token") || localStorage.getItem("authToken"),
    [authToken]
  );

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to load admin dashboard data.");
      }
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const kpis = dashboardData?.kpi_metrics || {};
  const workBreakdown = dashboardData?.work_item_breakdown || { status: {}, category: {} };
  const projectsOverview = dashboardData?.projects_overview || [];
  const recentActivity = dashboardData?.recent_activity || [];
  const needsAttention = dashboardData?.needs_attention || [];
  const teamDistribution = dashboardData?.team_distribution || [];
  const aiActivity = dashboardData?.ai_activity || { total_requirements: 0, total_suites: 0, total_test_cases: 0, trend: [] };

  // Activity Stream Pagination State
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_PER_PAGE = 4;

  const totalActivityPages = Math.ceil(recentActivity.length / ACTIVITY_PER_PAGE) || 1;
  const paginatedActivity = React.useMemo(() => {
    const start = (activityPage - 1) * ACTIVITY_PER_PAGE;
    return recentActivity.slice(start, start + ACTIVITY_PER_PAGE);
  }, [recentActivity, activityPage]);

  // Adjust page if it exceeds total pages
  useEffect(() => {
    if (activityPage > totalActivityPages) {
      setActivityPage(totalActivityPages);
    }
  }, [activityPage, totalActivityPages]);

  // Prepare Donut Chart Data for Work Item Status
  const statusChartData = [
    { name: "Completed", value: workBreakdown.status?.["Completed"] || 0, color: STATUS_COLORS.Completed },
    { name: "In Progress", value: workBreakdown.status?.["In Progress"] || 0, color: STATUS_COLORS["In Progress"] },
    { name: "Not Started", value: workBreakdown.status?.["Not Started"] || 0, color: STATUS_COLORS["Not Started"] },
  ].filter((d) => d.value > 0);

  const totalStatusCount = statusChartData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6 sm:space-y-8">
      <Toaster position="top-right" richColors />

      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">
            Monitor projects, teams, work items, and AI development activity from one place.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh workspace telemetry"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/50 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/work-items/create")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/50 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
          >
            <CheckSquare size={14} className="text-[var(--accent)]" />
            <span>New Work Item</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/analyzer")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Run Analyzer</span>
          </button>
        </div>
      </div>

      {loading && !dashboardData ? (
        /* Loading Skeleton */
        <div className="p-16 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4">
          <RefreshCw size={28} className="animate-spin text-[var(--accent)] mx-auto" />
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            Aggregating workspace telemetry and metrics...
          </p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-12 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 space-y-4 max-w-xl mx-auto">
          <AlertTriangle size={32} className="mx-auto text-rose-500" />
          <div>
            <h3 className="text-base font-bold">Unable to load dashboard data</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchDashboardStats}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* 2. KPI Summary Cards (6 Cards Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {/* Total Projects */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Projects</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <Folder size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.total_projects ?? 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  Active Workspaces
                </p>
              </div>
            </div>

            {/* Total Team Members */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Team</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Users size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.total_users ?? 0}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5 truncate" title={`${kpis.devs_count} Devs • ${kpis.qa_count} QA`}>
                  {kpis.devs_count ?? 0} Devs • {kpis.qa_count ?? 0} QA
                </p>
              </div>
            </div>

            {/* Active Work Items */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Items</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Clock size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.active_work_items ?? 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  In Progress
                </p>
              </div>
            </div>

            {/* Completed Work Items */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Completed</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.completed_work_items ?? 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  Tasks Done
                </p>
              </div>
            </div>

            {/* Requirements Analyzed */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Requirements</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <FileSearch size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.requirements_analyzed ?? 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                  AI Analyses
                </p>
              </div>
            </div>

            {/* Test Suites Generated */}
            <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 hover:border-[var(--accent)]/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Test Suites</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <FlaskConical size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {kpis.test_suites_generated ?? 0}
                </p>
                <p className="text-[11px] text-cyan-500 font-bold mt-0.5">
                  {kpis.total_test_cases ?? 0} Test Cases
                </p>
              </div>
            </div>
          </div>

          {/* 3. Work Item Overview & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Status Breakdown Donut + Metrics */}
            <div className="lg:col-span-6 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <CheckSquare size={16} className="text-[var(--accent)]" />
                    Work Item Status Breakdown
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Distribution of all {kpis.total_work_items ?? 0} workspace tasks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/work-items")}
                  className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Work Items</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {totalStatusCount === 0 ? (
                <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)]">
                  No work items created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          innerRadius={42}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-[var(--text-primary)]">{totalStatusCount}</span>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-[var(--text-primary)]">Completed</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">
                        {workBreakdown.status?.["Completed"] || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="font-semibold text-[var(--text-primary)]">In Progress</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">
                        {workBreakdown.status?.["In Progress"] || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                        <span className="font-semibold text-[var(--text-primary)]">Not Started</span>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">
                        {workBreakdown.status?.["Not Started"] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Distribution Breakdown */}
            <div className="lg:col-span-6 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Layers size={16} className="text-[var(--accent)]" />
                  Category Distribution
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Engineering domain allocation across modules
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {Object.entries(CATEGORY_COLORS).map(([cat, col]) => {
                  const cnt = workBreakdown.category?.[cat] || 0;
                  const pct = totalStatusCount > 0 ? Math.round((cnt / totalStatusCount) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                          <span className="text-[var(--text-primary)]">{cat}</span>
                        </div>
                        <span className="text-[var(--text-muted)] font-mono text-[11px]">
                          {cnt} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: col }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Project Health & Status Table */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Folder size={16} className="text-[var(--accent)]" />
                  Project Overview & Health
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Real-time milestone tracking and completion health per project workspace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateProjectOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer self-start sm:self-auto"
              >
                <Plus size={13} />
                <span>Add Project</span>
              </button>
            </div>

            {projectsOverview.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)]">
                No projects created yet. Click "Add Project" above to create your first workspace.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-3 px-3">Project</th>
                      <th className="py-3 px-3 text-center">Team</th>
                      <th className="py-3 px-3 text-center">Tasks</th>
                      <th className="py-3 px-3 text-center">Done / Active</th>
                      <th className="py-3 px-3">Progress</th>
                      <th className="py-3 px-3">Health</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-xs font-medium">
                    {projectsOverview.map((proj) => {
                      const healthColor =
                        proj.health_status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : proj.health_status === "Active"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

                      return (
                        <tr key={proj.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                          {/* Project Name */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                                <Folder size={16} />
                              </div>
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block">
                                  {proj.name}
                                </span>
                                {proj.description && (
                                  <span className="text-[11px] text-[var(--text-muted)] truncate max-w-xs block">
                                    {proj.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Team Members */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                              <Users size={12} className="text-[var(--text-muted)]" />
                              {proj.team_members_count}
                            </span>
                          </td>

                          {/* Total Work Items */}
                          <td className="py-3.5 px-3 text-center font-bold text-[var(--text-primary)]">
                            {proj.total_work_items}
                          </td>

                          {/* Done / Active Breakdown */}
                          <td className="py-3.5 px-3 text-center text-[11px] font-mono">
                            <span className="text-emerald-500 font-bold">{proj.completed_work_items}</span>
                            <span className="text-[var(--text-muted)]"> / </span>
                            <span className="text-blue-500 font-bold">{proj.in_progress_work_items}</span>
                          </td>

                          {/* Progress Bar & Rate */}
                          <td className="py-3.5 px-3 min-w-[130px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-[var(--text-muted)]">Completion</span>
                                <span className="text-[var(--text-primary)]">{proj.completion_rate}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                                  style={{ width: `${proj.completion_rate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Health Status */}
                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${healthColor}`}>
                              {proj.health_status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate("/work-items")}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--accent)]/30 transition-all cursor-pointer"
                              >
                                View Tasks
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. Main 2-Column Section: Left (Attention + Team) | Right (Activity + AI) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 Spans) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Needs Attention Panel */}
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Needs Attention
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {needsAttention.length} Alerts
                  </span>
                </div>

                {needsAttention.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)] space-y-1">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                    <p className="font-bold text-[var(--text-primary)]">All work items on track</p>
                    <p className="text-[11px]">No overdue tasks or high-priority unstarted items.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {needsAttention.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-[var(--accent)]">
                              {item.code}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-sm">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              {item.reason}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            Project: <strong className="text-[var(--text-secondary)]">{item.project_name}</strong> • Assignee: <strong className="text-[var(--text-secondary)]">{item.assignee_name}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/work-items/${item.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
                        >
                          Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Work Distribution Table */}
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Users size={16} className="text-[var(--accent)]" />
                      Team Workload Distribution
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Assigned vs active task matrix across team members
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Users</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Team Member</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-center">Assigned</th>
                        <th className="py-2.5 px-3 text-center">In Progress</th>
                        <th className="py-2.5 px-3 text-center">Done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-xs font-medium">
                      {teamDistribution.map((m) => (
                        <tr key={m.user_id} className="hover:bg-[var(--bg-subtle)]/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {m.name ? m.name[0].toUpperCase() : "U"}
                              </div>
                              <div className="truncate max-w-[140px]">
                                <span className="font-bold text-[var(--text-primary)] block truncate">{m.name}</span>
                                <span className="text-[10px] text-[var(--text-muted)] block truncate">{m.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                              {m.role}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center font-bold text-[var(--text-primary)]">
                            {m.assigned_count}
                          </td>

                          <td className="py-2.5 px-3 text-center text-blue-500 font-bold">
                            {m.in_progress_count}
                          </td>

                          <td className="py-2.5 px-3 text-center text-emerald-500 font-bold">
                            {m.completed_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (5 Spans) */}
            {/* Right Column (5 Spans) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recent System Activity Stream */}
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Activity size={16} className="text-[var(--accent)]" />
                      Recent System Activity
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Live event stream across workspace modules
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    {recentActivity.length} Events
                  </span>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)]">
                    No recent activity recorded.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2.5">
                      {paginatedActivity.map((act) => {
                        const dt = parseDate(act.timestamp);
                        return (
                          <div
                            key={act.id}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                          >
                            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0 mt-0.5">
                              {act.badge === "Requirement" ? (
                                <FileSearch size={14} />
                              ) : act.badge === "Test Suite" ? (
                                <FlaskConical size={14} />
                              ) : act.badge === "Project" ? (
                                <Folder size={14} />
                              ) : (
                                <CheckSquare size={14} />
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate" title={act.title}>
                                  {act.title}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium">
                                  {dt ? formatRelativeTime(dt) : ""}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--text-muted)] truncate">
                                Project: <span className="text-[var(--text-secondary)] font-semibold">{act.project_name}</span> • By: {act.user_email}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalActivityPages > 1 && (
                      <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Showing{" "}
                          <strong className="text-[var(--text-primary)]">
                            {(activityPage - 1) * ACTIVITY_PER_PAGE + 1}–
                            {Math.min(activityPage * ACTIVITY_PER_PAGE, recentActivity.length)}
                          </strong>{" "}
                          of {recentActivity.length}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActivityPage((prev) => Math.max(prev - 1, 1))}
                            disabled={activityPage === 1}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Previous page"
                          >
                            <ChevronLeft size={13} />
                          </button>

                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)]">
                            {activityPage} / {totalActivityPages}
                          </span>

                          <button
                            type="button"
                            onClick={() => setActivityPage((prev) => Math.min(prev + 1, totalActivityPages))}
                            disabled={activityPage === totalActivityPages}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Next page"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* AI Telemetry Card */}
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles size={16} className="text-[var(--accent)]" />
                    AI Development Telemetry
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Synthesized requirement outputs and test cases
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Requirements</span>
                    <p className="text-xl font-black text-[var(--text-primary)] mt-0.5">
                      {aiActivity.total_requirements}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Test Cases</span>
                    <p className="text-xl font-black text-cyan-500 mt-0.5">
                      {aiActivity.total_test_cases}
                    </p>
                  </div>
                </div>

                {aiActivity.trend && aiActivity.trend.length > 0 && (
                  <div className="h-32 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aiActivity.trend}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="cases" fill="var(--accent)" name="Test Cases" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="analyses" fill="#6366f1" name="Analyses" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={() => {
          setIsCreateProjectOpen(false);
          fetchDashboardStats();
        }}
        authToken={authToken}
      />
    </div>
  );
}