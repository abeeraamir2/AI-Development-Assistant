// src/components/requirement-analyzer/RelatedRequirementsCard.jsx
import React from "react";
import { GitFork } from "lucide-react";

export default function RelatedRequirementsCard({ relatedReqs = [] }) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
        <GitFork size={15} className="text-[var(--accent)]" />
        <span>Related Requirements</span>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        {relatedReqs.length} related requirements found in context.
      </p>

      <div className="space-y-3">
        {relatedReqs.map((req) => (
          <div
            key={req.id}
            className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-center text-[10px] font-mono mb-1">
              <span className="text-[var(--text-muted)]">{req.id}</span>
              <span className="font-bold text-emerald-400">{req.matchPercent}% Match</span>
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {req.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}