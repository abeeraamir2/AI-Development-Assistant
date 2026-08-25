// src/components/Team-progress/CompletionTimeCard.jsx
import React from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CompletionTimeCard({ completedItems = [] }) {
  // Helper to parse dates and compute duration in days
  const validItemsWithDuration = completedItems
    .map((item) => {
      if (!item.startDate || !item.endDate) return null;
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      return {
        id: item.id || item._id,
        title: item.title || "Task",
        days: diffDays,
      };
    })
    .filter(Boolean);

  let avgDays = "—";
  let fastestDays = "—";
  let longestDays = "—";

  if (validItemsWithDuration.length > 0) {
    const totalDays = validItemsWithDuration.reduce((acc, curr) => acc + curr.days, 0);
    avgDays = `${(totalDays / validItemsWithDuration.length).toFixed(1)}d`;
    fastestDays = `${Math.min(...validItemsWithDuration.map((i) => i.days)).toFixed(1)}d`;
    longestDays = `${Math.max(...validItemsWithDuration.map((i) => i.days)).toFixed(1)}d`;
  }

  // Display top 4 recent completed tasks with durations
  const displayItems = validItemsWithDuration.slice(0, 4);
  const maxDays = Math.max(10, ...displayItems.map((i) => i.days));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60 mb-2">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Completion Time
        </h2>
        <div className="text-[var(--text-muted)]">
          <Clock size={16} />
        </div>
      </div>

      {/* Top 3 Metric Summary Boxes */}
      <div className="grid grid-cols-3 gap-2.5 my-2">
        {/* Average */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-center">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Average
          </span>
          <span className="block text-lg font-black text-[var(--text-primary)] font-mono mt-0.5">
            {avgDays}
          </span>
        </div>

        {/* Fastest */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-center">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Fastest
          </span>
          <span className="block text-lg font-black text-emerald-500 font-mono mt-0.5">
            {fastestDays}
          </span>
        </div>

        {/* Longest */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-center">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Longest
          </span>
          <span className="block text-lg font-black text-[var(--text-primary)] font-mono mt-0.5">
            {longestDays}
          </span>
        </div>
      </div>

      {/* Task Duration Breakdown List */}
      <div className="space-y-2.5 pt-2 border-t border-[var(--border-color)]/30 text-xs">
        {displayItems.length === 0 ? (
          <div className="py-4 text-center text-xs text-[var(--text-muted)]">
            No completed tasks with recorded start/end dates yet.
          </div>
        ) : (
          displayItems.map((task) => {
            const barWidth = Math.min(100, Math.round((task.days / maxDays) * 100));
            return (
              <div key={task.id} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] w-24 truncate">
                  {task.title}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-zinc-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 dark:bg-zinc-600 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] w-7 text-right">
                  {task.days}d
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
