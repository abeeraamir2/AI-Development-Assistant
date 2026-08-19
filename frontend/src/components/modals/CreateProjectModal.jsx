import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
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

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
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

      // Notify parent component / update global state
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      // Reset form & close
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[var(--border-color,#27272a)] bg-[#121216] p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base font-semibold text-white">
                Create New Project
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Create a project to organize requirements, analyses, tests and
              development context.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Project Name Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-Commerce Platform"
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-[#18181d] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe your project..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-[#18181d] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Visibility Options */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Visibility <span className="text-rose-500">*</span>
                </label>

                {/* Private Option */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === "private"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="mt-0.5 h-3.5 w-3.5 text-indigo-500 border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0 accent-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-medium text-zinc-200 group-hover:text-white">
                      Private
                    </span>
                    <span className="block text-[11px] text-zinc-400">
                      Only you can access it.
                    </span>
                  </div>
                </label>

                {/* Public Option */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="mt-0.5 h-3.5 w-3.5 text-indigo-500 border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0 accent-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-medium text-zinc-200 group-hover:text-white">
                      Public
                    </span>
                    <span className="block text-[11px] text-zinc-400">
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
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex items-center gap-2 rounded-lg bg-[#b5a7ff] hover:bg-[#a695ff] px-4 py-2 text-xs font-semibold text-[#14141f] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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