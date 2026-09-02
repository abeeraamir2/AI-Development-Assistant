// src/components/requirement-results/GroundedInsightBanner.jsx
import React from "react";
import { Network, ArrowRight } from "lucide-react";

export default function GroundedInsightBanner({ projectName = "Workspace Project", relatedCount = 0, onViewSources }) {
  const isGrounded = relatedCount > 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-[var(--accent)]">
          <Network size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {isGrounded ? "Grounded with project context" : "Direct Requirement Analysis"}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[9px] font-extrabold uppercase">
              AI INSIGHT
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {isGrounded
              ? `This analysis was informed by ${relatedCount} related requirement${relatedCount > 1 ? "s" : ""} from ${projectName}.`
              : `This analysis was generated directly from the uploaded specification for ${projectName}.`}
          </p>
        </div>
      </div>

      {isGrounded && (
        <button
          type="button"
          onClick={onViewSources}
          className="flex items-center gap-1 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          View Sources <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}