// src/pages/developer/AnalyzerPage.jsx
import React, { useState } from "react";
import { Sparkles, Folder } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

import RequirementInput from "../../components/Shared/RequirementInput";
import SimilarityWarningBanner from "../../components/Requirement-analyzer/SimilarityWarningBanner";
import ScopeSelector from "../../components/Requirement-analyzer/ScopeSelector";
import RelatedRequirementsCard from "../../components/Requirement-analyzer/RelatedRequirementsCard";
import RecentAnalysisList from "../../components/Requirement-analyzer/RecentAnalysisList";
import AnalyzingRequirementScreen from "../../components/Requirement-analyzer/AnalyzingRequirementScreen";

export default function AnalyzerPage({ authToken, selectedProject = "Project Alpha" }) {
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState([
    "summary",
    "criteria",
    "tasks",
    "api",
    "database",
    "edge_cases",
  ]);

  const navigate = useNavigate();

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]
    );
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !uploadedFile) {
      toast.error("Please enter requirement text or upload a specification document.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    if (uploadedFile) formData.append("file", uploadedFile);
    if (inputText.trim()) formData.append("text_input", inputText.trim());
    formData.append("scopes", JSON.stringify(selectedScopes));
    formData.append("project", selectedProject);

    const startTime = Date.now();

    try {
      const token = authToken || localStorage.getItem("token") || localStorage.getItem("authToken");
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to analyze requirement.");

      const resultData = await res.json();

      // Ensure loading animation displays for at least 1.5s for smooth visual transition
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 1500;
      if (elapsed < minDisplayTime) {
        await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsed));
      }

      toast.success("Analysis complete!");
      navigate("/results", { state: { result: resultData } });
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnalyzingRequirementScreen
        filename={uploadedFile ? uploadedFile.name : "requirement_input.txt"}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requirement Analyzer</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Transform your software requirements into structured, actionable development insights.
        </p>
      </div>

      {/* Top Similarity Warning Banner */}
      <SimilarityWarningBanner
        similarReq={{
          title: "User Auth Flow",
          timeAgo: "2 days ago",
        }}
        onView={() => navigate("/history")}
      />

      {/* Main Grid: Input Form (Left) & Related Requirements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-5">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                <Folder size={15} className="text-[var(--accent)]" />
                <span>
                  Project: <strong className="text-[var(--text-primary)]">{selectedProject}</strong>
                </span>
              </div>
            </div>

            <RequirementInput
              inputText={inputText}
              setInputText={setInputText}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
            />

            <ScopeSelector selectedScopes={selectedScopes} toggleScope={toggleScope} />

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full py-3 px-4 bg-[var(--accent)] hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Analyze with AI</span>
            </button>
          </div>
        </div>

        {/* Right Column Context Cards */}
        <div className="lg:col-span-4">
          <RelatedRequirementsCard
            relatedReqs={[
              { id: "REQ-003", matchPercent: 92, title: "Legacy Password Reset Flow" },
              { id: "REQ-012", matchPercent: 78, title: "User Profile Security Settings" },
            ]}
          />
        </div>
      </div>

      {/* Bottom Recent Analyses History */}
      <RecentAnalysisList
        recentList={[
          {
            id: "1",
            title: "User Authentication Flow V2",
            project: "Project Alpha",
            time: "2 hours ago",
            status: "Completed",
          },
          {
            id: "2",
            title: "Payment Gateway Integration",
            project: "Project Beta",
            time: "yesterday",
            status: "Needs Review",
          },
        ]}
      />
    </div>
  );
}