// src/components/Settings/AppearanceSection.jsx
import React from "react";
import {
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Palette,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AppearanceSection({ theme, setTheme }) {
  const currentTheme = theme || localStorage.getItem("theme") || "light";

  const handleSelectTheme = (newTheme) => {
    let resolved = newTheme;
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolved = prefersDark ? "dark" : "light";
    }

    if (setTheme) {
      setTheme(newTheme);
    }
    localStorage.setItem("theme", newTheme);

    document.documentElement.setAttribute("data-theme", resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    toast.success(`Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`);
  };

  const themes = [
    {
      id: "system",
      title: "System Preference",
      description: "Automatically match your operating system theme settings.",
      icon: Laptop,
      preview: (
        <div className="w-full h-24 rounded-xl border border-[var(--border-color)] overflow-hidden flex shadow-2xs">
          {/* Half Light */}
          <div className="w-1/2 h-full bg-slate-50 p-2 space-y-1 border-r border-slate-200">
            <div className="w-8 h-2 rounded bg-slate-300" />
            <div className="w-full h-3 rounded bg-white border border-slate-200" />
            <div className="w-3/4 h-2 rounded bg-slate-200" />
          </div>
          {/* Half Dark */}
          <div className="w-1/2 h-full bg-zinc-900 p-2 space-y-1">
            <div className="w-8 h-2 rounded bg-zinc-700" />
            <div className="w-full h-3 rounded bg-zinc-800 border border-zinc-700" />
            <div className="w-3/4 h-2 rounded bg-zinc-700" />
          </div>
        </div>
      ),
    },
    {
      id: "light",
      title: "Light Mode",
      description: "Clean, high-contrast light theme optimized for daytime focus.",
      icon: Sun,
      preview: (
        <div className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 p-2.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-12 h-2.5 rounded bg-slate-300" />
            <div className="w-4 h-2 rounded bg-blue-500" />
          </div>
          <div className="w-full h-8 rounded-lg bg-white border border-slate-200 p-1.5 flex items-center gap-1.5 shadow-2xs">
            <div className="w-4 h-4 rounded bg-blue-500/20" />
            <div className="w-16 h-2 rounded bg-slate-300" />
          </div>
          <div className="w-2/3 h-2 rounded bg-slate-200" />
        </div>
      ),
    },
    {
      id: "dark",
      title: "Dark Mode",
      description: "Sleek dark theme designed to reduce eye strain in low-light environments.",
      icon: Moon,
      preview: (
        <div className="w-full h-24 rounded-xl border border-zinc-800 bg-[#0b0c10] p-2.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-12 h-2.5 rounded bg-zinc-700" />
            <div className="w-4 h-2 rounded bg-blue-500" />
          </div>
          <div className="w-full h-8 rounded-lg bg-[#181924] border border-zinc-700/80 p-1.5 flex items-center gap-1.5 shadow-2xs">
            <div className="w-4 h-4 rounded bg-blue-500/20" />
            <div className="w-16 h-2 rounded bg-zinc-600" />
          </div>
          <div className="w-2/3 h-2 rounded bg-zinc-700" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="border-b border-[var(--border-color)] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Appearance Settings
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Select your preferred interface theme and visual mode.
        </p>
      </div>

      {/* Main Theme Selector Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
            <Palette size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Interface Theme
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Choose how DevAssist looks on your screen.
            </p>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTheme === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectTheme(item.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                  isSelected
                    ? "border-[#4d8bf8] bg-[#4d8bf8]/5 shadow-sm"
                    : "border-[var(--border-color)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-subtle)] hover:border-[var(--border-color)]/80"
                }`}
              >
                {/* Visual Preview */}
                <div className="transition-transform group-hover:scale-[1.02]">
                  {item.preview}
                </div>

                {/* Info & Radio Check */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={15}
                        className={isSelected ? "text-[#4d8bf8]" : "text-[var(--text-secondary)]"}
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {item.title}
                      </span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[#4d8bf8] bg-[#4d8bf8] text-white"
                          : "border-[var(--border-color)] bg-[var(--bg-surface)]"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={12} strokeWidth={2.5} />}
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
