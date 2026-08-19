import React from "react";

export const ToggleSwitch = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default ToggleSwitch;