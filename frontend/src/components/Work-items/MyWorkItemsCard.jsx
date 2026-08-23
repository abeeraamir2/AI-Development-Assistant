import React from "react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WorkItemStatusBadge from "./WorkItemStatusBadge";
import WorkItemCategoryBadge from "./WorkItemCategoryBadge";

export default function MyWorkItemsCard({ items = [], onViewAll, onNewWorkItem }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          My Work Items
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#818cf8] dark:text-[#a5b4fc] hover:underline cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-[var(--border-color)] pt-1">
        {items.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] space-y-2">
            <p className="font-semibold text-[var(--text-secondary)]">No work items assigned to you yet.</p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
              When work items are assigned to your account, they will appear here.
            </p>
            {onNewWorkItem && (
              <button
                type="button"
                onClick={onNewWorkItem}
                className="mt-1 px-3 py-1.5 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8] text-xs font-bold hover:bg-[#4d8bf8]/20 transition-colors cursor-pointer"
              >
                + Create Work Item
              </button>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const targetId = item.id?.replace(/^#/, "") || item.id;
                navigate(`/work-items/${targetId}`);
              }}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[var(--bg-subtle)]/40 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
            >
              {/* Left Column: Dot + Title + Subtitle Badge */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#818cf8] shrink-0" />
                  <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#4d8bf8] transition-colors">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 pl-4 text-[11px]">
                  <span className="font-mono text-[var(--text-muted)]">{item.id}</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <WorkItemCategoryBadge category={item.category} />
                </div>
              </div>

              {/* Right Column: Status Badge + Due Date */}
              <div className="flex items-center gap-3 pl-4 sm:pl-0 shrink-0">
                <WorkItemStatusBadge status={item.status} />

                {item.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">
                    <Calendar size={13} className="shrink-0 text-amber-500" />
                    <span>{item.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
