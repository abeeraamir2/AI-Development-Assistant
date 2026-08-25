import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Bell } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useProjectAccess } from "../../context/ProjectAccessContext";
import NotificationPanel from "./NotificationPanel";

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
  "/team-progress": "Team Progress",
  "/admin/team-progress": "Team Progress",
  "/admin/ai-insights": "AI Insights",
  "/settings": "Settings",
};

export default function TopHeader({ theme, toggleTheme }) {
  const location = useLocation();
  const { unreadCount } = useProjectAccess();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications on outside click or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotifOpen]);

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
    <header className="h-14 border-b border-[var(--border-color,#e2e8f0)] bg-[var(--bg-surface,#ffffff)] px-6 flex items-center justify-between shrink-0 transition-colors z-40 relative">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-500">
        <span className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">Workspace</span>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentTitle}</span>
      </div>

      {/* Right Controls: Notifications + Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`p-2 rounded-xl border border-[var(--border-color,#e2e8f0)] bg-[var(--bg-subtle,#f8fafc)] text-slate-600 dark:text-zinc-300 hover:border-[#4d8bf8] transition-all cursor-pointer relative ${
              isNotifOpen ? "border-[#4d8bf8] text-[#4d8bf8]" : ""
            }`}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#4d8bf8] text-[9px] font-black text-white shadow-xs animate-in zoom-in duration-200">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <NotificationPanel onClose={() => setIsNotifOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border-color,#e2e8f0)] bg-[var(--bg-subtle,#f8fafc)] text-slate-600 dark:text-zinc-300 hover:border-[#4d8bf8] transition-all cursor-pointer"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}