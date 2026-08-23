// src/components/Work-items/WorkItemOverviewCard.jsx
import React from "react";
import { AlignLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkItemOverviewCard({ description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
        <AlignLeft size={15} className="text-[#4d8bf8]" />
        <span>Overview</span>
      </div>

      <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
        {description || "No description provided for this work item."}
      </div>
    </motion.div>
  );
}
