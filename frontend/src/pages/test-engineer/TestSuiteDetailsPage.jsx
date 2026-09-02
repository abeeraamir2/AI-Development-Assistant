// src/pages/test-engineer/TestSuiteDetailsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft,
  FlaskConical,
  Folder,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  FileCode2,
  CheckCircle2,
} from "lucide-react";
import GeneratedWorkspace from "../../components/test-generator/GeneratedWorkspace";
import { parseDate, formatRelativeTime } from "../../utils/dateUtils";

const API_BASE = "http://localhost:8000";

export default function TestSuiteDetailsPage({ authToken }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suite, setSuite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Functional");

  const getToken = useCallback(
    () => authToken || localStorage.getItem("token") || localStorage.getItem("authToken"),
    [authToken]
  );

  const fetchSuiteDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/test-suites/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to load test suite details.");
      }
      const data = await res.json();
      setSuite(data);

      // Initialize active tab with first non-empty category
      const categories = Object.keys(data.test_suite || {});
      if (categories.length > 0) {
        setActiveTab(categories[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchSuiteDetails();
  }, [fetchSuiteDetails]);

  const createdDate = suite ? parseDate(suite.created_at) : null;

  return (
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <button
              type="button"
              onClick={() => navigate("/test-history")}
              className="hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              Test History
            </button>
            <span>›</span>
            <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">
              {suite?.title || suite?.filename || "Test Suite Details"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <FlaskConical size={24} className="text-[var(--accent)]" />
            {suite?.title || suite?.filename || "Test Suite Details"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/test-history")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to History</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/test-generator")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Open Test Generator</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
          <RefreshCw size={24} className="animate-spin text-[var(--accent)] mx-auto" />
          <p className="text-xs font-semibold text-[var(--text-secondary)]">
            Loading test suite data...
          </p>
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 space-y-4 max-w-lg mx-auto">
          <AlertTriangle size={28} className="mx-auto text-rose-500" />
          <div>
            <h3 className="text-sm font-bold text-rose-500">Failed to Load Test Suite</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/test-history")}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Return to Test History
          </button>
        </div>
      ) : !suite ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
          <AlertTriangle size={24} className="text-amber-500 mx-auto" />
          <p className="text-xs font-bold text-[var(--text-primary)]">Test Suite Not Found</p>
          <button
            type="button"
            onClick={() => navigate("/test-history")}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-xs font-semibold"
          >
            Back to Test History
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metadata Summary Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Project Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]">
                <Folder size={14} className="text-[var(--accent)]" />
                <span>{suite.project_name || "General Workspace"}</span>
              </div>

              {/* Source Document */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <FileCode2 size={14} className="text-[var(--text-muted)]" />
                <span className="font-mono text-[11px]">{suite.filename || "Uploaded Codebase"}</span>
              </div>

              {/* Generated Date */}
              {createdDate && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Calendar size={13} />
                  <span>
                    {createdDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    ({formatRelativeTime(createdDate)})
                  </span>
                </div>
              )}
            </div>

            {/* Languages Tags */}
            {suite.languages && suite.languages.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {suite.languages.map((lang) => (
                  <span
                    key={lang}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reusable GeneratedWorkspace Component */}
          <GeneratedWorkspace
            testSuiteData={suite.test_suite || {}}
            projectName={suite.project_name || "Project Codebase"}
            filesAnalyzed={suite.files_count || 0}
            tabs={suite.categories || Object.keys(suite.test_suite || {})}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isGenerating={false}
            generated={true}
          />
        </div>
      )}
    </div>
  );
}
