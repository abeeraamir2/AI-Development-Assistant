// src/pages/test-engineer/TestHistoryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
  FlaskConical,
  Sparkles,
  Search,
  Folder,
  Layers,
  Zap,
  Calendar,
  Eye,
  Trash2,
  AlertTriangle,
  X,
  Plus,
  RefreshCw,
  FileCode2,
  ChevronRight,
  Filter,
} from "lucide-react";
import { parseDate, formatRelativeTime } from "../../utils/dateUtils";

const API_BASE = "http://localhost:8000";

const CATEGORY_BADGES = {
  Functional: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  API: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Negative: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Boundary: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Security: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Performance: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Regression: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export default function TestHistoryPage({ authToken, userRole, userEmail }) {
  const navigate = useNavigate();

  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Deletion Modal State
  const [suiteToDelete, setSuiteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = useCallback(
    () => authToken || localStorage.getItem("token") || localStorage.getItem("authToken"),
    [authToken]
  );

  // Fetch Test Suites History
  const fetchTestSuites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/test-suites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to load test suites history.");
      }
      const data = await res.json();
      setTestSuites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Fetch Projects list for filter dropdown
  const fetchProjects = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTestSuites();
    fetchProjects();
  }, [fetchTestSuites, fetchProjects]);

  // Dynamic Project Options (from workspace projects + test suite documents)
  const projectOptions = useMemo(() => {
    const fromSuites = testSuites.map((s) => s.project_name).filter(Boolean);
    const fromProjs = projects.map((p) => p.name).filter(Boolean);
    const unique = Array.from(new Set([...fromSuites, ...fromProjs]));
    return ["All Projects", ...unique];
  }, [testSuites, projects]);

  // Dynamic Category Options
  const categoryOptions = useMemo(() => {
    const set = new Set(["All Categories"]);
    testSuites.forEach((s) => {
      if (Array.isArray(s.categories)) {
        s.categories.forEach((cat) => set.add(cat));
      }
    });
    return Array.from(set);
  }, [testSuites]);

  // Filtered Test Suites
  const filteredSuites = useMemo(() => {
    return testSuites.filter((suite) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        suite.title?.toLowerCase().includes(q) ||
        suite.filename?.toLowerCase().includes(q) ||
        suite.project_name?.toLowerCase().includes(q);

      const matchProject =
        selectedProject === "All Projects" ||
        suite.project_name?.toLowerCase() === selectedProject.toLowerCase() ||
        suite.project_id === selectedProject;

      const matchCategory =
        selectedCategory === "All Categories" ||
        (Array.isArray(suite.categories) && suite.categories.includes(selectedCategory));

      return matchSearch && matchProject && matchCategory;
    });
  }, [testSuites, searchQuery, selectedProject, selectedCategory]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalSuites = testSuites.length;
    let totalCases = 0;
    const projectSet = new Set();
    const categoryCounts = {};

    testSuites.forEach((s) => {
      totalCases += s.total_cases || 0;
      if (s.project_name) projectSet.add(s.project_name);
      if (Array.isArray(s.categories)) {
        s.categories.forEach((cat) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    let topCategory = "N/A";
    let maxCatCount = 0;
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        topCategory = cat;
      }
    });

    return {
      totalSuites,
      totalCases,
      activeProjects: projectSet.size,
      topCategory,
    };
  }, [testSuites]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProject("All Projects");
    setSelectedCategory("All Categories");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedProject !== "All Projects" ||
    selectedCategory !== "All Categories";

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!suiteToDelete) return;
    setIsDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/test-suites/${suiteToDelete.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete test suite.");
      }
      toast.success(`Test suite "${suiteToDelete.title || suiteToDelete.filename}" deleted successfully.`);
      setTestSuites((prev) => prev.filter((s) => s.id !== suiteToDelete.id));
      setSuiteToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete test suite.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Test History
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            View and manage your previously generated test suites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/test-generator")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Test Suite</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <FlaskConical size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total Suites
            </p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">
              {metrics.totalSuites}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total Test Cases
            </p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">
              {metrics.totalCases}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Folder size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Projects Tested
            </p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">
              {metrics.activeProjects}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Top Category
            </p>
            <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5 truncate max-w-[130px]" title={metrics.topCategory}>
              {metrics.topCategory}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test suites by title, requirement, or project..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Project Selector */}
        <div className="relative w-full md:w-56">
          <Folder
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={`w-full appearance-none pl-9 pr-8 py-2 text-xs rounded-xl border bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer font-medium transition-all ${
              selectedProject !== "All Projects"
                ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--accent)]/5"
                : "border-[var(--border-color)]"
            }`}
          >
            {projectOptions.map((proj, idx) => (
              <option key={idx} value={proj} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {proj}
              </option>
            ))}
          </select>
          <ChevronRight
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)] pointer-events-none"
          />
        </div>

        {/* Category Selector */}
        <div className="relative w-full md:w-48">
          <Filter
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full appearance-none pl-9 pr-8 py-2 text-xs rounded-xl border bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer font-medium transition-all ${
              selectedCategory !== "All Categories"
                ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--accent)]/5"
                : "border-[var(--border-color)]"
            }`}
          >
            {categoryOptions.map((cat, idx) => (
              <option key={idx} value={cat} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                {cat}
              </option>
            ))}
          </select>
          <ChevronRight
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)] pointer-events-none"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
            title="Reset filters"
          >
            <X size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
          <RefreshCw size={24} className="animate-spin text-[var(--accent)] mx-auto" />
          <p className="text-xs font-semibold text-[var(--text-secondary)]">
            Loading test history...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 space-y-3">
          <AlertTriangle size={24} className="mx-auto text-rose-500" />
          <p className="text-xs font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchTestSuites}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : testSuites.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto text-[var(--accent)]">
            <FlaskConical size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No Test History Yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Your generated test suites will appear here once you create them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/test-generator")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Generate Tests</span>
          </button>
        </div>
      ) : filteredSuites.length === 0 ? (
        /* No Search Matches */
        <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
          <Search size={22} className="text-[var(--text-muted)] mx-auto" />
          <p className="text-xs font-bold text-[var(--text-primary)]">
            No test suites match your filters.
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Try adjusting your search keyword or clearing the project/category filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* History Table View */
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Test Suite</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Source Codebase</th>
                  <th className="py-3.5 px-4 text-center">Test Cases</th>
                  <th className="py-3.5 px-4">Categories</th>
                  <th className="py-3.5 px-4">Generated On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {filteredSuites.map((suite) => {
                  const createdDate = parseDate(suite.created_at);
                  return (
                    <motion.tr
                      key={suite.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--bg-subtle)]/60 transition-colors group"
                    >
                      {/* Test Suite Title */}
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                            <FileCode2 size={16} />
                          </div>
                          <div>
                            <span className="font-bold hover:text-[var(--accent)] transition-colors cursor-pointer" onClick={() => navigate(`/test-history/${suite.id}`)}>
                              {suite.title || suite.filename || "Test Suite"}
                            </span>
                            {suite.languages && suite.languages.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {suite.languages.slice(0, 3).map((lang) => (
                                  <span
                                    key={lang}
                                    className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]">
                          <Folder size={12} className="text-[var(--accent)]" />
                          <span className="truncate max-w-[140px]">{suite.project_name || "General Workspace"}</span>
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono text-[11px]">
                        <span className="truncate max-w-[160px] block" title={suite.filename}>
                          {suite.filename || "Uploaded Project"}
                        </span>
                      </td>

                      {/* Test Cases Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                          {suite.total_cases ?? 0}
                        </span>
                      </td>

                      {/* Categories Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {(suite.categories || []).slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                CATEGORY_BADGES[cat] || "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]"
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                          {(suite.categories || []).length > 3 && (
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">
                              +{suite.categories.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Generated On */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] text-[11px]">
                        <div className="flex items-center gap-1.5" title={createdDate?.toLocaleString() || ""}>
                          <Calendar size={12} className="text-[var(--text-muted)]" />
                          <span>{createdDate ? formatRelativeTime(createdDate) : "—"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/test-history/${suite.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--accent)]/30 transition-all cursor-pointer"
                            title="View Test Suite"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSuiteToDelete(suite)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Test Suite"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {suiteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Delete Test Suite
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono truncate max-w-xs">
                      {suiteToDelete.title || suiteToDelete.filename}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSuiteToDelete(null)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete this test suite containing{" "}
                <strong className="text-[var(--text-primary)]">
                  {suiteToDelete.total_cases ?? 0} test cases
                </strong>
                ? This action will permanently remove it from your test history.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuiteToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>{isDeleting ? "Deleting..." : "Delete Test Suite"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
