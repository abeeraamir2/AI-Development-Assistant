// src/pages/developer/AnalysisHistoryPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import HistoryKPICards from "../../components/Analysis-history/HistoryKPICards";
import HistoryFilters from "../../components/Analysis-history/HistoryFilters";
import HistoryList from "../../components/Analysis-history/HistoryList";
import HistoryDetailDrawer from "../../components/Analysis-history/HistoryDetailDrawer";

const API_BASE = "http://localhost:8000";

function normalizeStatus(status) {
  if (!status) return "Completed";
  return status.toUpperCase().includes("REVIEW") ? "Needs Review" : "Completed";
}

function formatTimeAgo(date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

function normalizeListItem(raw) {
  const createdDate = raw.created_at ? new Date(raw.created_at) : null;
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
    timeAgo: createdDate ? formatTimeAgo(createdDate) : "",
  };
}

function normalizeDetailItem(raw) {
  const createdDate = raw.created_at ? new Date(raw.created_at) : null;
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
    timeAgo: createdDate ? formatTimeAgo(createdDate) : raw.timeAgo,
  };
}

export default function AnalysisHistoryPage({ authToken }) {
  const [rawItems, setRawItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const getToken = useCallback(
    () => authToken || localStorage.getItem("token") || localStorage.getItem("authToken"),
    [authToken]
  );

  // Fetch the history list on mount
  useEffect(() => {
    async function fetchHistory() {
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
          setSelectedId(normalized[0].id);
        }
      } catch (err) {
        console.log(err);
        setListError(err.message);
      } finally {
        setListLoading(false);
      }
    }
    fetchHistory();
  }, [getToken]);

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

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      const matchSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject =
        selectedProject === "All Projects" || item.project === selectedProject;
      const matchStatus =
        selectedStatus === "All" || item.status === selectedStatus;
      return matchSearch && matchProject && matchStatus;
    });
  }, [rawItems, searchQuery, selectedProject, selectedStatus]);

  const metrics = useMemo(() => {
    const total = rawItems.length;
    const completed = rawItems.filter((i) => i.status === "Completed").length;
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
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
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
              />

              <HistoryList
                items={filteredItems}
                selectedId={selectedListItem?.id}
                onSelectItem={(item) => setSelectedId(item.id)}
                totalCount={rawItems.length}
              />
            </div>

            {/* Right Detail Panel */}
            <div className="lg:col-span-4 sticky top-6">
              <HistoryDetailDrawer
                item={drawerItem}
                detailLoading={detailLoading}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}