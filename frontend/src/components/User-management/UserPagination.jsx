import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UserPagination({
  totalCount,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
}) {
  if (totalCount === 0) return null;

  // Generate page numbers array with ellipsis if many pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]">
      <div>
        Showing <span className="font-semibold text-[var(--text-primary)]">{startIndex}-{endIndex}</span> of{" "}
        <span className="font-semibold text-[var(--text-primary)]">{totalCount}</span> users
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-zinc-500 font-bold select-none">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-[#4d8bf8] text-white shadow-xs"
                  : "border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}