// src/components/Team-progress/TeamProgressKpiCards.jsx
import React from "react";
import { Check, RefreshCw, MoreHorizontal, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamProgressKpiCards({
  total = 0,
  completed = 0,
  inProgress = 0,
  notStarted = 0,
}) {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = [
    {
      id: "total",
      label: "TOTAL WORK ITEMS",
      value: total,
      subtitle: "Across selected project",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1e202e] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          <LayoutGrid size={15} />
        </div>
      ),
    },
    {
      id: "completed",
      label: "COMPLETED",
      value: completed,
      badge: `${completionPercentage}%`,
      subtitle: "Of total work",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shadow-emerald-500/10">
          <Check size={16} strokeWidth={2.5} />
        </div>
      ),
    },
    {
      id: "in_progress",
      label: "IN PROGRESS",
      value: inProgress,
      subtitle: "Currently active",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shadow-blue-500/10">
          <RefreshCw size={15} strokeWidth={2.2} />
        </div>
      ),
    },
    {
      id: "not_started",
      label: "NOT STARTED",
      value: notStarted,
      subtitle: "Awaiting progress",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center text-slate-400 dark:text-zinc-400">
          <MoreHorizontal size={16} strokeWidth={2.5} />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs flex flex-col justify-between min-h-[125px] relative group hover:border-[#4d8bf8]/40 transition-colors"
        >
          {/* Header Row: Label + Icon */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold tracking-wider text-[var(--text-muted)] uppercase">
              {card.label}
            </span>
            {card.icon}
          </div>

          {/* Metric Value */}
          <div className="my-2 flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] font-mono">
              {card.value}
            </span>
            {card.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {card.badge}
              </span>
            )}
          </div>

          {/* Footer Subtitle */}
          <p className="text-[11px] text-[var(--text-secondary)] font-medium">
            {card.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
