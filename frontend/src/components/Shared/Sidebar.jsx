import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CheckSquare,
  FileSearch,
  History,
  Sparkles,
  Bug,
  Plus,
  Settings,
  User,
  LogOut,
  Users2,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { isAdminRole, isQARole } from "../../utils/roleUtils";
import "../../css/Sidebar.css";

const DEVELOPER_NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/work-items", label: "Work Items", icon: CheckSquare },
  { to: "/analyzer", label: "Analyzer", icon: FileSearch },
  { to: "/history", label: "History", icon: History },
];

const QA_NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/work-items", label: "Work Items", icon: CheckSquare },
  { to: "/test-generator", label: "Test Generator", icon: Sparkles },
  { to: "/test-history", label: "Test History", icon: History },
  { to: "/bug-summarizer", label: "Bug Summarizer", icon: Bug },
];

const ADMIN_NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/work-items", label: "Work Items", icon: CheckSquare },
  { to: "/team-progress", label: "Team Progress", icon: Users2 },
  { to: "/admin/ai-insights", label: "AI Insights", icon: BrainCircuit },
  { to: "/admin/users", label: "Users", icon: ShieldCheck },
  { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldAlert },
];

function Sidebar({ userEmail, userRole, onLogout, onNewAction }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isQA = isQARole(userRole);
  const isAdmin = isAdminRole(userRole);

  const navItems = isAdmin ? ADMIN_NAV : isQA ? QA_NAV : DEVELOPER_NAV;
  const ctaTo = isAdmin ? null : isQA ? "/test-generator" : "/analyzer";
  const ctaLabel = isAdmin ? "New Sprint" : isQA ? "New Test" : "New Analysis";

  const displayName =
    localStorage.getItem("userName") ||
    (userEmail ? userEmail.split("@")[0] : isQA ? "QA Engineer" : isAdmin ? "Admin" : "Developer");

  const checkIsActive = (to, end) => {
    if (end || to === "/") {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const handleCtaClick = () => {
    if (isAdmin) {
      if (onNewAction) onNewAction();
    } else if (ctaTo) {
      navigate(ctaTo);
    }
  };

  return (
    <aside className="sidebar">
      <div>
        {/* BRAND LOGO & TITLE */}
        <div
          className="brandSection cursor-pointer"
          onClick={() => navigate("/")}
        >
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
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCtaClick}
          className="newTestBtn w-full"
          type="button"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{ctaLabel}</span>
        </motion.button>

        {/* WORKSPACE NAVIGATION */}
        <div className="workspaceGroup">
          <span className="sectionLabel">Workspace</span>
          <nav>
            <ul className="navList">
              {navItems.map(({ to, label, icon: Icon, end }) => {
                const isActive = checkIsActive(to, end);
                return (
                  <li key={to}>
                    <button
                      type="button"
                      onClick={() => navigate(to)}
                      className={isActive ? "navItemActive" : "navItem"}
                    >
                      <Icon size={16} strokeWidth={2} />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="sidebarFooter">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className={
            location.pathname === "/settings"
              ? "navItemActive"
              : "navItem"
          }
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>

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