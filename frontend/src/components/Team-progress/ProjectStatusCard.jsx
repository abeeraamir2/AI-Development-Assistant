// src/components/Team-progress/ProjectStatusCard.jsx
import React from "react";
import { CircleDot } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectStatusCard({
  total = 0,
  completed = 0,
  inProgress = 0,
  notStarted = 0,
}) {
  const overallPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // SVG Donut calculation
  const size = 170;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage strokes
  const completedPct = total > 0 ? completed / total : 0;
  const inProgressPct = total > 0 ? inProgress / total : 0;
  const notStartedPct = total > 0 ? notStarted / total : 0;

  const completedStroke = completedPct * circumference;
  const inProgressStroke = inProgressPct * circumference;
  const notStartedStroke = notStartedPct * circumference;

  // Offsets for sequential rendering
  const completedOffset = 0;
  const inProgressOffset = -completedStroke;
  const notStartedOffset = -(completedStroke + inProgressStroke);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60 mb-2">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Project Status
        </h2>
        <div className="text-[var(--text-muted)]">
          <CircleDot size={16} />
        </div>
      </div>

      {/* Center Donut / Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-slate-100 dark:text-zinc-800/80"
              strokeWidth={strokeWidth}
            />

            {/* Completed Segment (Emerald Green) */}
            {completed > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${completedStroke} ${circumference}`}
                strokeDashoffset={completedOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* In Progress Segment (Blue/Cyan) */}
            {inProgress > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${inProgressStroke} ${circumference}`}
                strokeDashoffset={inProgressOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Not Started Segment (Dark Gray) */}
            {notStarted > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#52525b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${notStartedStroke} ${circumference}`}
                strokeDashoffset={notStartedOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>

          {/* Centered Percentage Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-mono">
              {overallPercentage}%
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5">
              Overall Progress
            </span>
          </div>
        </div>
      </div>

      {/* Legend Breakdown */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-color)]/40 text-xs">
        {/* Completed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
            <span className="text-[var(--text-secondary)] font-medium">Completed</span>
          </div>
          <span className="font-mono font-bold text-[var(--text-primary)]">{completed}</span>
        </div>

        {/* In Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />
            <span className="text-[var(--text-secondary)] font-medium">In Progress</span>
          </div>
          <span className="font-mono font-bold text-[var(--text-primary)]">{inProgress}</span>
        </div>

        {/* Not Started */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500 dark:bg-zinc-600 shrink-0" />
            <span className="text-[var(--text-secondary)] font-medium">Not Started</span>
          </div>
          <span className="font-mono font-bold text-[var(--text-primary)]">{notStarted}</span>
        </div>
      </div>
    </motion.div>
  );
}
