import React from "react";
import {
  X,
  ExternalLink,
  ChevronRight,
  FileText,
  ListChecks,
  Code2,
  FileCode,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// The full analysis result always has (up to) these 6 generated sections,
// matching what ResultsPage renders. We only show the first 3 inline here
// (Summary, Acceptance Criteria, APIs); the rest are summarized as "+N more".
function buildSectionDefs(item) {
  return [
    { key: "summary", label: "Summary", icon: FileText, hasContent: !!item.summary },
    { key: "criteria", label: "Acceptance Criteria", icon: ListChecks, hasContent: (item.criteria || []).length > 0 },
    { key: "apis", label: "APIs", icon: Code2, hasContent: (item.apis || []).length > 0 },
    { key: "tasks", label: "Developer Tasks", hasContent: (item.tasks || []).length > 0 },
    { key: "db_tables", label: "Database Schema", hasContent: (item.db_tables || []).length > 0 },
    { key: "edge_cases", label: "Edge Cases", hasContent: (item.edge_cases || []).length > 0 },
  ];
}

export default function HistoryDetailDrawer({ item, detailLoading, onClose, onDelete, isDeleting }) {
  const navigate = useNavigate();

  if (!item) return null;

  const handleOpenFull = () => {
    navigate("/results", { state: { result: item } });
  };

  const sectionDefs = buildSectionDefs(item);
  const visibleSections = sectionDefs.slice(0, 3);
  const totalAvailable = sectionDefs.filter((s) => s.hasContent).length;
  const remainingCount = Math.max(totalAvailable - visibleSections.filter((s) => s.hasContent).length, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl overflow-hidden">
      {/* Drawer Top Bar */}
      <div className="p-5 border-b border-[var(--border-color)] space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
              item.status === "Completed"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {item.status}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">
              {item.timeAgo || ""}
            </span>
            <button
              type="button"
              onClick={() => onDelete?.(item.id, item.title)}
              disabled={isDeleting}
              title="Delete this analysis"
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={15} className="animate-spin text-rose-500" /> : <Trash2 size={15} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
            {item.title}
          </h2>
          <p className="text-xs text-[var(--accent)] font-semibold mt-0.5">
            {item.project}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-5">
        {/* AI Summary */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            AI Summary
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-primary)] p-3.5 rounded-xl border border-[var(--border-color)]">
            {detailLoading ? "Loading summary..." : item.summary || "No summary available."}
          </p>
        </div>

        {/* Generated Sections */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Generated Sections ({totalAvailable || 6})</span>
          </div>

          <div className="space-y-2">
            {visibleSections.map(({ label, icon: Icon = FileText, key }) => (
              <div
                key={key}
                onClick={handleOpenFull}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Icon size={15} className="text-[var(--accent)]" />
                  <span>{label}</span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5"
                />
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <p className="text-center text-[10px] text-[var(--text-muted)] font-medium pt-1">
              + {remainingCount} more section{remainingCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Source Documents */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Source Documents
          </h4>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="p-2 rounded-lg bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-color)]">
              <FileCode size={16} />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate font-mono">
                {item.filename || "No source document"}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Uploaded {item.date}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions CTA */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onDelete?.(item.id, item.title)}
          disabled={isDeleting}
          title="Delete this analysis"
          className="p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
        <button
          type="button"
          onClick={handleOpenFull}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <span>Open Full Analysis</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}