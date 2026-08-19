import React from "react";
import { AlertTriangle } from "lucide-react";

export default function EdgeCasesSection({ edgeCases = [] }) {

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">

        <AlertTriangle
          size={16}
          className="text-amber-400"
        />

        Edge Cases

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {edgeCases.map((ec, idx) => {

          let title = "";
          let description = "";
          let src = "";

          if (typeof ec === "string") {

            title = `Edge Case ${idx + 1}`;
            description = ec;

          } else {

            title = ec?.title || `Edge Case ${idx + 1}`;
            description = ec?.description || "";
            src = ec?.src || "";

          }

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2.5 hover:border-amber-400/40 transition-colors"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <AlertTriangle
                    size={16}
                    className="text-amber-400"
                  />

                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {title}
                  </h4>

                </div>

                {src && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[9px] font-mono font-bold text-[var(--text-muted)] border border-[var(--border-color)]">
                    {src}
                  </span>
                )}

              </div>

              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {description}
              </p>

            </div>
          );

        })}

      </div>

    </div>
  );
}