import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import RequirementInput from "../../components/Shared/RequirementInput";
import GenerationStrategy from "../../components/test-generator/GenerationStrategy";
import GeneratedWorkspace from "../../components/test-generator/GeneratedWorkspace";

export default function TestGeneratorPage() {
    // Input State
    const [inputText, setInputText] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);

    // Unified Strategy State
    const [strategy, setStrategy] = useState({
        coverage: "Standard",
        selectedTypes: ["Functional", "Negative", "Boundary", "API"],
        priority: "All",
        includeEdgeCases: true,
        includeNegative: true,
        testCaseCount: "Auto",
    });

    // Workspace & Generation State
    const [activeTab, setActiveTab] = useState("Functional");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const testTypeOptions = [
        "Functional",
        "Negative",
        "Boundary",
        "API",
        "Security",
        "Performance",
        "Regression",
    ];

    const handleGenerate = () => {
        if (!inputText.trim() && !uploadedFile) {
        toast.error("Please enter a requirement or upload a document first.");
        return;
        }

        setIsGenerating(true);
        toast.info("Synthesizing requirements with AI...");

        setTimeout(() => {
        setIsGenerating(false);
        setGenerated(true);
        setActiveTab(strategy.selectedTypes[0] || "Functional");
        toast.success("Test cases generated successfully!");
        }, 1800);
    };

    const handleExport = (format) => {
        if (!generated) {
        toast.error("Please generate test cases before exporting.");
        return;
        }
        toast.success(`Exporting suite as ${format}...`);
    };

    return (
        <div className="w-full p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Toaster position="top-right" richColors />

        {/* Title Header */}
        <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
        >
            <h1 className="text-2xl font-bold mb-1 text-[var(--text-primary)] tracking-tight">
            Test Generator
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
            Use AI to instantly generate comprehensive test suites based on product
            requirements, user stories, or API documentation.
            </p>
        </motion.div>

        {/* Top Input & Strategy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <RequirementInput
            inputText={inputText}
            setInputText={setInputText}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            />
            <GenerationStrategy
            strategy={strategy}
            setStrategy={setStrategy}
            testTypeOptions={testTypeOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            />
        </div>

        {/* Bottom Output Section */}
        <GeneratedWorkspace
            tabs={strategy.selectedTypes}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isGenerating={isGenerating}
            generated={generated}
            onExport={handleExport}
        />
        </div>
    );
}