import React from "react";
import { Search, UserPlus, ChevronDown } from "lucide-react";

export default function UserManagementHeader({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onOpenAddModal,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          User Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Manage team members, role assignments, and workspace access.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            <option value="All Roles">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Developer">Developer</option>
            <option value="QA Engineer">QA Engineer</option>
            <option value="Product Manager">Product Manager</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-none transition-all cursor-pointer shadow-xs"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full sm:w-auto">
          <Search
            size={14}
            className="absolute left-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-56 pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Add User Action */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer"
        >
          <UserPlus size={14} strokeWidth={2.5} />
          <span>Add User</span>
        </button>
      </div>
    </div>
  );
}