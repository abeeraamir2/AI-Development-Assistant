// src/components/Team-progress/WorkByCategoryCard.jsx
import React from "react";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkByCategoryCard({ categoryData = [], totalItems = 0 }) {
  // Ordered standard categories matching the Stitch UI design
  const CATEGORY_ORDER = ["BACKEND", "FRONTEND", "TESTING", "DEVOPS"];

  const countsMap = {};
  categoryData.forEach((c) => {
    const key = (c.name || c.category || "").toUpperCase();
    countsMap[key] = c.count ?? Math.round(((c.percentage || 0) / 100) * totalItems);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]/60 mb-3">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Work by Category
        </h2>
        <div className="text-[var(--text-muted)]">
          <BarChart3 size={16} />
        </div>
      </div>

      {/* Category Rows */}
      <div className="space-y-4 my-auto">
        {CATEGORY_ORDER.map((catKey) => {
          const count = countsMap[catKey] || 0;
          const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;

          return (
            <div key={catKey} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold tracking-wider text-[11px] text-[var(--text-secondary)]">
                  {catKey}
                </span>
                <span className="font-bold text-[var(--text-primary)]">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-[#818cf8] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
