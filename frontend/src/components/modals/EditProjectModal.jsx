// src/components/modals/EditProjectModal.jsx
import React, { useState, useEffect } from "react";
import { X, Folder, Lock, Globe, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
  authToken,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setVisibility(project.visibility || "private");
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setLoading(true);
    try {
      const token =
        authToken ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const projectId = project.id || project._id;
      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          visibility,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update project.");
      }

      const updatedProject = await response.json();
      toast.success(`Project "${updatedProject.name}" updated successfully!`);

      if (onProjectUpdated) {
        onProjectUpdated(updatedProject);
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
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Edit Project
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Update project details and access settings.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Payment Gateway"
              className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Project Description Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project goals..."
              className="w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>

          {/* Visibility Options */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  visibility === "private"
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--text-primary)]"
                    : "border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                <input
                  type="radio"
                  name="edit-visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="sr-only"
                />
                <Lock size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Private</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                    Only you and Admins can view
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  visibility === "public"
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--text-primary)]"
                    : "border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                <input
                  type="radio"
                  name="edit-visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  className="sr-only"
                />
                <Globe size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Public</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                    Visible to team members
                  </p>
                </div>
              </label>
            </div>
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
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[var(--accent)] hover:opacity-90 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
