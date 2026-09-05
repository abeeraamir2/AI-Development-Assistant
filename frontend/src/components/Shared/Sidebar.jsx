import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
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
  { to: "/analyzer", label: "Analyzer", icon: FileSearch },
  { to: "/work-items", label: "Work Items", icon: CheckSquare },
  { to: "/team-progress", label: "Team Progress", icon: Users2 },
  { to: "/test-history", label: "Test History", icon: History },
  { to: "/admin/users", label: "Users", icon: ShieldCheck },
  { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldAlert },
];

function Sidebar({ userEmail, userRole, onLogout, onNewAction, isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isQA = isQARole(userRole);
  const isAdmin = isAdminRole(userRole);

  const navItems = isAdmin ? ADMIN_NAV : isQA ? QA_NAV : DEVELOPER_NAV;
  const ctaTo = isAdmin ? "/work-items/create" : isQA ? "/test-generator" : "/analyzer";
  const ctaLabel = isAdmin ? "New Work Item" : isQA ? "New Test" : "New Analysis";

  const displayName =
    localStorage.getItem("userName") ||
    (userEmail ? userEmail.split("@")[0] : isQA ? "QA Engineer" : isAdmin ? "Admin" : "Developer");

  const checkIsActive = (to, end) => {
    if (end || to === "/") {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const handleNavClick = (to) => {
    navigate(to);
    if (onClose) onClose();
  };

  const handleCtaClick = () => {
    if (isAdmin && onNewAction) {
      onNewAction();
    } else if (ctaTo) {
      navigate(ctaTo);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* BRAND LOGO & TITLE + MOBILE CLOSE BUTTON */}
          <div className="brandSection flex items-center justify-between">
            <div
              className="brandHeader cursor-pointer"
              onClick={() => handleNavClick("/")}
            >
              <div className="logoIconBox">
                <Sparkles size={22} strokeWidth={2.2} className="logoIcon" />
              </div>
              <div className="authLogoText">
                <div className="authLogoName">DevAssist</div>
                <div className="authLogoTagline">AI DEVELOPMENT ASSISTANT</div>
              </div>
            </div>

            {/* Close button visible only on mobile/tablet drawer */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                title="Close menu"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            )}
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
                        onClick={() => handleNavClick(to)}
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
            onClick={() => handleNavClick("/settings")}
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
    </>
  );
}

export default Sidebar; 