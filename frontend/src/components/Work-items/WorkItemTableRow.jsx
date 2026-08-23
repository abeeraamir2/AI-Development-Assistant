// src/components/Work-items/WorkItemTableRow.jsx
import React, { useState, useRef, useEffect } from "react";
import { GitFork, MoreVertical, Eye, Edit3, Trash2, Folder } from "lucide-react";
import WorkItemStatusBadge from "./WorkItemStatusBadge";
import WorkItemCategoryBadge from "./WorkItemCategoryBadge";

export default function WorkItemTableRow({
  item,
  onViewDetails,
  onEdit,
  onDelete,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors border-b border-[var(--border-color)] group">
      {/* ID */}
      <td
        onClick={() => onViewDetails && onViewDetails(item)}
        className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-[#4d8bf8] whitespace-nowrap cursor-pointer hover:underline"
      >
        {item.id}
      </td>

      {/* Work Item Title, Project & Parent Subtext */}
      <td
        onClick={() => onViewDetails && onViewDetails(item)}
        className="py-4 px-3 max-w-[300px] cursor-pointer"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#4d8bf8] transition-colors leading-snug">
              {item.title}
            </p>
            {item.projectName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-md border border-[var(--border-color)]/60 shrink-0">
                <Folder size={10} className="text-[#4d8bf8]" />
                <span className="truncate max-w-[120px]">{item.projectName}</span>
              </span>
            )}
          </div>
          {item.parent && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
              <GitFork size={11} className="shrink-0 text-[#818cf8]" />
              <span className="truncate">
                Parent: <strong className="text-[var(--text-secondary)]">{item.parent.id} {item.parent.title}</strong>
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="py-4 px-3 whitespace-nowrap">
        <WorkItemCategoryBadge category={item.category} />
      </td>

      {/* Assigned To */}
      <td className="py-4 px-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
            {item.assignedTo?.initial || item.assignedTo?.name?.charAt(0) || "U"}
          </div>
          <span className="text-xs font-medium text-[var(--text-primary)]">
            {item.assignedTo?.name || "Unassigned"}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="py-4 px-3 whitespace-nowrap">
        <WorkItemStatusBadge status={item.status} />
      </td>

      {/* Start Date */}
      <td className="py-4 px-3 text-xs text-[var(--text-secondary)] whitespace-nowrap font-medium">
        {item.status === "Not Started" || !item.startDate ? (
          <span className="text-[var(--text-muted)] text-[11px] font-normal">—</span>
        ) : (
          item.startDate
        )}
      </td>

      {/* End Date */}
      <td className="py-4 px-3 text-xs text-[var(--text-secondary)] whitespace-nowrap font-medium">
        {item.status === "Not Started" || !item.endDate ? (
          <span className="text-[var(--text-muted)] text-[11px] font-normal">—</span>
        ) : (
          item.endDate
        )}
      </td>

      {/* Actions */}
      <td className="py-4 pr-6 pl-3 text-right relative">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            title="Work Item Actions"
          >
            <MoreVertical size={15} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onViewDetails) onViewDetails(item);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                <Eye size={13} className="text-[#4d8bf8]" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onEdit) onEdit(item);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                <Edit3 size={13} className="text-amber-400" />
                <span>Edit</span>
              </button>

              <div className="my-1 border-t border-[var(--border-color)]" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onDelete) onDelete(item);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
