// src/components/developer-overview/RecentAnalysesTable.jsx
import React from "react";
import { FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecentAnalysisTable({ analyses = [] }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
          <span>🕒</span> Recent Analyses
        </h2>
        <button
          onClick={() => navigate("/history")}
          className="text-xs font-semibold flex items-center gap-1 text-[var(--accent)] hover:underline cursor-pointer"
        >
          View All <ArrowRight size={13} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase font-semibold">
              <th className="py-2.5 px-3">Requirement</th>
              <th className="py-2.5 px-3">Project</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {analyses.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                <td className="py-3.5 px-3 font-semibold flex items-center gap-2">
                  <FileText size={15} className="text-[var(--text-muted)]" />
                  <span>{row.requirement}</span>
                </td>
                <td className="py-3.5 px-3 text-[var(--text-secondary)]">{row.project}</td>
                <td className="py-3.5 px-3 text-[var(--text-muted)]">{row.time}</td>
                <td className="py-3.5 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      row.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === "Completed" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}