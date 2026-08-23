// src/components/modals/DeleteWorkItemModal.jsx
import React from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteWorkItemModal({
  isOpen,
  onClose,
  onConfirmDelete,
  item,
  childCount = 0,
}) {
  if (!isOpen || !item) return null;

  const hasChildren = childCount > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  hasChildren
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-rose-500/10 text-rose-500"
                }`}
              >
                {hasChildren ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {hasChildren ? "Deletion Blocked" : "Delete Work Item"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {item.id} — {item.title}
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

          {/* Modal Body */}
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-3">
            {hasChildren ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 space-y-1.5">
                <p className="font-bold">
                  Cannot delete work item with active child tasks.
                </p>
                <p className="text-[11px]">
                  This work item has <strong>{childCount} child work item(s)</strong> attached to it. Please reassign or delete the child work items first before deleting the parent.
                </p>
              </div>
            ) : (
              <p>
                Are you sure you want to delete <strong className="text-[var(--text-primary)]">{item.id} {item.title}</strong>? This action will permanently remove it from the workspace.
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
            >
              {hasChildren ? "Dismiss" : "Cancel"}
            </button>

            {!hasChildren && (
              <button
                type="button"
                onClick={onConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Work Item</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
