// src/components/Work-items/ChildWorkItemsCard.jsx
import React from "react";
import {
  GitBranch,
  Plus,
  CheckCircle2,
  MinusCircle,
  Circle,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WorkItemCategoryBadge from "./WorkItemCategoryBadge";

export default function ChildWorkItemsCard({
  parentItem,
  childItems = [],
  onAddChild,
}) {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />;
      case "In Progress":
        return <MinusCircle size={15} className="text-amber-500 shrink-0" />;
      default:
        return <Circle size={14} className="text-slate-400 dark:text-zinc-500 shrink-0" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
      case "In Progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/25";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-zinc-400 border-slate-400/25 dark:border-zinc-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
          <GitBranch size={16} className="text-[#4d8bf8]" />
          <span>Child Work Items</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-[var(--text-secondary)] font-bold">
            {childItems.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddChild}
          className="flex items-center gap-1 text-xs font-bold text-[#4d8bf8] hover:text-[#3b76e8] dark:text-[#818cf8] transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      {/* Child Work Items List */}
      {childItems.length === 0 ? (
        <div className="py-8 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-6 space-y-3">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            No child work items yet. Break this work into smaller tasks by adding child work items.
          </p>
          <button
            type="button"
            onClick={onAddChild}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8] text-xs font-bold hover:bg-[#4d8bf8]/20 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Child Work Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {childItems.map((child) => (
            <div
              key={child.id}
              onClick={() => {
                const targetId = child.id?.replace(/^#/, "") || child.id;
                navigate(`/work-items/${targetId}`);
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[#4d8bf8]/50 hover:bg-[var(--bg-subtle)]/60 transition-all cursor-pointer group shadow-xs"
            >
              {/* Left Column: Icon + ID + Title + Subtitle */}
              <div className="flex items-center gap-3">
                {getStatusIcon(child.status)}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#4d8bf8] transition-colors">
                      {child.id} {child.title}
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 text-[#4d8bf8] transition-opacity"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <WorkItemCategoryBadge category={child.category} />
                    <span>•</span>
                    <span className="font-medium">{child.assignedTo?.name || "Unassigned"}</span>
                    {child.endDate && (
                      <>
                        <span>•</span>
                        <span>{child.endDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Status Tag */}
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadgeClass(
                  child.status
                )}`}
              >
                {child.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
