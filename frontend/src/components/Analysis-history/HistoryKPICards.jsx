// src/components/history/HistoryKPICards.jsx
import React from "react";
import { FolderGit2, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

export default function HistoryKPICards({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Analyses */}
      <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            Total Analyses
          </p>
          <p className="text-3xl font-extrabold mt-2">{metrics?.total || 18}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--bg-primary)] text-[var(--text-muted)]">
          <FolderGit2 size={24} />
        </div>
      </div>

      {/* Completed */}
      <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            Completed
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold">{metrics?.completed || 15}</span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={12} /> {metrics?.completedRate || "83%"}
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* Needs Review */}
      <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            Needs Review
          </p>
          <p className="text-3xl font-extrabold mt-2">
            {String(metrics?.needsReview || 3).padStart(2, "0")}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
          <AlertTriangle size={24} />
        </div>
      </div>
    </div>
  );
}