// src/components/Analysis-history/HistoryFilters.jsx
import React from "react";
import { Search, ChevronDown, Folder, Filter, X } from "lucide-react";

export default function HistoryFilters({
  searchQuery,
  setSearchQuery,
  selectedProject,
  setSelectedProject,
  selectedStatus,
  setSelectedStatus,
  projectOptions = ["All Projects"],
  onResetFilters,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedProject !== "All Projects" ||
    selectedStatus !== "All";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search analyses by keyword, requirement, or document..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* Project Selector Filter */}
      <div className="relative w-full sm:w-52">
        <Folder
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className={`w-full appearance-none pl-9 pr-8 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer font-medium transition-all ${
            selectedProject !== "All Projects"
              ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--accent)]/5"
              : "border-[var(--border-color)]"
          }`}
        >
          {projectOptions.map((proj, idx) => (
            <option key={idx} value={proj} className="bg-[var(--bg-surface)] text-[var(--text-primary)] font-normal">
              {proj}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
      </div>

      {/* Status Filter */}
      <div className="relative w-full sm:w-44">
        <Filter
          size={12}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`w-full appearance-none pl-9 pr-8 py-2 text-xs rounded-xl border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer font-medium transition-all ${
            selectedStatus !== "All"
              ? "border-[var(--accent)] text-[var(--accent)] font-bold bg-[var(--accent)]/5"
              : "border-[var(--border-color)]"
          }`}
        >
          <option value="All" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">All Statuses</option>
          <option value="Completed" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Completed</option>
          <option value="Approved" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Approved</option>
          <option value="Needs Review" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Needs Review</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
      </div>

      {/* Clear Filters Button (Visible only when filters are active) */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
          title="Reset all filters"
        >
          <X size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}