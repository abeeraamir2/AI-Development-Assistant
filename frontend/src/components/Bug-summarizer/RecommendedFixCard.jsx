// src/components/bug-summarizer/RecommendedFixCard.jsx
import React, { useState } from "react";
import { Wrench, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function RecommendedFixCard({ fix }) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (fix?.code_diff) {
        navigator.clipboard.writeText(fix.code_diff);
        setCopied(true);
        toast.success("Fix copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <Wrench size={14} /> Recommended Fix
            </div>
            <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy Fix"}</span>
            </button>
        </div>

        {fix?.code_diff && (
            <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {fix.code_diff}
            </pre>
        )}

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {fix?.explanation}
        </p>
        </div>
    );
}