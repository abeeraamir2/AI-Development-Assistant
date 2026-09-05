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
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../modals/CreateProjectModal";
import { isAdminRole } from "../../utils/roleUtils";
import { useProjectAccess } from "../../context/ProjectAccessContext";

export default function DeveloperKPICards({
  authToken,
  userRole,
  userEmail,
  metrics,
  projects = [],
  selectedProject,
  onSelectProject,
  onProjectCreated,
  onEditProject,
  onDeleteProject,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { getProjectAccessStatus } = useProjectAccess();

  const currentEmail = userEmail || localStorage.getItem("userEmail") || "";
  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("id") || "";
  const currentRole = userRole || localStorage.getItem("userRole") || "";
  const isUserAdmin = isAdminRole(currentRole);

  const hasProjects = Boolean(projects && projects.length > 0);

  const currentProject = hasProjects
    ? projects.find(
        (p) =>
          p.id === selectedProject ||
          p.name === selectedProject ||
          (selectedProject && (p.id === selectedProject.id || p.id === selectedProject._id))
      ) || projects[0]
    : null;

  const canManageCurrent =
    currentProject &&
    (isUserAdmin ||
      (currentUserId && currentProject.owner_id && currentProject.owner_id === currentUserId) ||
      (currentEmail && currentProject.owner_email === currentEmail));

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModalSuccess = (newProject) => {
    if (onProjectCreated) {
      onProjectCreated(newProject);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Active Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Developer Workspace
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Here's an overview of your projects and AI-assisted development activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Select Project Dropdown - only shown when at least one project exists */}
          {hasProjects && (
            <div className="flex items-center gap-1.5">
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
                  <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                      Select Active Project
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-[var(--border-color)]/30">
                      {projects.map((project) => {
                        const isSelected = project.id === currentProject?.id;
                        const isOwner = project.owner_email ? project.owner_email === currentEmail : true;
                        const canManage = isUserAdmin || isOwner;

                        const isPrivate = project.visibility && project.visibility.toLowerCase() === "private";

                        return (
                          <div
                            key={project.id}
                            className={`group flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-primary)] transition-colors ${
                              isSelected
                                ? "text-[var(--accent)] font-bold bg-[var(--bg-primary)]/50"
                                : "text-[var(--text-primary)] font-medium"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectProject) onSelectProject(project);
                                setIsOpen(false);
                              }}
                              className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: project.color || "#10b981" }}
                              />
                              <span className="truncate">{project.name}</span>
                              {isPrivate && (
                                <Lock size={11} className="text-amber-500 shrink-0 ml-0.5 opacity-80" />
                              )}
                            </button>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {isSelected && <Check size={13} className="text-[var(--accent)]" />}
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    title="Edit project"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsOpen(false);
                                      if (onEditProject) onEditProject(project);
                                    }}
                                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete project"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsOpen(false);
                                      if (onDeleteProject) onDeleteProject(project);
                                    }}
                                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
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

              {/* Quick Actions for Current Project (Only if owner or Admin) */}
              {canManageCurrent && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Edit selected project"
                    onClick={() => onEditProject && onEditProject(currentProject)}
                    className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer shadow-xs"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    title="Delete selected project"
                    onClick={() => onDeleteProject && onDeleteProject(currentProject)}
                    className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

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
              {String(metrics?.active_projects ?? projects.length).padStart(2, "0")}
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
                {metrics?.requirements_analyzed ?? 0}
              </span>
              {metrics?.this_week_change_pct != null && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {metrics.this_week_change_pct}% this week
                </span>
              )}
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
              {metrics?.completed_analyses ?? 0}
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
              {String(metrics?.needs_attention ?? 0).padStart(2, "0")}
            </p>
          </div>
          <AlertTriangle size={24} className="text-amber-400 opacity-60" />
        </div>
      </div>

      {/* Render the Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleModalSuccess}
        authToken={authToken}
      />
    </div>
  );
}