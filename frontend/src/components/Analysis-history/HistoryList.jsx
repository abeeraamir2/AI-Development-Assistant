// src/components/history/HistoryList.jsx
import React from "react";
import { FileText, Cpu, AlertCircle } from "lucide-react";

export default function HistoryList({
  items = [],
  selectedId,
  onSelectItem,
  totalCount,
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--bg-surface)] shadow-md ring-1 ring-[var(--accent)]/30"
                  : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/50"
              }`}
            >
              {/* Left Column: Icon, Title, RAG badge, filename */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isSelected
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
                      : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-muted)]"
                  }`}
                >
                  <FileText size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {item.title}
                    </h3>
                    {item.isRAGGrounded && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-extrabold uppercase text-[var(--accent)] tracking-wider">
                        <Cpu size={10} /> RAG GROUNDED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                    {item.filename}
                  </p>
                </div>
              </div>

              {/* Middle/Right: Project & Date metadata */}
              <div className="hidden md:flex flex-col text-left text-xs min-w-[140px]">
                <span className="font-semibold text-[var(--text-primary)] truncate">
                  {item.project}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {item.date} • {item.time}
                </span>
              </div>

              {/* Right: Status badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    item.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "Completed" ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  {item.status}
                </span>
                {item.similarityWarning && (
                  <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                    <AlertCircle size={11} /> {item.similarityWarning}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer Indicator */}
      <div className="pt-2 text-[11px] text-[var(--text-muted)] font-medium">
        Showing <strong className="text-[var(--text-primary)]">1–{items.length}</strong> of{" "}
        <strong className="text-[var(--text-primary)]">{totalCount || 18}</strong> analyses
      </div>
    </div>
  );
}