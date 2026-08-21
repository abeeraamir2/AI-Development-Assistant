// src/components/history/HistoryFilters.jsx
import React from "react";
import { Search, ChevronDown } from "lucide-react";

export default function HistoryFilters({
  searchQuery,
  setSearchQuery,
  selectedProject,
  setSelectedProject,
  selectedStatus,
  setSelectedStatus,
  projectOptions = ["All Projects"],
}) {
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
      <div className="relative w-full sm:w-48">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer pr-8 font-medium"
        >
          {projectOptions.map((proj, idx) => (
            <option key={idx} value={proj} className="bg-[var(--bg-surface)]">
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
      <div className="relative w-full sm:w-40">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full appearance-none px-3.5 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer pr-8 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Needs Review">Needs Review</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
      </div>
    </div>
  );
}