// src/components/requirement-analyzer/RelatedRequirementsCard.jsx
import React from "react";
import { GitFork, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RelatedRequirementsCard({ relatedReqs = [], loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[var(--text-primary)]">
          <GitFork size={15} className="text-[var(--accent)]" />
          <span>Related Requirements</span>
        </div>
        {relatedReqs.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            {relatedReqs.length} Found
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Sparkles size={13} className="animate-spin text-[var(--accent)]" />
          Checking database for related context...
        </div>
      ) : relatedReqs.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            No related requirements found in this project's database yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {relatedReqs.map((req, idx) => (
            <div
              key={req.id || idx}
              onClick={() => navigate("/history")}
              className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer shadow-xs space-y-1.5"
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[var(--accent)] font-bold">{req.id || `REQ-${idx + 1}`}</span>
                <span className="font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {req.matchPercent || req.match || 85}% Match
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
                {req.title || req.excerpt}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}