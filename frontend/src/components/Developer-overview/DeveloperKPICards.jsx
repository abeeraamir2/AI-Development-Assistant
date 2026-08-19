// src/components/developer-overview/DeveloperKPICards.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  ChevronDown,
  Check,
  FolderPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../modals/CreateProjectModal";

export default function DeveloperKPICards({
  metrics,
  projects = [],
  selectedProject,
  onSelectProject,
  onProjectCreated, // Callback to inform parent page of new project
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Default projects list fallback if none are provided
  const projectList = projects.length
    ? projects
    : [
        { id: "1", name: "Project Alpha", color: "#10b981" },
        { id: "2", name: "E-Commerce Platform", color: "#3b82f6" },
        { id: "3", name: "Task Manager", color: "#f59e0b" },
      ];

  const currentProject =
    projectList.find((p) => p.id === selectedProject || p.name === selectedProject) ||
    projectList[0];

  // Handle successful project creation
  const handleCreated = (newProject) => {
    if (onProjectCreated) {
      onProjectCreated(newProject);
    }
    if (onSelectProject) {
      onSelectProject(newProject);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="space-y-6">
        {/* Greeting Header & Interactive Project Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              Good morning, Developer
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Here's an overview of your projects and AI-assisted development activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Custom Select Project Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs min-w-[155px] justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentProject?.color || "#10b981" }}
                  />
                  <span className="truncate">{currentProject?.name}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[var(--text-muted)] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                    Select Active Project
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-[var(--border-color)]/30">
                    {projectList.map((project) => {
                      const isSelected = project.id === currentProject?.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            if (onSelectProject) onSelectProject(project);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg-primary)] transition-colors cursor-pointer ${
                            isSelected
                              ? "text-[var(--accent)] font-bold bg-[var(--bg-primary)]/50"
                              : "text-[var(--text-primary)] font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: project.color || "#10b981" }}
                            />
                            <span className="truncate">{project.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-[var(--accent)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-[var(--border-color)] px-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <FolderPlus size={14} />
                      <span>Create New Project...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Project Primary CTA Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus size={15} /> Add Project
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Projects */}
          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
                Active Projects
              </p>
              <p className="text-3xl font-extrabold mt-2">
                {String(metrics?.active_projects || projectList.length).padStart(2, "0")}
              </p>
            </div>
            <Folder size={28} className="text-[var(--text-muted)] opacity-30" />
          </div>

          {/* Requirements Analyzed */}
          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
                Requirements Analyzed
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold">
                  {metrics?.requirements_analyzed || 1}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} /> 12% this week
                </span>
              </div>
            </div>
          </div>

          {/* Completed Analyses */}
          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
                Completed Analyses
              </p>
              <p className="text-3xl font-extrabold mt-2">
                {metrics?.completed_analyses || 1}
              </p>
            </div>
            <CheckCircle size={24} className="text-emerald-400 opacity-60" />
          </div>

          {/* Needs Attention */}
          <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
                Needs Attention
              </p>
              <p className="text-3xl font-extrabold mt-2">
                {String(metrics?.needs_attention || 3).padStart(2, "0")}
              </p>
            </div>
            <AlertTriangle size={24} className="text-amber-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Render the Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleCreated}
      />
    </>
  );
}