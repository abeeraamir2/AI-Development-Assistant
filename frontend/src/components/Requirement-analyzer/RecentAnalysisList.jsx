// src/components/requirement-analyzer/RecentAnalysesList.jsx
import React from "react";
import { FileText } from "lucide-react";

export default function RecentAnalysisList({ recentList = [] }) {
    return (
        <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
        <h2 className="font-bold text-sm tracking-wide">Recent Analyses</h2>

        <div className="space-y-3">
            {recentList.map((item) => (
            <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)]/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                <FileText size={16} className="text-[var(--text-muted)]" />
                <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                    {item.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                    Analyzed {item.time} • {item.project}
                    </p>
                </div>
                </div>

                <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
                >
                • {item.status}
                </span>
            </div>
            ))}
        </div>
        </div>
    );
}