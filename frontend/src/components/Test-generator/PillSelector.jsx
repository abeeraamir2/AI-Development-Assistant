import React from "react";

export const PillSelector = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg">
    {options.map((opt) => {
      const isSelected = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            isSelected
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export default PillSelector;