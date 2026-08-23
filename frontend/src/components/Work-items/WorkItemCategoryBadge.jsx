// src/components/Work-items/WorkItemCategoryBadge.jsx
import React from "react";

const CATEGORY_CONFIG = {
  Frontend: {
    dotColor: "#06b6d4",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-950/40",
    textClass: "text-cyan-600 dark:text-cyan-300",
    borderClass: "border-cyan-500/25 dark:border-cyan-500/30",
  },
  Backend: {
    dotColor: "#a855f7",
    bgClass: "bg-purple-500/10 dark:bg-purple-950/40",
    textClass: "text-purple-600 dark:text-purple-300",
    borderClass: "border-purple-500/25 dark:border-purple-500/30",
  },
  DevOps: {
    dotColor: "#f97316",
    bgClass: "bg-orange-500/10 dark:bg-orange-950/40",
    textClass: "text-orange-600 dark:text-orange-300",
    borderClass: "border-orange-500/25 dark:border-orange-500/30",
  },
  Testing: {
    dotColor: "#3b82f6",
    bgClass: "bg-blue-500/10 dark:bg-blue-950/40",
    textClass: "text-blue-600 dark:text-blue-300",
    borderClass: "border-blue-500/25 dark:border-blue-500/30",
  },
};

export default function WorkItemCategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || {
    dotColor: "#94a3b8",
    bgClass: "bg-slate-500/10 dark:bg-zinc-800",
    textClass: "text-slate-600 dark:text-zinc-300",
    borderClass: "border-slate-300 dark:border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: config.dotColor }}
      />
      <span>{category}</span>
    </span>
  );
}
