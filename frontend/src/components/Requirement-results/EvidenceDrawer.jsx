// src/components/Requirement-results/EvidenceDrawer.jsx
import React from "react";
import {
  ShieldCheck,
  FileText,
  CheckSquare,
  Code2,
  Database,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Sparkles,
  Info,
  X,
} from "lucide-react";

export default function EvidenceDrawer({ evidence, onClearEvidence }) {
  // Smooth scroll to main page sections when clicking derived outputs
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 1. EMPTY STATE (When no Acceptance Criterion is selected)
  if (!evidence) {
    return (
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          <span>Evidence & Traceability</span>
        </div>

        <div className="p-6 rounded-xl bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mx-auto flex items-center justify-center shadow-xs">
            <Layers size={22} />
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">
              Inspect Requirement Evidence
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Select an <strong className="text-[var(--text-primary)]">Acceptance Criterion</strong> from the left to inspect its grounded source specifications, vector similarity matches, and derived tasks & APIs.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium">
            <Sparkles size={12} className="text-[var(--accent)]" />
            <span>Click any AC item to begin inspecting</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-subtle)]/40 border border-[var(--border-color)]/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-primary)]">
            <Info size={13} className="text-[var(--accent)] shrink-0" />
            <span>Traceability Framework</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            Every acceptance criterion is cross-referenced with uploaded documents, project background embeddings, and derived architectural outputs to ensure zero hallucinations.
          </p>
        </div>
      </div>
    );
  }

  const {
    criterionLabel,
    criterionText,
    source,
    derived_outputs = {},
    related = [],
    summary = {},
  } = evidence;

  const { tasks = [], apis = [], db_tables = [], edge_cases = [] } = derived_outputs;
  const hasDerivedOutputs = tasks.length > 0 || apis.length > 0 || db_tables.length > 0 || edge_cases.length > 0;
  const hasRelatedReqs = related.length > 0;

  return (
    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)]/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          <span>Evidence & Traceability</span>
        </div>
        {onClearEvidence && (
          <button
            type="button"
            onClick={onClearEvidence}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
            title="Deselect Criterion"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ACTIVE CONTEXT CARD */}
      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[var(--accent)] text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20">
            ACTIVE CONTEXT
          </span>
          <span className="font-mono text-[10px] font-bold text-[var(--text-muted)]">
            {criterionLabel}
          </span>
        </div>

        <blockquote className="p-3 rounded-lg bg-[var(--bg-surface)] border-l-2 border-[var(--accent)] text-xs italic text-[var(--text-primary)] font-medium leading-relaxed">
          "{criterionText}"
        </blockquote>
      </div>

      {/* 1. SOURCE EVIDENCE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            1. Source Evidence
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
            {source?.originType || "Direct Source"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-[var(--accent)] shrink-0" />
            <span className="text-xs font-bold text-[var(--text-primary)] truncate">
              {source?.documentName || "Uploaded Specification"}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
            "{source?.excerpt}"
          </p>

          <div className="pt-2 border-t border-[var(--border-color)]/60 text-[11px] text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text-primary)] font-semibold">Relationship: </strong>
            {source?.relationship || "Directly defines this acceptance criterion in the specification."}
          </div>
        </div>
      </div>

      {/* 2. DERIVED OUTPUTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            2. Derived Outputs
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            Generated artifacts
          </span>
        </div>

        {!hasDerivedOutputs ? (
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            No derived tasks or APIs are specifically linked to this criterion.
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Derived Tasks */}
            {tasks.map((task, idx) => {
              const taskId = task.id || `TASK-${String(idx + 1).padStart(3, "0")}`;
              const taskTitle = task.title || "Implement functionality";
              const taskDesc = task.description || "";

              return (
                <div
                  key={idx}
                  onClick={() => scrollToSection("tasks-section")}
                  className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckSquare size={13} className="text-[var(--accent)] shrink-0" />
                      <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">
                        {taskId}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)] flex items-center gap-1 group-hover:text-[var(--accent)]">
                      <span>Task</span>
                      <ArrowUpRight size={10} />
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                    {taskTitle}
                  </p>

                  {taskDesc && (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {taskDesc}
                    </p>
                  )}

                  <div className="pt-1 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                    <span className="text-[var(--accent)] font-medium">
                      Acceptance Criterion → Task
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Derived APIs */}
            {apis.map((api, idx) => {
              const method = api.method || "API";
              const endpoint = api.endpoint || (typeof api === "string" ? api : "Endpoint");

              return (
                <div
                  key={idx}
                  onClick={() => scrollToSection("apis-section")}
                  className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 size={13} className="text-amber-500 shrink-0" />
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[9px]">
                        {method}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-primary)] truncate">
                        {endpoint}
                      </span>
                    </div>
                    <ArrowUpRight size={11} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    <span className="text-amber-500 font-medium">Acceptance Criterion → API</span>
                  </div>
                </div>
              );
            })}

            {/* Derived DB Tables */}
            {db_tables.map((table, idx) => {
              const tableName = table.table_name || (typeof table === "string" ? table : "Table");

              return (
                <div
                  key={idx}
                  onClick={() => scrollToSection("database-section")}
                  className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Database size={13} className="text-purple-500 shrink-0" />
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)] truncate">
                        {tableName}
                      </span>
                    </div>
                    <ArrowUpRight size={11} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    <span className="text-purple-500 font-medium">Acceptance Criterion → Schema</span>
                  </div>
                </div>
              );
            })}

            {/* Derived Edge Cases */}
            {edge_cases.map((ec, idx) => {
              const ecTitle = ec.title || (typeof ec === "string" ? ec : "Edge Case");

              return (
                <div
                  key={idx}
                  onClick={() => scrollToSection("edge-cases-section")}
                  className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle size={13} className="text-rose-400 shrink-0" />
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {ecTitle}
                      </span>
                    </div>
                    <ArrowUpRight size={11} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    <span className="text-rose-400 font-medium">Acceptance Criterion → Edge Case</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. RELATED REQUIREMENTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            3. Related Requirements
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-medium" title="Semantic similarity indicates how closely this requirement matches the selected acceptance criterion based on vector analysis.">
            <span>Vector Match</span>
            <HelpCircle size={11} className="opacity-70" />
          </div>
        </div>

        {!hasRelatedReqs ? (
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            No supporting background evidence was found for this acceptance criterion.
          </div>
        ) : (
          <div className="space-y-3">
            {related.map((rel, idx) => {
              const reqId = rel.id && !rel.id.toUpperCase().includes("ORIGINAL") && rel.id !== "UNKNOWN"
                ? rel.id
                : `REQ-${String(idx + 1).padStart(3, "0")}`;
              const displayTitle = rel.title && !rel.title.toUpperCase().includes("ORIGINAL") && rel.title !== reqId
                ? rel.title
                : "";

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)] truncate">
                        {reqId}{displayTitle ? ` — ${displayTitle}` : ""}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {rel.match} similarity
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                    "{rel.excerpt}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. EVIDENCE SUMMARY */}
      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-2.5">
          <h5 className="text-xs font-bold text-[var(--text-primary)]">
            Evidence Summary
          </h5>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            {summary?.totalPieces || 1} Supporting Items
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center justify-between">
            <span>• Direct source requirement</span>
            <span className="font-bold text-[var(--text-primary)]">{summary?.directSourceCount || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Related background requirements</span>
            <span className="font-bold text-[var(--text-primary)]">{summary?.relatedReqsCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Derived tasks</span>
            <span className="font-bold text-[var(--text-primary)]">{summary?.derivedTasksCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>• Derived API contracts</span>
            <span className="font-bold text-[var(--text-primary)]">{summary?.derivedApisCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}