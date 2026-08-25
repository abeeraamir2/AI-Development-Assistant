// src/components/Team-progress/TeamWorkloadCard.jsx
import React from "react";
import { MoreHorizontal, Users, User } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamWorkloadCard({ workload = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]/60 mb-3">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Team Workload & Completion
        </h2>
        <button
          type="button"
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          title="Workload options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Table Content */}
      {workload.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
          <Users size={24} className="opacity-40" />
          <span>No team workload data available for the selected project.</span>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2 custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]/40 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-2.5 pr-4 font-extrabold">Team Member</th>
                <th className="py-2.5 px-3 font-extrabold">Role</th>
                <th className="py-2.5 px-3 text-center font-extrabold">Assigned</th>
                <th className="py-2.5 px-2.5 text-center font-extrabold">NS</th>
                <th className="py-2.5 px-2.5 text-center font-extrabold text-blue-500 dark:text-blue-400">IP</th>
                <th className="py-2.5 px-2.5 text-center font-extrabold text-emerald-500 dark:text-emerald-400">Done</th>
                <th className="py-2.5 pl-4 font-extrabold w-44">Progress (CR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/30">
              {workload.map((member, idx) => {
                const completionRate =
                  member.assigned > 0
                    ? Math.round((member.done / member.assigned) * 100)
                    : 0;

                const roleBadgeClass =
                  (member.role || "").toLowerCase().includes("qa") ||
                  (member.role || "").toLowerCase().includes("test")
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : (member.role || "").toLowerCase().includes("admin")
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-[#a5b4fc] border-blue-500/20";

                return (
                  <tr
                    key={member.userId || member.email || idx}
                    className="hover:bg-[var(--bg-subtle)]/60 transition-colors group"
                  >
                    {/* Team Member */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-900 to-slate-800 text-indigo-200 border border-indigo-500/30 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                          {member.initial || (member.name ? member.name[0].toUpperCase() : "U")}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-[var(--text-primary)] text-xs truncate">
                            {member.name || member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass}`}
                      >
                        {member.role || "Developer"}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-[var(--text-primary)]">
                      {member.assigned}
                    </td>

                    {/* NS (Not Started) */}
                    <td className="py-3 px-2.5 text-center font-mono font-medium text-[var(--text-muted)]">
                      {member.notStarted}
                    </td>

                    {/* IP (In Progress) */}
                    <td className="py-3 px-2.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      {member.inProgress}
                    </td>

                    {/* Done (Completed) */}
                    <td className="py-3 px-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {member.done}
                    </td>

                    {/* Progress (CR) */}
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 dark:bg-[#818cf8] transition-all duration-500"
                            style={{ width: `${Math.min(100, completionRate)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] w-9 text-right shrink-0">
                          {completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
