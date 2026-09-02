// src/pages/developer/AnalyzerPage.jsx
import React, { useState, useEffect } from "react";
import { Sparkles, Folder, ChevronDown } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

import RequirementInput from "../../components/Shared/RequirementInput";
import SimilarityWarningBanner from "../../components/Requirement-analyzer/SimilarityWarningBanner";
import ScopeSelector from "../../components/Requirement-analyzer/ScopeSelector";
import RecentAnalysisList from "../../components/Requirement-analyzer/RecentAnalysisList";
import AnalyzingRequirementScreen from "../../components/Requirement-analyzer/AnalyzingRequirementScreen";

export default function AnalyzerPage({ authToken, selectedProject }) {
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const getInitialProjects = () => {
    try {
      const cached = localStorage.getItem("cached_projects");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const initialProjects = getInitialProjects();
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(
    selectedProject?._id ||
    selectedProject?.id ||
    (initialProjects.length > 0 ? (initialProjects[0].id || initialProjects[0]._id) : "")
  );
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [similarReq, setSimilarReq] = useState(null);

  const [selectedScopes, setSelectedScopes] = useState([
    "summary",
    "criteria",
    "tasks",
    "api",
    "database",
    "edge_cases",
  ]);

  const navigate = useNavigate();

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // 1. Fetch live projects list from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = getToken();
        const res = await fetch("http://localhost:8000/projects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        const projectList = Array.isArray(data) ? data : [];
        setProjects(projectList);
        try {
          localStorage.setItem("cached_projects", JSON.stringify(projectList));
        } catch {
          // ignore quota error
        }
        if (projectList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectList[0].id || projectList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    };

    fetchProjects();
  }, [authToken]);

  // 2. Fetch live Recent Analyses from database
  const fetchRecentAnalyses = async () => {
    setRecentLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/history?limit=5", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      setRecentAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recent analyses:", err);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAnalyses();
  }, [authToken]);

  // 3. Check for similar requirements in database when input text changes (debounced)
  useEffect(() => {
    if (!inputText.trim() || !selectedProjectId) {
      setSimilarReq(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const token = getToken();
        const res = await fetch("http://localhost:8000/check-similarity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            project_id: selectedProjectId,
            input_text: inputText.trim(),
            text: inputText.trim(),
          }),
        });

        if (!res.ok) return;
        const data = await res.json();
        if (data.similar_detected && data.similar_req) {
          setSimilarReq(data.similar_req);
        } else {
          setSimilarReq(null);
        }
      } catch (err) {
        console.error("Similarity check error:", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, selectedProjectId, authToken]);

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]
    );
  };

  const selectedProjectObj = projects.find(
    (p) => (p.id || p._id) === selectedProjectId
  );

  const handleAnalyze = async () => {
    if (!inputText.trim() && !uploadedFile) {
      toast.error("Please enter requirement text or upload a specification document.");
      return;
    }

    if (!selectedProjectId) {
      toast.error("Please select a target project from the dropdown first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    if (uploadedFile) formData.append("file", uploadedFile);
    if (inputText.trim()) formData.append("text_input", inputText.trim());
    formData.append("scopes", selectedScopes.join(","));
    formData.append("project", selectedProjectObj?.name || "Workspace Project");
    formData.append("project_id", selectedProjectId);

    const startTime = Date.now();

    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to analyze requirement.");
      }

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
          Transform software requirements into structured, actionable development insights and architecture plans.
        </p>
      </div>

      {/* Top Similarity Warning Banner (displays ONLY when similar requirement is detected in DB) */}
      <SimilarityWarningBanner
        similarReq={similarReq}
        onView={() => navigate("/history")}
      />

      {/* Main Input Form */}
      <div className="w-full space-y-6">
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-5">
          {/* Project Selection Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
              <Folder size={16} className="text-[var(--accent)]" />
              <span>Target Project:</span>
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full appearance-none px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-hidden transition-all cursor-pointer pr-8 shadow-xs"
              >
                {projects.length === 0 && (
                  <option value="" disabled>
                    Loading projects...
                  </option>
                )}
                {projects.map((proj) => {
                  const pId = proj.id || proj._id;
                  return (
                    <option key={pId} value={pId}>
                      {proj.name}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
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

      {/* Bottom Recent Analyses History (Live data from DB) */}
      <RecentAnalysisList
        recentList={recentAnalyses}
        loading={recentLoading}
      />
    </div>
  );
}