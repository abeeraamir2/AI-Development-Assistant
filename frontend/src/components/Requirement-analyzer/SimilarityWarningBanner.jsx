// src/components/requirement-analyzer/SimilarityWarningBanner.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function SimilarityWarningBanner({ similarReq, onView }) {
  if (!similarReq) return null;

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
      <div className="flex items-center gap-2.5 text-amber-500 font-medium">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          <strong className="font-bold">Similar Requirement Detected:</strong> '{similarReq.title}' analyzed {similarReq.timeAgo}.
        </span>
      </div>
      <button
        type="button"
        onClick={onView}
        className="font-bold text-amber-500 hover:underline cursor-pointer"
      >
        View
      </button>
    </div>
  );
}