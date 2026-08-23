import React from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const ROUTE_LABELS = {
  "/": "Overview",
  "/work-items": "Work Items",
  "/work-items/create": "Create Work Item",
  "/analyzer": "Analyzer",
  "/results": "Results",
  "/history": "History",
  "/test-generator": "Test Generator",
  "/bug-summarizer": "Bug Summarizer",
  "/admin/users": "Users",
  "/admin/roles": "Roles & Permissions",
  "/admin/team-progress": "Team Progress",
  "/admin/ai-insights": "AI Insights",
  "/settings": "Settings",
};

export default function TopHeader({ theme, toggleTheme }) {
  const location = useLocation();
  const getRouteTitle = (pathname) => {
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
    if (pathname.startsWith("/work-items/") && pathname.endsWith("/edit")) {
      return "Edit Work Item";
    }
    if (pathname.startsWith("/work-items/") && pathname !== "/work-items/create") {
      return "Work Item Details";
    }
    return "Workspace";
  };
  const currentTitle = getRouteTitle(location.pathname);

  return (
    <header className="h-14 border-b border-[var(--border-color,#e2e8f0)] bg-[var(--bg-surface,#ffffff)] px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-500">
        <span className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">Workspace</span>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentTitle}</span>
      </div>

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-xl border border-[var(--border-color,#e2e8f0)] bg-[var(--bg-subtle,#f8fafc)] text-slate-600 dark:text-zinc-300 hover:border-[#4d8bf8] transition-all cursor-pointer"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}