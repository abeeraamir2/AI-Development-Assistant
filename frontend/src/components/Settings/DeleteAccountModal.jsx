// src/components/Settings/DeleteAccountModal.jsx
import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirmDelete,
  userEmail,
  authToken,
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const isConfirmed = confirmationText.trim().toUpperCase() === "DELETE";

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/users/me", {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete account.");
      }

      const data = await res.json();
      toast.success(data.message || "Account successfully deleted.");
      onClose();
      if (onConfirmDelete) {
        onConfirmDelete();
      }
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Delete Account
                </h3>
                <p className="text-xs text-rose-500 font-semibold">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/20">
            <p>
              Are you sure you want to permanently delete your DevAssist account for{" "}
              <strong className="text-[var(--text-primary)] font-mono">{userEmail}</strong>?
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--text-muted)] pt-1">
              <li>All personal profile and preference data will be removed.</li>
              <li>Your project team memberships will be cleanly detached.</li>
              <li>Assigned work items will be unassigned to prevent workflow disruption.</li>
              <li>You will be immediately logged out of all active sessions.</li>
            </ul>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Type <span className="font-mono text-rose-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-rose-500 focus:bg-[var(--bg-surface)] outline-hidden text-xs font-mono font-bold text-[var(--text-primary)] transition-all shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              <span>{isDeleting ? "Deleting..." : "Permanently Delete Account"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
