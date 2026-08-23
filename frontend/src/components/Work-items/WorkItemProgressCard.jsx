// src/components/Work-items/WorkItemProgressCard.jsx
import React from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkItemProgressCard({
  progress = 0,
  status = "Not Started",
  startDate,
  endDate,
}) {
  const safeProgress = Math.min(100, Math.max(0, progress || 0));
  const isNotStarted = status === "Not Started" && !startDate && !endDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      {/* Progress Bar Column */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--text-secondary)]">Progress</span>
          <span className="text-[var(--text-primary)] font-mono text-sm">
            {safeProgress}%
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safeProgress}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full ${
              safeProgress === 100
                ? "bg-emerald-500"
                : safeProgress > 0
                ? "bg-[#4d8bf8]"
                : "bg-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Schedule Dates Column */}
      <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--border-color)] md:pl-6">
        {isNotStarted ? (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] italic">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>Not started yet — dates are recorded when work begins</span>
          </div>
        ) : (
          <>
            {/* Start Date */}
            <div className="space-y-1">
              <span className="block text-[11px] font-semibold text-[var(--text-muted)]">
                Start Date
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <Calendar size={13} className="text-[#818cf8]" />
                <span>{startDate || "—"}</span>
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <span className="block text-[11px] font-semibold text-[var(--text-muted)]">
                End Date
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <Calendar size={13} className="text-amber-500" />
                <span>{endDate || "—"}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
