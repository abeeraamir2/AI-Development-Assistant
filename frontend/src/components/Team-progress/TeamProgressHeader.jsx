// src/components/Team-progress/TeamProgressHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { Folder, Layers, ChevronDown, Check, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROJECT_PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#6366f1", // Indigo
];

export default function TeamProgressHeader({
  projects = [],
  selectedProject = "all", // "all" or project object
  onSelectProject,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isAllSelected =
    !selectedProject ||
    selectedProject === "all" ||
    selectedProject === "All";

  const currentProjectName = isAllSelected
    ? "All Projects"
    : selectedProject?.name || "Select Project";

  const filteredProjects = projects.filter((p) =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
    >
      {/* Title & Breadcrumbs */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-1">
          <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Home</span>
          <ChevronRight size={12} className="text-[var(--text-muted)] opacity-60" />
          <span className="text-[var(--text-primary)] font-semibold">Team Progress</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          Team Progress
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
          Monitor team workload, progress, and work completion across active initiatives.
        </p>
      </div>

      {/* Project Selector Dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer min-w-[170px] max-w-[240px] justify-between shadow-xs"
          title="Filter team progress by project"
        >
          <div className="flex items-center gap-2 truncate">
            {isAllSelected ? (
              <Layers size={14} className="text-[#4d8bf8] shrink-0" />
            ) : (
              <Folder size={14} className="text-slate-400 dark:text-zinc-400 shrink-0" />
            )}
            <span className="truncate">{currentProjectName}</span>
          </div>
          <ChevronDown
            size={13}
            className={`text-[var(--text-muted)] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#4d8bf8]" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1.5 w-64 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl p-2 z-50 text-xs backdrop-blur-md"
            >
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)]/40 pb-1.5 mb-1.5">
                <span>Filter Project</span>
                {projects.length > 0 && (
                  <span className="text-[9px] font-semibold text-[var(--text-secondary)]">
                    {projects.length} {projects.length === 1 ? "project" : "projects"}
                  </span>
                )}
              </div>

              {/* Quick Search */}
              {projects.length > 3 && (
                <div className="relative mb-2 px-1">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[#4d8bf8]"
                  />
                </div>
              )}

              <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
                {/* All Projects Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProject) onSelectProject("all");
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isAllSelected
                      ? "bg-[#4d8bf8]/10 text-[#4d8bf8] font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers size={13} className="text-[#4d8bf8] shrink-0" />
                    <span>All Projects</span>
                  </div>
                  {isAllSelected && <Check size={13} className="text-[#4d8bf8] shrink-0" />}
                </button>

                {/* Individual Projects List */}
                {filteredProjects.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-[var(--text-muted)]">
                    {searchQuery ? "No matching projects" : "No projects found"}
                  </div>
                ) : (
                  filteredProjects.map((p, idx) => {
                    const isSelected =
                      !isAllSelected &&
                      ((selectedProject?.id && (p.id === selectedProject.id || p._id === selectedProject.id)) ||
                        (selectedProject?._id && (p.id === selectedProject._id || p._id === selectedProject._id)) ||
                        p.name === selectedProject?.name);

                    const projectColor =
                      p.color ||
                      PROJECT_PALETTE[
                        Math.abs(
                          (p.name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
                        ) % PROJECT_PALETTE.length
                      ];

                    return (
                      <button
                        key={p.id || p._id || idx}
                        type="button"
                        onClick={() => {
                          if (onSelectProject) onSelectProject(p);
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#4d8bf8]/10 text-[#4d8bf8] font-bold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1 mr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: projectColor }}
                          />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {isSelected && <Check size={13} className="text-[#4d8bf8] shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
