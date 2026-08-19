import React from "react";
import { Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function APIsSection({ apiContract = [] }) {

  const apis = Array.isArray(apiContract)
    ? apiContract
    : [apiContract];

  const handleCopy = (api) => {
    navigator.clipboard.writeText(api);
    toast.success("API endpoint copied!");
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
        <Code2
          size={16}
          className="text-[var(--accent)]"
        />

        Proposed API Contracts
      </div>

      <div className="space-y-3">

        {apis.map((api, idx) => {

          const endpoint =
            typeof api === "string"
              ? api
              : api?.endpoint || "";

          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
            >

              <div className="flex items-center gap-3 min-w-0">

                <span className="px-2 py-1 rounded bg-amber-500 text-black font-extrabold text-[10px]">
                  API
                </span>

                <span className="font-mono text-xs text-[var(--text-primary)] break-all">
                  {endpoint}
                </span>

              </div>

              <button
                type="button"
                onClick={() => handleCopy(endpoint)}
                className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Copy size={14} />
              </button>

            </div>
          );

        })}

      </div>

    </div>
  );
}