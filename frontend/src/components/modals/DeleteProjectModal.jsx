// src/components/modals/DeleteProjectModal.jsx
import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteProjectModal({
  isOpen,
  onClose,
  project,
  onProjectDeleted,
  authToken,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token =
        authToken ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const projectId = project.id || project._id;
      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete project.");
      }

      toast.success(`Project "${project.name}" deleted successfully!`);

      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }

      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Delete Project
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to delete the project{" "}
            <span className="font-bold text-[var(--text-primary)]">
              "{project.name}"
            </span>
            ? All associated requirements analyses, team memberships, and test data will be permanently removed.
          </p>

          <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <p className="text-[11px] font-medium text-rose-400 leading-tight">
              ⚠️ Warning: This operation is irreversible and will remove all sprint intelligence tied to this project.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
