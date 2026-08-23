// src/components/Work-items/LinkedWorkItemsCard.jsx
import React from "react";
import { Link2, Plus, ArrowUpRight, CheckCircle2, MinusCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LinkedWorkItemsCard({ linkedItems = [], onLinkItem }) {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />;
      case "In Progress":
        return <MinusCircle size={13} className="text-amber-500 shrink-0" />;
      default:
        return <Circle size={12} className="text-slate-400 dark:text-zinc-500 shrink-0" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
          <Link2 size={16} className="text-[#4d8bf8]" />
          <span>Linked Items</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-[var(--text-secondary)] font-bold">
            {linkedItems.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onLinkItem}
          className="flex items-center gap-1 text-xs font-bold text-[#4d8bf8] hover:text-[#3b76e8] dark:text-[#818cf8] transition-colors cursor-pointer"
        >
          <Link2 size={13} />
          <span>Link</span>
        </button>
      </div>

      {/* Linked Work Items Grid */}
      {linkedItems.length === 0 ? (
        <div className="py-8 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-6 space-y-3">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            No linked work items. Link related work items to show bidirectional connection (A ↔ B).
          </p>
          <button
            type="button"
            onClick={onLinkItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8] text-xs font-bold hover:bg-[#4d8bf8]/20 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Link Work Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {linkedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const targetId = item.id?.replace(/^#/, "") || item.id;
                navigate(`/work-items/${targetId}`);
              }}
              className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[#4d8bf8]/50 hover:bg-[var(--bg-subtle)]/60 transition-all cursor-pointer group shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#4d8bf8] group-hover:underline">
                  {item.id}
                </span>
                {getStatusIcon(item.status)}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#4d8bf8] transition-colors line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  {item.category || "General"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
