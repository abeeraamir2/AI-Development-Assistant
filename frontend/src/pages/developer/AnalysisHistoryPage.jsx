// src/pages/developer/DeveloperHistoryPage.jsx
import React, { useState, useMemo } from "react";
import HistoryKPICards from "../../components/Analysis-history/HistoryKPICards";
import HistoryFilters from "../../components/Analysis-history/HistoryFilters";
import HistoryList from "../../components/Analysis-history/HistoryList";
import HistoryDetailDrawer from "../../components/Analysis-history/HistoryDetailDrawer";

const INITIAL_HISTORY = [
  {
    id: "1",
    title: "Password Reset",
    filename: "Password_Reset_Requirement.pdf",
    project: "Project Alpha",
    date: "Aug 16, 2026",
    time: "14:23",
    timeAgo: "2 days ago",
    status: "Completed",
    isRAGGrounded: true,
    fileSize: "2.4 MB",
    summary:
      "Analysis of the standard password reset flow via email link. Requirements specify a 15-minute token expiration, minimum password complexity (8 chars, 1 number, 1 special), and rate limiting to prevent enumeration attacks.",
  },
  {
    id: "2",
    title: "User Auth Flow V2",
    filename: "auth_flow_v2_draft.docx",
    project: "E-Commerce Platform",
    date: "Aug 15, 2026",
    time: "09:12",
    timeAgo: "3 days ago",
    status: "Needs Review",
    similarityWarning: "87% similarity",
    isRAGGrounded: false,
    fileSize: "1.1 MB",
    summary:
      "OAuth 2.0 social login additions and multi-factor authentication triggers for high-risk IP logins.",
  },
  {
    id: "3",
    title: "Checkout Integration API",
    filename: "Stripe_Integration_Reqs.pdf",
    project: "E-Commerce Platform",
    date: "Aug 14, 2026",
    time: "16:45",
    timeAgo: "4 days ago",
    status: "Completed",
    isRAGGrounded: false,
    fileSize: "3.8 MB",
    summary:
      "Stripe payment intent webhook integrations, idempotency handling, and invoice receipt generation.",
  },
];

export default function DeveloperHistoryPage() {
  const [items] = useState(INITIAL_HISTORY);
  const [selectedId, setSelectedId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Filter list based on controls
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject =
        selectedProject === "All Projects" || item.project === selectedProject;
      const matchStatus =
        selectedStatus === "All" || item.status === selectedStatus;
      return matchSearch && matchProject && matchStatus;
    });
  }, [items, searchQuery, selectedProject, selectedStatus]);

  const selectedItem = items.find((i) => i.id === selectedId) || filteredItems[0];

  const metrics = {
    total: 18,
    completed: 15,
    completedRate: "83%",
    needsReview: 3,
  };

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
            selectedId={selectedItem?.id}
            onSelectItem={(item) => setSelectedId(item.id)}
            totalCount={items.length}
          />
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <HistoryDetailDrawer
            item={selectedItem}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
}