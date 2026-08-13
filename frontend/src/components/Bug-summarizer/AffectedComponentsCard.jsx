// src/components/bug-summarizer/AffectedComponentsCard.jsx
import React from "react";
import { Layers } from "lucide-react";

export default function AffectedComponentsCard({ components = [] }) {
    return (
        <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <Layers size={14} /> Affected Components
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {components.map((comp, idx) => (
            <div
                key={idx}
                className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center gap-2.5"
            >
                <div className="p-2 rounded bg-indigo-500/10 text-[var(--accent)]">
                <Layers size={14} />
                </div>
                <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{comp.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{comp.sub}</p>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}