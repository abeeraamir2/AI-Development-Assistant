import React from "react";
import { Gauge, RotateCw, CheckCircle2, Calendar } from "lucide-react";

export default function AdminKPICards({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Velocity */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Velocity</span>
          <Gauge size={18} className="text-[var(--text-muted)] opacity-60" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              {metrics?.velocity || 42}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              ↑ 12%
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Pts / Sprint avg</p>
        </div>
      </div>

      {/* Completion */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Completion</span>
          <RotateCw size={18} className="text-[var(--text-muted)] opacity-60" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)]">
              {metrics?.completion || 68}%
            </span>
            <span className="text-xs font-bold text-amber-400">At Risk</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4d8bf8] rounded-full"
              style={{ width: `${metrics?.completion || 68}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stories Done */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Stories Done</span>
          <CheckCircle2 size={18} className="text-[var(--text-muted)] opacity-60" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-black text-[var(--text-primary)]">
            {metrics?.stories_done || 18}
            <span className="text-xl font-bold text-[var(--text-muted)]">
              /{metrics?.total_stories || 24}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">6 remaining in backlog</p>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Time Remaining</span>
          <Calendar size={18} className="text-[var(--text-muted)] opacity-60" />
        </div>
        <div className="mt-3">
          <div className="text-3xl font-black text-[var(--text-primary)]">
            {metrics?.time_remaining || "4d"}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Ends Friday, Oct 27</p>
        </div>
      </div>
    </div>
  );
}