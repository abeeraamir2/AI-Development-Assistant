import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PillSelector from "./PillSelector";
import MultiSelectBadges from "./MultiSelectBadges";
import ToggleSwitch from "./ToggleSwitch";

export default function GenerationStrategy({
    strategy,
    setStrategy,
    testTypeOptions,
    onGenerate,
    isGenerating,
    }) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs"
        >
        <h2 className="font-bold text-sm text-[var(--text-primary)]">
            Generation Strategy
        </h2>

        {/* Test Coverage */}
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Test Coverage
            </label>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                RECOMMENDED
            </span>
            </div>
            <PillSelector
            options={["Basic", "Standard", "Comprehensive"]}
            value={strategy.coverage}
            onChange={(val) => setStrategy((prev) => ({ ...prev, coverage: val }))}
            />
        </div>

        {/* Test Types */}
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
            Test Types
            </label>
            <MultiSelectBadges
            options={testTypeOptions}
            selected={strategy.selectedTypes}
            onChange={(val) => setStrategy((prev) => ({ ...prev, selectedTypes: val }))}
            />
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
            Priority
            </label>
            <PillSelector
            options={["All", "Critical", "High", "Medium", "Low"]}
            value={strategy.priority}
            onChange={(val) => setStrategy((prev) => ({ ...prev, priority: val }))}
            />
        </div>

        {/* Toggles */}
        <div className="space-y-1 pt-1 border-t border-[var(--border-color)]">
            <ToggleSwitch
            label="Include Edge Cases"
            enabled={strategy.includeEdgeCases}
            onChange={(val) => setStrategy((prev) => ({ ...prev, includeEdgeCases: val }))}
            />
            <ToggleSwitch
            label="Include Negative Scenarios"
            enabled={strategy.includeNegative}
            onChange={(val) => setStrategy((prev) => ({ ...prev, includeNegative: val }))}
            />
        </div>

        {/* Case Count */}
        <div className="space-y-1.5 pt-1 border-t border-[var(--border-color)]">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
            Test Case Count
            </label>
            <PillSelector
            options={["Auto", "10", "20", "50"]}
            value={strategy.testCaseCount}
            onChange={(val) => setStrategy((prev) => ({ ...prev, testCaseCount: val }))}
            />
        </div>

        {/* Generate Button */}
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
        >
            <Sparkles size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating Test Cases..." : "Generate Test Cases"}
        </motion.button>
        </motion.div>
    );
}