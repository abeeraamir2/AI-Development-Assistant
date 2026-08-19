// src/components/requirement-results/AnalysisHeader.jsx
import React from "react";
import { CheckCircle2, Layers, Gauge, Link2, Sparkles, RefreshCw, Download, MoreVertical } from "lucide-react";

export default function AnalysisHeader({ analysis, onReanalyze, onExport }) {
  return (
    <div className="space-y-4">
      {/* Top Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Requirement Analysis
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">{analysis?.title || "User Password Reset"}</span>
            <span>•</span>
            <span>Project: <strong className="text-[var(--text-primary)]">{analysis?.project || "Project Alpha"}</strong></span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
            <span>🕒 Analyzed just now</span>
            <span>•</span>
            <span>📄 {analysis?.filename || "req_pass_reset.pdf"}</span>
            <span>•</span>
            <span>ID: {analysis?.analysis_id || "ANL-8429"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
          <CheckCircle2 size={12} /> {analysis?.status || "COMPLETED"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] text-[10px] font-bold tracking-wider uppercase">
          <Layers size={12} /> TYPE: {analysis?.type || "FEATURE"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider uppercase">
          <Gauge size={12} /> COMPLEXITY: {analysis?.complexity || "MEDIUM"}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold tracking-wider uppercase">
          <Link2 size={12} /> {analysis?.related_count || 3} RELATED REQ FOUND
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
          <Sparkles size={12} /> CONFIDENCE: {analysis?.confidence || "HIGH"}
        </span>
      </div>
    </div>
  );
}