import React from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";

export default function GeneratedWorkspace({
    tabs,
    activeTab,
    setActiveTab,
    isGenerating,
    generated,
    onExport,
    }) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs"
        >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="font-bold text-base text-[var(--text-primary)]">
            Generated Workspace
            </h2>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onExport("Excel")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
                <FileSpreadsheet size={14} /> Excel
            </button>
            <button
                type="button"
                onClick={() => onExport("PDF")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
                <Download size={14} /> PDF
            </button>
            </div>
        </div>

        {/* Tabs Header */}
        <div className="flex gap-2 border-b border-[var(--border-color)] overflow-x-auto pb-1 mb-4">
            {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
                <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                    ? "border-[var(--accent)] text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
                >
                {tab}
                </button>
            );
            })}
        </div>

        {/* Results Workspace Container */}
        <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)]">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
            {isGenerating
                ? "Synthesizing requirement model and building test suite..."
                : generated
                ? `Generated ${activeTab} test suite ready for review.`
                : "Enter requirements above and click 'Generate Test Cases'."}
            </p>
        </div>
        </motion.div>
    );
}