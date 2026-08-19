import React from "react";
import { CheckCircle2, ListChecks } from "lucide-react";

export default function AcceptanceCriteriaCard({ criteria = [], onSelectCriterion }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
        <ListChecks size={16} className="text-[var(--accent)]" />
        Acceptance Criteria
      </div>

      <div className="space-y-3">
        {criteria.map((item, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onSelectCriterion(item)}
            className="w-full flex items-start justify-between gap-4 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {item.text}
              </p>
            </div>

            {item.src && (
              <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[9px] font-mono text-[var(--text-muted)] font-bold shrink-0">
                {item.src}
              </span>
            )}
          </button>
        ))}
      </div>

    </div>
  );
}