// src/components/developer-overview/ActiveProjectsAndActions.jsx
import React from "react";
import { Plus, UploadCloud, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActiveProjectsAndActions({ projects = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Active Projects Activity */}
      <div className="lg:col-span-7 p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
        <h2 className="font-bold text-base tracking-wide">Active Projects Activity</h2>

        <div className="space-y-4 pt-1">
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>{proj.name}</span>
                <span className="text-[var(--text-muted)]">{proj.reqs} Reqs</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${proj.percent || 50}%`,
                    backgroundColor: proj.color || "var(--accent)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="lg:col-span-5 p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
        <h2 className="font-bold text-base tracking-wide">Quick Actions</h2>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* New Analysis */}
          <button
            onClick={() => navigate("/analyzer")}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)] text-xs font-bold transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
              <Plus size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">New Analysis</span>
          </button>

          {/* Upload Req */}
          <button
            onClick={() => navigate("/analyzer")}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-emerald-500 text-xs font-bold transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadCloud size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">Upload Req</span>
          </button>

          {/* View History */}
          <button
            onClick={() => navigate("/history")}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-amber-500 text-xs font-bold transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <History size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}