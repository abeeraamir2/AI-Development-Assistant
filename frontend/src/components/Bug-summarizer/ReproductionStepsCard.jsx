// src/components/bug-summarizer/ReproductionStepsCard.jsx
import React from "react";
import { ListOrdered } from "lucide-react";

export default function ReproductionStepsCard({ steps = [] }) {
    return (
        <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <ListOrdered size={14} /> Reproduction Steps
        </div>
        <ol className="space-y-2 text-xs text-[var(--text-secondary)] list-decimal pl-4">
            {steps.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
                {step}
            </li>
            ))}
        </ol>
        </div>
    );
}