// src/pages/test-engineer/TestGeneratorPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Sparkles } from "lucide-react";
import ProjectFolderUpload from "../../components/test-generator/ProjectFolderUpload";
import GenerationStrategy from "../../components/test-generator/GenerationStrategy";
import GeneratedWorkspace from "../../components/test-generator/GeneratedWorkspace";

export default function TestGeneratorPage({ authToken }) {
  // Projects & Upload State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [uploadedProject, setUploadedProject] = useState(null);
  const [focusNotes, setFocusNotes] = useState("");

  // Strategy State
  const [strategy, setStrategy] = useState({
    coverage: "Standard",
    selectedTypes: ["Functional", "API", "Negative", "Boundary", "Security"],
    priority: "All",
    includeEdgeCases: true,
    includeNegative: true,
    testCaseCount: "Auto",
  });

  // Workspace & Generation State
  const [activeTab, setActiveTab] = useState("Functional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [testSuiteData, setTestSuiteData] = useState(null);
  const [generationMeta, setGenerationMeta] = useState({
    projectName: "Project Codebase",
    filesAnalyzed: 0,
    languages: [],
  });

  const testTypeOptions = [
    "Functional",
    "API",
    "Negative",
    "Boundary",
    "Security",
    "Performance",
    "Regression",
  ];

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // Fetch workspace projects for dropdown selection
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
        if (projectList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectList[0].id || projectList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, [authToken]);

  const handleProjectFilesSelected = (projectData) => {
    setUploadedProject(projectData);
    toast.success(`Loaded project files for "${projectData.name}" (${projectData.count} items)`);
  };

  const handleClearProject = () => {
    setUploadedProject(null);
  };

  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a target project from the dropdown first.");
      return;
    }

    if (!uploadedProject) {
      toast.error("Please upload the project code folder or ZIP archive first.");
      return;
    }

    if (!strategy.selectedTypes || strategy.selectedTypes.length === 0) {
      toast.error("Please select at least one test type to generate.");
      return;
    }

    setIsGenerating(true);
    toast.info("Analyzing codebase architecture and generating test cases...");

    try {
      const token = getToken();
      const formData = new FormData();

      const selectedProj = projects.find(
        (p) => (p.id || p._id) === selectedProjectId
      );
      const projName = selectedProj?.name || uploadedProject.name;

      formData.append("project_id", selectedProjectId);
      formData.append("project_name", projName);
      formData.append("strategy", JSON.stringify(strategy));

      if (focusNotes.trim()) {
        formData.append("focus_notes", focusNotes.trim());
      }

      if (uploadedProject?.type === "zip" && uploadedProject.file) {
        formData.append("zip_file", uploadedProject.file);
      } else if (uploadedProject?.type === "folder" && uploadedProject.files) {
        uploadedProject.files.forEach((file) => {
          formData.append("files", file);
        });
        if (uploadedProject.relativePaths) {
          formData.append("relative_paths", JSON.stringify(uploadedProject.relativePaths));
        }
      }

      const response = await fetch("http://localhost:8000/generate-tests", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate test cases.");
      }

      const data = await response.json();

      setTestSuiteData(data.test_suite || {});
      setGenerationMeta({
        projectName: data.project_name || projName,
        filesAnalyzed: data.files_analyzed || uploadedProject?.count || 0,
        languages: data.languages || [],
      });

      setGenerated(true);
      const availableTabs = Object.keys(data.test_suite || {});
      setActiveTab(availableTabs[0] || strategy.selectedTypes[0] || "Functional");

      let totalCount = 0;
      Object.values(data.test_suite || {}).forEach((arr) => {
        if (Array.isArray(arr)) totalCount += arr.length;
      });

      toast.success(`Synthesized ${totalCount} test cases linked to "${projName}"!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6 sm:space-y-8">
      <Toaster position="top-right" richColors />

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <Sparkles size={24} className="text-[var(--accent)]" />
            AI Codebase Test Generator
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-3xl">
            Select a project and upload the project code folder or repository archive. Our AI inspects routes, models, state handlers, and functions to synthesize comprehensive production test suites.
          </p>
        </div>

        {generationMeta.languages && generationMeta.languages.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {generationMeta.languages.map((lang) => (
              <span
                key={lang}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Top Section: 2-Col Project Folder Upload + Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <ProjectFolderUpload
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProjectId={setSelectedProjectId}
          uploadedProject={uploadedProject}
          onProjectFilesSelected={handleProjectFilesSelected}
          onClearProject={handleClearProject}
          focusNotes={focusNotes}
          setFocusNotes={setFocusNotes}
        />

        <GenerationStrategy
          strategy={strategy}
          setStrategy={setStrategy}
          testTypeOptions={testTypeOptions}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>

      {/* Bottom Section: Generated Workspace Explorer */}
      <GeneratedWorkspace
        testSuiteData={testSuiteData}
        projectName={generationMeta.projectName}
        filesAnalyzed={generationMeta.filesAnalyzed}
        tabs={strategy.selectedTypes}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isGenerating={isGenerating}
        generated={generated}
      />
    </div>
  );
}