import React from "react";
import { Sun, Moon } from "lucide-react";

function TopHeader({ theme, toggleTheme }) {
  return (
    <header 
      className="flex h-14 w-full items-center justify-between border-b transition-colors"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
        paddingLeft: "30px",  /* Sidebar se aage right shift karne ke liye */
        paddingRight: "30px" /* Right edge/scrollbar se andar karne ke liye */
      }}
    >
      {/* Left Section: Breadcrumb */}
      <div 
        className="flex items-center gap-2 text-xs font-medium"
        style={{ 
          color: "var(--text-muted)",
          marginLeft: "8px" /* Extra right indent for Workspace / Overview */
        }}
      >
        <span>Workspace</span>
        <span>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Overview
        </span>
      </div>

      {/* Right Section: Moon Icon */}
      <div 
        className="flex items-center"
        style={{ marginRight: "12px" }} /* Icon ko screen ke edge se andar laaye ga */
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