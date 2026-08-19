// src/components/requirement-analyzer/AnalyzingRequirementScreen.jsx
import React, { useState, useEffect } from "react";
import { Sparkles, FileText, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Extracting Requirements", threshold: 25 },
  { id: 2, label: "Finding Related Requirements", threshold: 50 },
  { id: 3, label: "Generating Tasks & API Contracts", threshold: 75 },
  { id: 4, label: "Finalizing Technical Schema", threshold: 95 },
];

export default function AnalyzingRequirementScreen({
  filename = "Password_Reset_Requirement.pdf",
}) {
  const [progress, setProgress] = useState(15);

  // Smooth realistic progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;
        const increment = Math.floor(Math.random() * 6) + 3;
        return Math.min(prev + increment, 94);
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const getCurrentStepLabel = () => {
    if (progress < 30) return "Extracting Requirements";
    if (progress < 60) return "Finding Related Requirements";
    if (progress < 85) return "Generating Tasks";
    return "Finalizing Output";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      {/* Top Breadcrumb & Titles */}
      <div className="text-center space-y-1.5 mb-8">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          <span>WORKSPACE</span>
          <span>›</span>
          <span className="text-[var(--accent)]">ANALYZER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Analyzing Requirement
        </h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
          DevAssist is analyzing your requirement and generating development insights.
        </p>
      </div>

      {/* Main Gradient Border Card */}
      <div className="relative w-full max-w-xl p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/40 via-purple-500/30 to-emerald-500/40 shadow-2xl">
        <div className="w-full h-full bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* AI Glowing Orb Icon */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--accent)] shadow-inner">
              <Sparkles size={24} className="animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 blur-md -z-10" />
            </div>
          </div>

          {/* Sub Header */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Analyzing Requirement
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              AI is processing your requirement and preparing actionable development insights.
            </p>
          </div>

          {/* Uploaded File Chip */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono">
              <FileText size={14} className="text-[var(--accent)]" />
              <span className="truncate max-w-[280px]">{filename}</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Progress</span>
              <span className="text-2xl font-black text-[var(--text-primary)]">{progress}%</span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-0.5">
              <span>Current step: <strong className="text-[var(--text-primary)]">{getCurrentStepLabel()}</strong></span>
              <span>Estimated remaining: <strong className="text-[var(--text-primary)]">Almost there...</strong></span>
            </div>
          </div>

          {/* Steps Timeline Checklist */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
            {STEPS.map((step, idx) => {
              const isCompleted = progress >= step.threshold;
              const isCurrent = !isCompleted && (idx === 0 || progress >= STEPS[idx - 1].threshold);

              return (
                <div key={step.id} className="flex items-center gap-3 text-xs">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-[var(--accent)] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[var(--border-color)] shrink-0" />
                  )}
                  <span
                    className={`font-semibold ${
                      isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}