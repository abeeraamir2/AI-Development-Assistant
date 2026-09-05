// src/pages/BugSummarizerPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Sparkles } from "lucide-react";

import BugInputPanel from "../../components/Bug-summarizer/BugInputPanel";
import BugHeaderCard from "../../components/Bug-summarizer/BugHeaderCard";
import RootCauseCard from "../../components/Bug-summarizer/RootCauseCard";
import AffectedComponentsCard from "../../components/Bug-summarizer/AffectedComponentsCard";
import ReproductionStepsCard from "../../components/Bug-summarizer/ReproductionStepsCard";
import RecommendedFixCard from "../../components/Bug-summarizer/RecommendedFixCard";

export default function BugSummarizerPage() {
    const [rawLog, setRawLog] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!rawLog.trim()) {
        toast.error("Please paste a stack trace or log before analyzing.");
        return;
        }

        setLoading(true);
        try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const res = await fetch("http://localhost:8000/analyze-bug", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ raw_log: rawLog }),
        });

        if (!res.ok) throw new Error("Bug analysis failed.");

        const data = await res.json();
        setAnalysis(data);
        toast.success("Bug analysis completed!");
        } catch (err) {
        toast.error(err.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
        <Toaster position="top-right" richColors />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5">
            <BugInputPanel
                rawLog={rawLog}
                setRawLog={setRawLog}
                onAnalyze={handleAnalyze}
                loading={loading}
            />
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-7 space-y-4">
            {analysis ? (
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
                >
                <BugHeaderCard
                    severity={analysis.severity}
                    fileLocation={analysis.file_location}
                    title={analysis.title}
                    tags={analysis.tags}
                    confidenceScore={analysis.confidence_score}
                />

                <RootCauseCard rootCause={analysis.root_cause} />

                <AffectedComponentsCard components={analysis.affected_components} />

                <ReproductionStepsCard steps={analysis.reproduction_steps} />

                <RecommendedFixCard fix={analysis.recommended_fix} />
                </motion.div>
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)] p-8 text-center">
                <Sparkles size={32} className="text-[var(--text-muted)] mb-3" />
                <p className="text-xs font-bold text-[var(--text-primary)]">
                    No Bug Analyzed Yet
                </p>
                <p className="text-[11px] text-[var(--text-muted)] max-w-xs mt-1">
                    Paste a stack trace or server log in the left panel and click "Analyze Bug" to render real-time diagnostics.
                </p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}