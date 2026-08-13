// src/components/bug-summarizer/BugHeaderCard.jsx
import React from "react";
import { AlertOctagon } from "lucide-react";

export default function BugHeaderCard({ severity, fileLocation, title, tags = [], confidenceScore }) {
    return (
        <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-start gap-4 shadow-xs">
        <div className="space-y-2">
            <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold">
                <AlertOctagon size={12} /> {severity || "High / P1"}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
                {fileLocation || "Unknown File"}
            </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
            <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <span
                key={tag}
                className="px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-semibold text-[var(--text-secondary)]"
                >
                {tag}
                </span>
            ))}
            </div>
        </div>

        <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            AI Confidence
            </span>
            <p className="text-2xl font-extrabold text-[var(--accent)]">{confidenceScore}%</p>
        </div>
        </div>
    );
}