// src/components/Work-items/CategoryOverviewCard.jsx
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryOverviewCard({ categories = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Work Items by Category
        </h3>
        <button
          type="button"
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          title="Options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Categories Progress Bars */}
      <div className="space-y-4 pt-4">
        {categories.length === 0 || categories.every((cat) => Number(cat.percentage) === 0) ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] space-y-1">
            <p className="font-semibold text-[var(--text-secondary)]">No work items categorized yet</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Create work items to view live category distribution.
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              {/* Category Row: Dot + Name + Percentage */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[var(--text-primary)]">{cat.name}</span>
                </div>
                <span className="font-mono text-[var(--text-muted)] text-[11px]">
                  {cat.percentage}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-800/80 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
