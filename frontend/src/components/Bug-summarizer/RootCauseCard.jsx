// src/components/bug-summarizer/RootCauseCard.jsx
import React from "react";
import { Server } from "lucide-react";

export default function RootCauseCard({ rootCause }) {
    return (
        <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <Server size={14} /> Root Cause Analysis
        </div>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{rootCause}</p>
        </div>
    );
}