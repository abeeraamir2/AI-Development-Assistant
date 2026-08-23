// src/components/Work-items/WorkItemStatusBadge.jsx
import React from "react";
import { CheckCircle2, Circle, MinusCircle, Clock } from "lucide-react";

export default function WorkItemStatusBadge({ status }) {
  switch (status) {
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/25 dark:bg-[#3b82f6]/15 dark:text-[#93c5fd] dark:border-[#3b82f6]/30">
          <MinusCircle size={13} strokeWidth={2.2} className="shrink-0 text-[#60a5fa]" />
          <span>In Progress</span>
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
          <CheckCircle2 size={13} strokeWidth={2.2} className="shrink-0 text-emerald-500 dark:text-emerald-400" />
          <span>Completed</span>
        </span>
      );
    case "Not Started":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-400/25 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700">
          <Circle size={12} strokeWidth={2.2} className="shrink-0 text-slate-500 dark:text-zinc-400" />
          <span>Not Started</span>
        </span>
      );
    case "In Review":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
          <Clock size={13} strokeWidth={2.2} className="shrink-0 text-amber-500" />
          <span>In Review</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
          <span>{status}</span>
        </span>
      );
  }
}
