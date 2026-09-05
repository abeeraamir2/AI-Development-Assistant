// src/components/requirement-analyzer/ScopeSelector.jsx
import React from "react";
import {
  FileText,
  CheckSquare,
  ListTodo,
  Code2,
  Database,
  AlertOctagon,
} from "lucide-react";

const SCOPES = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "criteria", label: "Acceptance Criteria", icon: CheckSquare },
  { id: "tasks", label: "Development Tasks", icon: ListTodo },
  { id: "api", label: "API Design", icon: Code2 },
  { id: "database", label: "Database Tables", icon: Database },
  { id: "edge_cases", label: "Edge Cases", icon: AlertOctagon },
];

export default function ScopeSelector({ selectedScopes, toggleScope }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Analysis Scope
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
        {SCOPES.map(({ id, label, icon: Icon }) => {
          const isActive = selectedScopes.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleScope(id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-w-0 ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}