// src/components/requirement-analyzer/RecentAnalysisList.jsx
import React from "react";
import { FileText, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecentAnalysisList({ recentList = [], loading = false }) {
  const navigate = useNavigate();

  const formatTime = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm tracking-wide text-[var(--text-primary)] flex items-center gap-2">
          <Clock size={16} className="text-[var(--accent)]" />
          Recent Analyses
        </h2>
        {recentList.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
          >
            View Full History →
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Sparkles size={14} className="animate-spin text-[var(--accent)]" />
          Loading recent analyses from database...
        </div>
      ) : recentList.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            No recent analyses done yet. Upload or enter a requirement above to run your first analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/history`)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                  <FileText size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Analyzed {formatTime(item.created_at || item.time)} • {item.project_name || item.project || "Workspace Project"}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === "COMPLETED" || item.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                • {item.status || "COMPLETED"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}