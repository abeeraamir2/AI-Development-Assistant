// src/components/requirement-results/EvidenceDrawer.jsx
import React from "react";
import { ShieldCheck, FileText, CheckCircle, Code2 } from "lucide-react";

export default function EvidenceDrawer({ evidence }) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <ShieldCheck size={16} className="text-[var(--accent)]" /> Evidence
      </div>

      {/* Active Context Card */}
      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[var(--accent)] text-[9px] font-bold uppercase tracking-wider">
            ACTIVE CONTEXT
          </span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">
            {evidence?.active_context?.title }
          </h4>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            Source Document: {evidence?.active_context?.source_doc}
          </p>
        </div>

        <blockquote className="p-3 rounded-lg bg-[var(--bg-surface)] border-l-2 border-[var(--accent)] text-[11px] italic text-[var(--text-secondary)]">
          "{evidence?.active_context?.excerpt }"
        </blockquote>

        {/* Informs Output List */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            INFORMS OUTPUT
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <FileText size={13} className="text-[var(--accent)]" />
              <span>TASK-001 (Email Template)</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <CheckCircle size={13} className="text-emerald-400" />
              <span>Acceptance Criteria 03</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Code2 size={13} className="text-amber-400" />
              <span>API Response Message</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Requirements Match List */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          RELATED REQUIREMENTS
        </span>
        <div className="space-y-2">
          {(evidence?.related || [
            { id: "REQ-002", match: "91%" },
            { id: "SEC-04", match: "84%" },
            { id: "SEC-05", match: "76%" },
          ]).map((rel, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono font-bold text-[var(--text-primary)]">{rel.id}</span>
              </div>
              <span className="font-bold text-emerald-400 text-[11px]">{rel.match} match</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}