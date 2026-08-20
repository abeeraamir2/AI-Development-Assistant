import React, { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, Check, Bell, FileDown } from "lucide-react";

export default function AdminControlsHeader({
  projects = [],
  selectedProject,
  onSelectProject,
  sprints = [],
  selectedSprint,
  onSelectSprint,
  onAddSprint,
}) {
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isSprintOpen, setIsSprintOpen] = useState(false);
  const projectRef = useRef(null);
  const sprintRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (projectRef.current && !projectRef.current.contains(e.target)) setIsProjectOpen(false);
      if (sprintRef.current && !sprintRef.current.contains(e.target)) setIsSprintOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
          Sprint Intelligence
        </h1>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          On Track
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Project Selector */}
        <div className="relative" ref={projectRef}>
          <button
            type="button"
            onClick={() => {
              setIsProjectOpen((prev) => !prev);
              setIsSprintOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer min-w-[145px] justify-between shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: selectedProject?.color || "#10b981" }}
              />
              <span className="truncate">{selectedProject?.name || "Select Project"}</span>
            </div>
            <ChevronDown size={13} className="text-[var(--text-muted)]" />
          </button>

          {isProjectOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl py-1.5 z-50 text-xs">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    setIsProjectOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span className="truncate">{p.name}</span>
                  {selectedProject?.id === p.id && <Check size={13} className="text-[#4d8bf8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sprint Selector */}
        <div className="relative" ref={sprintRef}>
          <button
            type="button"
            onClick={() => {
              setIsSprintOpen((prev) => !prev);
              setIsProjectOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer min-w-[130px] justify-between shadow-xs"
          >
            <span className="truncate">{selectedSprint?.name || "Select Sprint"}</span>
            <ChevronDown size={13} className="text-[var(--text-muted)]" />
          </button>

          {isSprintOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-44 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl py-1.5 z-50 text-xs">
              {sprints.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSprint(s);
                    setIsSprintOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span>{s.name}</span>
                  {selectedSprint?.id === s.id && <Check size={13} className="text-[#4d8bf8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Sprint Button */}
        <button
          type="button"
          onClick={onAddSprint}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Sprint</span>
        </button>

        {/* Extra Actions */}
        <button
          type="button"
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#4d8bf8] transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={15} />
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#4d8bf8] transition-colors cursor-pointer"
        >
          <FileDown size={14} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}