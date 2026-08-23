// src/components/Work-items/AllWorkItemsSection.jsx
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  ChevronDown,
  X,
  Plus,
  Folder,
} from "lucide-react";
import { motion } from "framer-motion";
import WorkItemTableRow from "./WorkItemTableRow";

export default function AllWorkItemsSection({
  items = [],
  selectedProject = "all",
  onClearProjectFilter,
  onNewWorkItem,
  onViewDetails,
  onEdit,
  onDelete,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "title" | "category" | "status"

  // Distinct categories and assignees for dropdowns
  const categories = ["All", "Frontend", "Backend", "DevOps", "Testing"];
  const statuses = ["All", "Not Started", "In Progress", "Completed"];
  const assignees = useMemo(() => {
    const list = ["All"];
    items.forEach((it) => {
      if (it.assignedTo?.name && !list.includes(it.assignedTo.name)) {
        list.push(it.assignedTo.name);
      }
    });
    return list;
  }, [items]);

  const isFilteredByProject =
    selectedProject &&
    selectedProject !== "all" &&
    selectedProject !== "All";

  // Filter and Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.projectName?.toLowerCase().includes(q) ||
        item.parent?.title?.toLowerCase().includes(q) ||
        item.assignedTo?.name?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      const matchesAssignee =
        selectedAssignee === "All" || item.assignedTo?.name === selectedAssignee;

      return matchesSearch && matchesCategory && matchesStatus && matchesAssignee;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "");
      }
      if (sortBy === "category") {
        return (a.category || "").localeCompare(b.category || "");
      }
      // default: newest
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedAssignee, sortBy]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    selectedAssignee !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedAssignee("All");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs overflow-hidden"
    >
      {/* Header & Filter Controls Bar */}
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              All Work Items
            </h3>
            {isFilteredByProject && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#4d8bf8]/10 text-[#4d8bf8] border border-[#4d8bf8]/20">
                <Folder size={11} />
                <span>{selectedProject.name}</span>
                {onClearProjectFilter && (
                  <button
                    type="button"
                    onClick={onClearProjectFilter}
                    className="hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                    title="Clear project filter (Show all projects)"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Showing {filteredAndSortedItems.length} of {items.length} work items
            {isFilteredByProject && ` for ${selectedProject.name}`}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-44 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#4d8bf8] focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all cursor-pointer shadow-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "Category: All" : `Category: ${cat}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all cursor-pointer shadow-xs"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "Status: All" : `Status: ${st}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all cursor-pointer shadow-xs"
            >
              <option value="newest">Sort: ID (Newest)</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="category">Sort: Category</option>
              <option value="status">Sort: Status</option>
            </select>
            <ArrowUpDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear active filters"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)]/40 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-3">ID</th>
              <th className="py-3.5 px-3">Work Item</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Assigned To</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Start Date</th>
              <th className="py-3.5 px-3">End Date</th>
              <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="font-semibold text-sm text-[var(--text-primary)]">
                      No work items found
                    </p>
                    <p className="max-w-xs text-[var(--text-muted)]">
                      {isFilteredByProject
                        ? `No work items found for project "${selectedProject.name}".`
                        : "No items match your active search and filter criteria."}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {isFilteredByProject && onClearProjectFilter && (
                        <button
                          type="button"
                          onClick={onClearProjectFilter}
                          className="px-3 py-1.5 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8] text-xs font-bold hover:bg-[#4d8bf8]/20 transition-colors cursor-pointer"
                        >
                          Show All Projects
                        </button>
                      )}
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item) => (
                <WorkItemTableRow
                  key={item.id}
                  item={item}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
