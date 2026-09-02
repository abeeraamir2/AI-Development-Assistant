// src/components/requirement-analyzer/RelatedRequirementsCard.jsx
import React from "react";
import { GitFork, Sparkles, FileText, CheckCircle2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RelatedRequirementsCard({
  relatedReqs = [],
  loading = false,
  hasQuery = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[var(--text-primary)]">
          {hasQuery ? (
            <GitFork size={15} className="text-[var(--accent, #4d8bf8)]" />
          ) : (
            <FileText size={15} className="text-[var(--accent, #4d8bf8)]" />
          )}
          <span>{hasQuery ? "Related Requirements" : "Project Context Requirements"}</span>
        </div>

        {relatedReqs.length > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              hasQuery
                ? "bg-[#4d8bf8]/10 text-[#4d8bf8]"
                : "bg-slate-500/10 text-[var(--text-muted)]"
            }`}
          >
            {hasQuery ? `${relatedReqs.length} Matches` : `${relatedReqs.length} Stored`}
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Sparkles size={13} className="animate-spin text-[var(--accent, #4d8bf8)]" />
          <span>Searching project database for semantic matches...</span>
        </div>
      ) : relatedReqs.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] space-y-1">
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            {hasQuery ? "No matching requirements found" : "No project requirements stored yet"}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            {hasQuery
              ? "Your current input does not semantically overlap with existing requirements in this project."
              : "Completed analyses will automatically store requirements for future cross-referencing."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {relatedReqs.map((req, idx) => {
            const hasMatchScore = typeof req.matchPercent === "number" && req.matchPercent > 0;
            const matchScore = req.matchPercent || 0;

            const badgeColor =
              matchScore >= 80
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : matchScore >= 65
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20";

            return (
              <div
                key={req.id || idx}
                onClick={() => navigate("/history")}
                className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent, #4d8bf8)]/50 transition-all cursor-pointer shadow-xs space-y-1.5"
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[var(--accent, #4d8bf8)] font-bold">
                    {req.id || `REQ-${idx + 1}`}
                  </span>

                  {hasMatchScore ? (
                    <span className={`font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                      {matchScore}% Match
                    </span>
                  ) : (
                    <span className="font-medium px-1.5 py-0.2 rounded bg-slate-500/10 text-[var(--text-muted)]">
                      Project Context
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
                  {req.title || req.excerpt}
                </p>
              </div>
            );
          })}

          {!hasQuery && relatedReqs.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] text-center pt-1 flex items-center justify-center gap-1">
              <Search size={11} />
              <span>Start typing on the left to see live semantic matches.</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}