import React from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const ROUTE_LABELS = {
  "/": "Overview",
  "/test-generator": "Test Generator",
  "/test-history": "Test History",
  "/bug-summarizer": "Bug Summarizer",
  "/analyzer": "Analyzer",
  "/results": "Results",
  "/history": "History",
};

function TopHeader({ theme, toggleTheme }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageTitle = ROUTE_LABELS[currentPath] || "Overview";

  return (
    <header 
      className="flex h-14 w-full items-center justify-between border-b transition-colors"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
        paddingLeft: "30px",  
        paddingRight: "30px" 
      }}
    >
      {/* Left Section: Dynamic Breadcrumb */}
      <div 
        className="flex items-center gap-2 text-xs font-medium"
        style={{ 
          color: "var(--text-muted)",
          marginLeft: "8px" 
        }}
      >
        <span>Workspace</span>
        <span>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {pageTitle}
        </span>
      </div>

      {/* Right Section: Theme Toggle Button */}
      <div 
        className="flex items-center"
        style={{ marginRight: "12px" }} 
      >
        <button
          onClick={toggleTheme}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}

export default TopHeader;