// src/components/bug-summarizer/BugInputPanel.jsx
import React from "react";
import { Sparkles, Upload, Loader2 } from "lucide-react";

export default function BugInputPanel({ rawLog, setRawLog, onAnalyze, loading }) {
    return (
        <div className="flex flex-col space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold text-base">Raw Bug Data</h2>
            </div>
            <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
            <Upload size={13} /> Upload Log
            </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
            Paste stack traces, user tickets, or system logs to generate a structured AI summary.
        </p>

        <textarea
            rows={18}
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            placeholder="Paste logs here...&#10;e.g.,&#10;NullPointerException at com.example.service.UserService.getUser(UserService.java:42)"
            className="w-full p-4 text-xs font-mono bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
        />

        <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="w-full py-3 px-4 bg-[var(--accent)] hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
            {loading ? (
            <>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing Stack Trace...</span>
            </>
            ) : (
            <>
                <Sparkles size={16} />
                <span>Analyze Bug</span>
            </>
            )}
        </button>
        </div>
    );
}