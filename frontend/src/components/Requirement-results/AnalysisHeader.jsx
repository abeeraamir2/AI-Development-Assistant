// src/components/requirement-results/AnalysisHeader.jsx
import React from "react";
import { CheckCircle2, Gauge, Link2, RefreshCw, Download } from "lucide-react";
import { formatRelativeTime } from "../../utils/dateUtils";

export default function AnalysisHeader({ analysis, onReanalyze, onExport }) {
  const rawRelatedCount = analysis?.related_count;
  const relatedCount = typeof rawRelatedCount === "number"
    ? rawRelatedCount
    : (analysis?.evidence?.related?.length || 0);

  const relativeTimeStr = formatRelativeTime(
    analysis?.created_at || analysis?.timestamp || analysis?.analyzed_at
  );
  const timeDisplay = relativeTimeStr.toLowerCase() === "just now"
    ? "Analyzed just now"
    : `Analyzed ${relativeTimeStr}`;

  const complexity = (analysis?.complexity || "MEDIUM").toUpperCase();
  const complexityColor = complexity === "HIGH"
    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
    : complexity === "LOW"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <div className="space-y-4">
      {/* Top Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Requirement Analysis
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">
              {analysis?.title || analysis?.filename || "Requirement Specification"}
            </span>
            <span>•</span>
            <span>
              Project: <strong className="text-[var(--text-primary)]">{analysis?.project || analysis?.project_name || "Workspace Project"}</strong>
            </span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
            <span>🕒 {timeDisplay}</span>
            <span>•</span>
            <span>📄 {analysis?.filename || "requirement_doc.txt"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReanalyze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} /> Re-analyze
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
          <CheckCircle2 size={12} /> {analysis?.status || "COMPLETED"}
        </span>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${complexityColor}`}>
          <Gauge size={12} /> COMPLEXITY: {complexity}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold tracking-wider uppercase">
          <Link2 size={12} /> {relatedCount} {relatedCount === 1 ? "RELATED REQ FOUND" : "RELATED REQS FOUND"}
        </span>
      </div>
    </div>
  );
}