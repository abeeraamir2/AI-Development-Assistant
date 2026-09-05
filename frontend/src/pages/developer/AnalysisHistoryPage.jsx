import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast, Toaster } from "sonner";
import HistoryKPICards from "../../components/Analysis-history/HistoryKPICards";
import HistoryFilters from "../../components/Analysis-history/HistoryFilters";
import HistoryList from "../../components/Analysis-history/HistoryList";
import HistoryDetailDrawer from "../../components/Analysis-history/HistoryDetailDrawer";
import { parseDate, formatRelativeTime } from "../../utils/dateUtils";

const API_BASE = "http://localhost:8000";

function normalizeStatus(status) {
  if (!status) return "Completed";
  const s = String(status).toUpperCase();
  if (s.includes("REVIEW")) return "Needs Review";
  if (s.includes("APPROV")) return "Approved";
  return "Completed";
}

function normalizeListItem(raw) {
  const createdDate = parseDate(raw.created_at);
  return {
    id: raw.id,
    title: raw.title,
    filename: raw.filename,
    project: raw.project_name,
    project_id: raw.project_id,
    status: normalizeStatus(raw.status),
    summary: raw.summary,
    date: createdDate
      ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "",
    time: createdDate
      ? createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "",
    timeAgo: createdDate ? formatRelativeTime(createdDate) : "",
  };
}

function normalizeDetailItem(raw) {
  const createdDate = parseDate(raw.created_at);
  return {
    ...raw,
    id: raw.id || raw._id,
    project: raw.project || raw.project_name,
    status: normalizeStatus(raw.status),
    date: createdDate
      ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : raw.date,
    time: createdDate
      ? createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : raw.time,
    timeAgo: createdDate ? formatRelativeTime(createdDate) : raw.timeAgo,
  };
}

export default function AnalysisHistoryPage({ authToken }) {
  const location = useLocation();

  const [rawItems, setRawItems] = useState([]);
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_projects");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(
    location.state?.projectName || location.state?.project || "All Projects"
  );
  const [selectedStatus, setSelectedStatus] = useState("All");

  const getToken = useCallback(
    () => authToken || localStorage.getItem("token") || localStorage.getItem("authToken"),
    [authToken]
  );

  // Fetch project list to enrich project filter options
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${API_BASE}/projects`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const projs = await res.json();
          setProjects(projs);
          localStorage.setItem("cached_projects", JSON.stringify(projs));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadProjects();
  }, [getToken]);

  const projectOptions = useMemo(() => {
    const fromItems = rawItems.map((i) => i.project).filter(Boolean);
    const fromProjects = projects.map((p) => p.name).filter(Boolean);
    const unique = Array.from(new Set([...fromItems, ...fromProjects]));
    return ["All Projects", ...unique];
  }, [rawItems, projects]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProject("All Projects");
    setSelectedStatus("All");
  };

  const fetchHistoryList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to load analysis history.");
      const data = await res.json();
      const normalized = data.map(normalizeListItem);
      setRawItems(normalized);
      if (normalized.length > 0) {
        setSelectedId((prev) => prev || normalized[0].id);
      }
    } catch (err) {
      console.log(err);
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  }, [getToken]);

  // Fetch the history list on mount
  useEffect(() => {
    fetchHistoryList();
  }, [fetchHistoryList]);

  // Fetch full detail whenever the selected row changes
  useEffect(() => {
    if (!selectedId) {
      setDetailItem(null);
      return;
    }
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const res = await fetch(`${API_BASE}/history/${selectedId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to load analysis detail.");
        const data = await res.json();
        setDetailItem(normalizeDetailItem(data));
      } catch (err) {
        console.log(err);
        setDetailItem(null);
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetail();
  }, [selectedId, getToken]);

  const handleStatusChange = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    // Optimistic UI update
    setRawItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (detailItem && detailItem.id === id) {
      setDetailItem((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await fetch(`${API_BASE}/history/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update workflow status.");
      }
      toast.success(`Workflow status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Failed to update workflow status.");
      fetchHistoryList();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAnalysis = async (id, title) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete analysis.");
      }
      toast.success(`Analysis "${title || 'Requirement'}" deleted successfully.`);
      setRawItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        if (selectedId === id) {
          setSelectedId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });
    } catch (err) {
      toast.error(err.message || "Failed to delete analysis.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.filename?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q);

      const matchProject =
        selectedProject === "All Projects" ||
        item.project?.toLowerCase() === selectedProject.toLowerCase() ||
        item.project_id === selectedProject;

      const matchStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchSearch && matchProject && matchStatus;
    });
  }, [rawItems, searchQuery, selectedProject, selectedStatus]);

  const metrics = useMemo(() => {
    const total = rawItems.length;
    const completed = rawItems.filter(
      (i) => i.status === "Completed" || i.status === "Approved"
    ).length;
    const needsReview = rawItems.filter((i) => i.status === "Needs Review").length;
    const completedRate = total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";
    return { total, completed, completedRate, needsReview };
  }, [rawItems]);

  // Prefer the fully-loaded detail (has criteria/tasks/apis/etc.); fall back
  // to the lightweight list row while the detail fetch is in flight.
  const selectedListItem = rawItems.find((i) => i.id === selectedId) || filteredItems[0];
  const drawerItem =
    detailItem && detailItem.id === selectedListItem?.id
      ? { ...selectedListItem, ...detailItem }
      : selectedListItem;

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
          <span>Analyzer</span>
          <span>›</span>
          <span className="text-[var(--text-primary)] font-bold">History</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Analysis History</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Review and revisit your previous requirement analyses.
        </p>
      </div>

      {listLoading ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          Loading analysis history...
        </div>
      ) : listError ? (
        <div className="p-8 text-center text-xs text-red-500">{listError}</div>
      ) : rawItems.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          No analyses yet. Run your first analysis to see it here.
        </div>
      ) : (
        <>
          {/* Metric Cards Row */}
          <HistoryKPICards metrics={metrics} />

          {/* Main Grid: Left (Filters + List) | Right (Slide Drawer) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-5">
              <HistoryFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                projectOptions={projectOptions}
                onResetFilters={handleResetFilters}
              />

              <HistoryList
                items={filteredItems}
                selectedId={selectedListItem?.id}
                onSelectItem={(item) => setSelectedId(item.id)}
                onDelete={handleDeleteAnalysis}
                deletingId={deletingId}
                totalCount={rawItems.length}
              />
            </div>

            {/* Right Detail Panel */}
            <div className="lg:col-span-4 sticky top-6">
              <HistoryDetailDrawer
                item={drawerItem}
                detailLoading={detailLoading}
                onClose={() => setSelectedId(null)}
                onDelete={handleDeleteAnalysis}
                isDeleting={deletingId === drawerItem?.id}
                onStatusChange={handleStatusChange}
                isUpdatingStatus={isUpdatingStatus}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}