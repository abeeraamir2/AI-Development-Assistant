import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const ROUTE_LABELS = {
  "/": "Overview",
  "/overview": "Overview",
  "/test-generator": "Test Generator",
  "/test-history": "Test History",
  "/bug-summarizer": "Bug Summarizer",
  "/analyzer": "Analyzer",
  "/results": "Results",
  "/history": "History",
  "/settings": "Settings",
};

export default function TopHeader({ theme: propTheme, toggleTheme: propToggleTheme }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageTitle = ROUTE_LABELS[currentPath] || "Overview";

  // Internal state fallback if theme/toggleTheme are not passed from parent
  const [internalTheme, setInternalTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const currentTheme = propTheme || internalTheme;

  // Sync the 'dark' class on <html> whenever the theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const handleToggle = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setInternalTheme(nextTheme);
    }
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-8 transition-colors">
      {/* Left Section: Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
        <span>Workspace</span>
        <span>/</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {pageTitle}
        </span>
      </div>

      {/* Right Section: Theme Toggle Button */}
      <div className="flex items-center">
        <button
          onClick={handleToggle}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
          title={currentTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {currentTheme === "dark" ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
}