// src/components/test-generator/GeneratedWorkspace.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  Search,
  SlidersHorizontal,
  FileCode,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const PRIORITY_STYLES = {
  Critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  High: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function GeneratedWorkspace({
  testSuiteData,
  projectName = "Project Codebase",
  filesAnalyzed = 0,
  tabs = [],
  activeTab,
  setActiveTab,
  isGenerating,
  generated,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Extract all available tabs from testSuiteData
  const displayTabs = useMemo(() => {
    if (!testSuiteData || typeof testSuiteData !== "object") return tabs;
    const keys = Object.keys(testSuiteData).filter(
      (k) => Array.isArray(testSuiteData[k]) && testSuiteData[k].length > 0
    );
    return keys.length > 0 ? keys : tabs;
  }, [testSuiteData, tabs]);

  // Extract test cases for the active tab (with case-insensitive matching fallback)
  const rawTestCases = useMemo(() => {
    if (!testSuiteData || typeof testSuiteData !== "object") return [];
    if (Array.isArray(testSuiteData[activeTab]) && testSuiteData[activeTab].length > 0) {
      return testSuiteData[activeTab];
    }
    
    // Case-insensitive lookup
    const matchedKey = Object.keys(testSuiteData).find(
      (k) => k.toLowerCase() === (activeTab || "").toLowerCase()
    );
    if (matchedKey && Array.isArray(testSuiteData[matchedKey]) && testSuiteData[matchedKey].length > 0) {
      return testSuiteData[matchedKey];
    }

    // Fallback to first available category with items
    const firstNonEmptyKey = Object.keys(testSuiteData).find(
      (k) => Array.isArray(testSuiteData[k]) && testSuiteData[k].length > 0
    );
    return firstNonEmptyKey ? testSuiteData[firstNonEmptyKey] : [];
  }, [testSuiteData, activeTab]);

  // Filter test cases
  const filteredCases = useMemo(() => {
    return rawTestCases.filter((tc) => {
      const matchesSearch =
        !searchQuery ||
        tc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.targetModule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(tc.steps) && tc.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesPriority =
        priorityFilter === "All" || tc.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [rawTestCases, searchQuery, priorityFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    let total = 0;
    let criticalCount = 0;
    let highCount = 0;

    if (testSuiteData && typeof testSuiteData === "object") {
      Object.values(testSuiteData).forEach((arr) => {
        if (Array.isArray(arr)) {
          total += arr.length;
          arr.forEach((tc) => {
            if (tc.priority === "Critical") criticalCount++;
            if (tc.priority === "High") highCount++;
          });
        }
      });
    }

    return { total, criticalCount, highCount };
  }, [testSuiteData]);

  // Step check toggler
  const toggleStep = (tcId, stepIdx) => {
    const key = `${tcId}-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy automated code snippet
  const handleCopySnippet = (tcId, snippet) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(tcId);
    toast.success("Test script copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!testSuiteData || Object.keys(testSuiteData).length === 0) {
      toast.error("No test suite available to export.");
      return;
    }

    const rows = [
      ["Type", "ID", "Title", "Target Module", "Priority", "Preconditions", "Steps", "Test Data", "Expected Result"],
    ];

    Object.entries(testSuiteData).forEach(([type, cases]) => {
      if (Array.isArray(cases)) {
        cases.forEach((tc, idx) => {
          const stepsStr = Array.isArray(tc.steps) ? tc.steps.join(" | ") : (tc.steps || "");
          rows.push([
            type,
            tc.id || `TC-${idx + 1}`,
            `"${(tc.title || "").replace(/"/g, '""')}"`,
            `"${(tc.targetModule || "").replace(/"/g, '""')}"`,
            tc.priority || "Medium",
            `"${(tc.preconditions || "").replace(/"/g, '""')}"`,
            `"${stepsStr.replace(/"/g, '""')}"`,
            `"${(tc.testData || "").replace(/"/g, '""')}"`,
            `"${(tc.expectedResult || "").replace(/"/g, '""')}"`,
          ]);
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${projectName.replace(/\s+/g, "_")}_Test_Suite.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Test suite exported to CSV spreadsheet!");
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (!testSuiteData || Object.keys(testSuiteData).length === 0) {
      toast.error("No test suite available to export.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(testSuiteData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${projectName.replace(/\s+/g, "_")}_Test_Suite.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Test suite exported to JSON file!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-xs space-y-6"
    >
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">
              Generated Test Suite
            </h2>
            {generated && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {stats.total} Test Cases
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {generated
              ? `Production test suite synthesized from ${projectName} (${filesAnalyzed} code files analyzed).`
              : "Upload your project codebase above to generate intelligent test cases."}
          </p>
        </div>

        {/* Export Buttons */}
        {generated && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-emerald-400" /> Export CSV / Excel
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer"
            >
              <Download size={14} className="text-[var(--accent)]" /> Export JSON
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards when generated */}
      {generated && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Test Cases
            </p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{stats.total}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              Critical Severity
            </p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{stats.criticalCount}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              High Priority
            </p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.highCount}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Analyzed Code Files
            </p>
            <p className="text-2xl font-extrabold text-[var(--accent)] mt-1">{filesAnalyzed}</p>
          </div>
        </div>
      )}

      {/* Tabs Header & Filter Bar */}
      {generated && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-2">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayTabs.map((tab) => {
                const count = Array.isArray(testSuiteData?.[tab])
                  ? testSuiteData[tab].length
                  : 0;
                const isActive =
                  activeTab === tab ||
                  (activeTab?.toLowerCase() === tab.toLowerCase());

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-xs"
                        : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Priority & Search Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter test cases..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-hidden focus:border-[var(--accent)]"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty / Loading State */}
      {!generated && (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-primary)]/40">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
              <Layers size={24} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isGenerating ? "Analyzing Codebase & Synthesizing Tests..." : "Ready to Generate Tests"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isGenerating
                ? "Our AI is parsing your project files, mapping endpoints, examining error handling routines, and building test specifications."
                : "Upload your project folder or ZIP archive, configure your generation strategy, and click 'Generate Test Cases'."}
            </p>
          </div>
        </div>
      )}

      {/* Generated Test Cases List */}
      {generated && (
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)]">
              <p className="text-xs text-[var(--text-muted)]">No test cases match your filter criteria.</p>
            </div>
          ) : (
            filteredCases.map((tc, idx) => {
              const tcId = tc.id || `TC-${String(idx + 1).padStart(3, "0")}`;
              const priorityClass = PRIORITY_STYLES[tc.priority] || PRIORITY_STYLES.Medium;

              return (
                <div
                  key={tcId}
                  className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] space-y-4 hover:border-[var(--accent)]/50 transition-colors shadow-xs"
                >
                  {/* Test Case Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-color)]">
                        {tcId}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{tc.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {tc.targetModule && (
                        <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 bg-[var(--bg-surface)] px-2 py-0.5 rounded-md border border-[var(--border-color)] truncate max-w-[200px]">
                          <FileCode size={11} className="text-[var(--accent)] shrink-0" />
                          <span className="truncate">{tc.targetModule}</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityClass}`}>
                        {tc.priority || "Medium"}
                      </span>
                    </div>
                  </div>

                  {/* Preconditions (if provided) */}
                  {tc.preconditions && (
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)]">Preconditions: </span>
                      {tc.preconditions}
                    </div>
                  )}

                  {/* Execution Steps */}
                  {Array.isArray(tc.steps) && tc.steps.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Execution Steps:
                      </p>
                      <div className="space-y-1">
                        {tc.steps.map((step, sIdx) => {
                          const isDone = completedSteps[`${tcId}-${sIdx}`];
                          return (
                            <label
                              key={sIdx}
                              className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors cursor-pointer text-xs ${
                                isDone
                                  ? "bg-emerald-500/5 line-through text-[var(--text-muted)]"
                                  : "hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(isDone)}
                                onChange={() => toggleStep(tcId, sIdx)}
                                className="mt-0.5 rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                              />
                              <span>{step}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Test Data & Expected Result Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Expected Result */}
                    {tc.expectedResult && (
                      <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Expected Result
                        </p>
                        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                          {tc.expectedResult}
                        </p>
                      </div>
                    )}

                    {/* Test Data Payload */}
                    {tc.testData && (
                      <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Test Data / Payload
                        </p>
                        <p className="text-xs font-mono text-[var(--accent)] break-all">
                          {tc.testData}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Automated Test Snippet Sample (if provided) */}
                  {tc.automatedSnippet && (
                    <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                          <Code2 size={12} className="text-[var(--accent)]" /> Automated Test Sample
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySnippet(tcId, tc.automatedSnippet)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                        >
                          {copiedCodeId === tcId ? (
                            <>
                              <Check size={11} className="text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Copy Code
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto">
                        {tc.automatedSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </motion.div>
  );
}