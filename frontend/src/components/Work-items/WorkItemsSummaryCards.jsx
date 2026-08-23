// src/components/Work-items/WorkItemsSummaryCards.jsx
import React from "react";
import { Layers, Circle, MinusCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkItemsSummaryCards({ metrics }) {
  const cards = [
    {
      title: "Total Work Items",
      count: metrics?.total ?? 42,
      icon: Layers,
      iconColor: "text-slate-400 dark:text-zinc-400",
      accentBarColor: "bg-transparent",
    },
    {
      title: "Not Started",
      count: metrics?.notStarted ?? 12,
      icon: Circle,
      iconColor: "text-slate-400 dark:text-zinc-500",
      accentBarColor: "bg-slate-400 dark:bg-zinc-600",
    },
    {
      title: "In Progress",
      count: metrics?.inProgress ?? 18,
      icon: MinusCircle,
      iconColor: "text-[#818cf8] dark:text-[#a5b4fc]",
      accentBarColor: "bg-[#818cf8] dark:bg-[#6366f1]",
    },
    {
      title: "Completed",
      count: metrics?.completed ?? 12,
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      accentBarColor: "bg-emerald-500 dark:bg-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs flex flex-col justify-between min-h-[115px]"
          >
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
              <Icon size={15} strokeWidth={2.2} className={card.iconColor} />
              <span>{card.title}</span>
            </div>

            {/* Metric Value */}
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">
                {card.count}
              </span>
            </div>

            {/* Bottom accent indicator line if active */}
            {card.accentBarColor !== "bg-transparent" && (
              <div className="mt-4 h-1 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div className={`h-full w-1/2 rounded-full ${card.accentBarColor}`} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
