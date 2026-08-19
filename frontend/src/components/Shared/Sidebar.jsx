import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  FileSearch,
  History,
  Sparkles,
  Bug,
  Plus,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import "../../css/Sidebar.css";

const DEVELOPER_NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/analyzer", label: "Analyzer", icon: FileSearch },
  { to: "/history", label: "History", icon: History },
];

const QA_NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/test-generator", label: "Test Generator", icon: Sparkles },
  { to: "/test-history", label: "Test History", icon: History },
  { to: "/bug-summarizer", label: "Bug Summarizer", icon: Bug },
];

function Sidebar({ userEmail, userRole, onLogout }) {
  const isQA = userRole === "QA";
  const navItems = isQA ? QA_NAV : DEVELOPER_NAV;
  const ctaTo = isQA ? "/test-generator" : "/analyzer";
  const ctaLabel = isQA ? "New Test" : "New Analysis";

  const displayName = userEmail ? userEmail.split("@")[0] : "Developer";

  return (
    <aside className="sidebar">
      <div>
        {/* BRAND LOGO & BOLD LARGE TITLE */}
        <div className="brandSection">
        <div className="brandHeader">
            <div className="logoIconBox">
            <Sparkles size={22} strokeWidth={2.2} className="logoIcon" />
            </div>
            <div className="authLogoText">
            <div className="authLogoName">DevAssist</div>
            <div className="authLogoTagline">AI DEVELOPMENT ASSISTANT</div>
            </div>
        </div>
        </div>

        {/* CTA BUTTON */}
        <NavLink to={ctaTo} className="block no-underline">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="newTestBtn"
            type="button"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{ctaLabel}</span>
          </motion.button>
        </NavLink>

        {/* WORKSPACE NAVIGATION */}
        <div className="workspaceGroup">
          <span className="sectionLabel">Workspace</span>
          <nav>
            <ul className="navList">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      isActive ? "navItemActive" : "navItem"
                    }
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="sidebarFooter">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "navItemActive" : "navItem"
          }
        >
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>

        <div className="navItem flex items-center justify-between w-full">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
              <User size={13} />
            </div>
            <span className="truncate font-medium capitalize text-xs">
              {displayName}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;