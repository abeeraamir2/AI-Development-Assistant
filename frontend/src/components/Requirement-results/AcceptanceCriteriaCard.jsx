import React from "react";
import { CheckCircle2, ListChecks, ArrowRight } from "lucide-react";

export default function AcceptanceCriteriaCard({
  criteria = [],
  selectedCriterionIndex = null,
  onSelectCriterion,
}) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          <ListChecks size={16} className="text-[var(--accent)]" />
          <span>Acceptance Criteria</span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          Click any criterion to inspect evidence & derived outputs
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map((item, idx) => {
          const isSelected = selectedCriterionIndex === idx;
          const label = `AC-${String(idx + 1).padStart(2, "0")}`;

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectCriterion && onSelectCriterion(item, idx)}
              className={`w-full flex items-start justify-between gap-4 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm ring-1 ring-[var(--accent)]/40"
                  : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-surface)]"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <CheckCircle2
                  size={16}
                  className={`shrink-0 mt-0.5 ${
                    isSelected ? "text-[var(--accent)]" : "text-emerald-400"
                  }`}
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)]">
                      {label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-[var(--accent)] animate-pulse">
                        Active in Evidence Drawer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.src && item.src.toUpperCase() !== "ORIGINAL" && (
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[9px] font-mono text-[var(--accent)] font-bold">
                    {item.src}
                  </span>
                )}
                <ArrowRight
                  size={14}
                  className={`transition-transform ${
                    isSelected
                      ? "text-[var(--accent)] translate-x-0.5"
                      : "text-[var(--text-muted)] opacity-40 group-hover:opacity-100"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}