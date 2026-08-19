import React from "react";

export const MultiSelectBadges = ({ options, selected, onChange }) => {
  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      if (selected.length === 1) return; // Prevent deselecting all
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
              isSelected
                ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export default MultiSelectBadges;