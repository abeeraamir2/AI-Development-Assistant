import React from "react";
import { CheckSquare, ExternalLink } from "lucide-react";

export default function GeneratedTasksSection({
  tasks = [],
  onExportJira
}) {

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          <CheckSquare
            size={16}
            className="text-[var(--accent)]"
          />

          Generated Tasks
        </div>

        <button
          type="button"
          onClick={onExportJira}
          className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
        >
          Export to Jira
          <ExternalLink size={13} />
        </button>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {tasks.map((task, idx) => {

          let title = "";
          let description = "";
          let id = "";
          let src = "";

          if (typeof task === "string") {
            title = task;
            id = `TASK-${String(idx + 1).padStart(3, "0")}`;
          } else {
            id = task?.id || `TASK-${String(idx + 1).padStart(3, "0")}`;
            title = task?.title || "";
            description = task?.description || "";
            src = task?.src || "";
          }

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2 hover:border-[var(--accent)]/40 transition-colors"
            >

              <div className="flex items-center justify-between">

                <span className="font-mono text-[11px] font-extrabold text-[var(--accent)]">
                  {id}
                </span>

                {src && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[9px] font-mono font-bold text-[var(--text-muted)] border border-[var(--border-color)]">
                    {src}
                  </span>
                )}

              </div>

              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {title}
              </h4>

              {description && (
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {description}
                </p>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}