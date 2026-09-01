// src/components/Settings/SettingsNavigation.jsx
import React from "react";
import {
  User,
  Shield,
  Bell,
  Palette,
  UserCog,
} from "lucide-react";

export const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal details and role",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and session settings",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and email preferences",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and interface options",
    icon: Palette,
  },
  {
    id: "account",
    label: "Account",
    description: "Session and account management",
    icon: UserCog,
  },
];

export default function SettingsNavigation({ activeSection, onSelectSection }) {
  return (
    <div className="w-full lg:w-64 shrink-0">
      {/* Mobile/Tablet Horizontal Tabs */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 custom-scrollbar">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#4d8bf8] text-white shadow-xs"
                  : "bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#4d8bf8]/50"
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Navigation */}
      <nav className="hidden lg:flex flex-col gap-1.5 sticky top-6 bg-[var(--bg-surface)] p-2.5 rounded-2xl border border-[var(--border-color)] shadow-xs">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          Settings Menu
        </div>

        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[#4d8bf8]/10 text-[#4d8bf8] font-bold shadow-2xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mt-0.5 transition-colors ${
                  isActive
                    ? "bg-[#4d8bf8] text-white shadow-xs"
                    : "bg-[var(--bg-primary)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs leading-tight font-semibold flex items-center justify-between">
                  <span>{section.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4d8bf8]" />
                  )}
                </div>
                <div
                  className={`text-[11px] leading-tight truncate mt-0.5 ${
                    isActive
                      ? "text-[#4d8bf8]/80 font-normal"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {section.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
