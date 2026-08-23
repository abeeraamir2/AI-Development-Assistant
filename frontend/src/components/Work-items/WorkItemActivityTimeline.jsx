// src/components/Work-items/WorkItemActivityTimeline.jsx
import React from "react";
import { History, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkItemActivityTimeline({ activity = [] }) {
  const displayActivity = Array.isArray(activity) ? activity : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
        <History size={15} className="text-[#4d8bf8]" />
        <span>Activity</span>
      </div>

      {displayActivity.length === 0 ? (
        <div className="py-4 text-center text-xs text-[var(--text-muted)]">
          No activity recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
          {displayActivity.map((act, idx) => (
            <div key={act.id || idx} className="relative space-y-0.5">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-[#4d8bf8] ring-4 ring-[var(--bg-surface)]" />

              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {act.text}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                <Clock size={11} />
                <span>{act.date}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
