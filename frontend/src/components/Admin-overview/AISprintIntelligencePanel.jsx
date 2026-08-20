import React from "react";
import { Sparkles, AlertTriangle } from "lucide-react";

export default function AISprintIntelligencePanel({ onApplyRecommendation }) {
    return (
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
            <Sparkles size={18} className="text-[#4d8bf8]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            AI Sprint Intelligence
            </h2>
        </div>

        {/* Section 1: Risk Detection */}
        <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Risk Detection
            </span>
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle size={14} />
                <span>Backend API Delays</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                David M. is blocked on 3 tickets pending DB migrations. High risk of spillover.
            </p>
            </div>
        </div>

        {/* Section 2: Prediction */}
        <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Prediction
            </span>
            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl border border-[#4d8bf8]/30 bg-[#4d8bf8]/10 flex items-center justify-center font-black text-sm text-[#4d8bf8] shrink-0">
                82%
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-snug">
                Expected sprint completion based on current velocity trends.
            </p>
            </div>
        </div>

        {/* Section 3: Recommendation */}
        <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Recommendation
            </span>
            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Re-assign DEV-442 to Sarah J. to balance load and unblock the frontend release pipeline.
            </p>
            <button
                type="button"
                onClick={onApplyRecommendation}
                className="w-full py-2 rounded-xl border border-[#4d8bf8]/40 hover:bg-[#4d8bf8]/10 text-[#4d8bf8] text-xs font-bold transition-all cursor-pointer"
            >
                Apply Recommendation
            </button>
            </div>
        </div>
        </div>
    );
}