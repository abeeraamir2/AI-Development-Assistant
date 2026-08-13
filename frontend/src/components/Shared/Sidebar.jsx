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
import DevAssistLogo from "../../assets/DevAssistLogo.png";
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

    // Fix: Declare displayName safely inside the component scope
    const displayName = userEmail ? userEmail.split("@")[0] : "Abeera";

    return (
        <aside className="sidebar">
            <div>
                {/* BRAND (Logo, Title & Tagline) */}
                <div className="brandSection">
                    <div className="brandHeader">
                        <img
                            src={DevAssistLogo}
                            alt="DevAssist"
                            className="h-8 w-8 shrink-0 object-contain"
                        />
                        <div className="authLogoText">
                            <div className="authLogoName">
                                DevAssist
                            </div>
                        </div>
                    </div>
                    <div className="authLogoTagline">
                        AI Development Assistant
                    </div>
                </div>

                {/* NEW ANALYSIS / NEW TEST CTA BUTTON */}
                <NavLink to={ctaTo} className="block">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="newTestBtn"
                    >
                        <Plus size={15} />
                        {ctaLabel}
                    </motion.button>
                </NavLink>

                {/* WORKSPACE NAVIGATION */}
                <div className="workspaceGroup">
                    <span className="sectionLabel">
                        Workspace
                    </span>

                    <nav>
                        <ul className="navList">
                            {navItems.map(({ to, label, icon: Icon, end }) => (
                                <li key={to}>
                                    <NavLink
                                        to={to}
                                        end={end}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "navItemActive"
                                                : "navItem"
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

            {/* FOOTER SECTION (SETTINGS & USER PROFILE WITH LOGOUT) */}
            <div className="sidebarFooter">
                <button type="button" className="navItem w-full">
                    <Settings size={16} />
                    <span>Settings</span>
                </button>

                <div className="navItem flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]">
                            <User size={13} />
                        </div>
                        <span className="truncate font-medium capitalize">
                            {displayName}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        title="Log out"
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;