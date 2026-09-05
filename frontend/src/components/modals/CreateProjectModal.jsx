import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  authToken,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    // Resolve token from prop or local storage fallback
    const token =
      authToken ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          visibility,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create project");
      }

      const newProject = await response.json();
      toast.success("Project created successfully");

      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      setName("");
      setDescription("");
      setVisibility("private");
      onClose();
    } catch (err) {
      toast.error(err.message || "An error occurred while creating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with theme-aware blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-2xl z-10 text-[var(--text-primary)] transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Create New Project
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              Create a project to organize requirements, analyses, tests and
              development context.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-Commerce Platform"
                  required
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#4d8bf8] focus:outline-none focus:ring-1 focus:ring-[#4d8bf8] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe your project..."
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#4d8bf8] focus:outline-none focus:ring-1 focus:ring-[#4d8bf8] transition-colors resize-none"
                />
              </div>

              {/* Visibility Options */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Visibility <span className="text-rose-500">*</span>
                </label>

                {/* Private Option */}
                <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === "private"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="mt-0.5 h-3.5 w-3.5 text-[#4d8bf8] border-[var(--border-color)] bg-[var(--bg-subtle)] accent-[#4d8bf8] cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-medium text-[var(--text-primary)]">
                      Private
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      Only you can access it.
                    </span>
                  </div>
                </label>

                {/* Public Option */}
                <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="mt-0.5 h-3.5 w-3.5 text-[#4d8bf8] border-[var(--border-color)] bg-[var(--bg-subtle)] accent-[#4d8bf8] cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-medium text-[var(--text-primary)]">
                      Public
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      Anyone with access can view it.
                    </span>
                  </div>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}