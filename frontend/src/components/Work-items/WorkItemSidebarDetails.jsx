// src/components/Work-items/WorkItemSidebarDetails.jsx
import React from "react";
import {
  GitFork,
  Paperclip,
  Plus,
  FileText,
  ArrowUpRight,
  Download,
  Eye,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WorkItemSidebarDetails({
  item,
  onAddAttachment,
}) {
  const navigate = useNavigate();

  const handleDownload = (file) => {
    toast.info(`Downloading ${file.name}...`);
  };

  const handleView = (file) => {
    toast.info(`Viewing ${file.name}`);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. DETAILS CARD                                               */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
      >
        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pb-3 border-b border-[var(--border-color)]">
          Details
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Project */}
          {item.projectName && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] font-medium">Project</span>
              <span className="inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                <Folder size={12} className="text-[#4d8bf8]" />
                <span className="truncate max-w-[140px]">{item.projectName}</span>
              </span>
            </div>
          )}

          {/* Assignee */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">Assignee</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                {item.assignedTo?.initial || item.assignedTo?.name?.charAt(0) || "U"}
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                {item.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </div>

          {/* Reporter */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">Reporter</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[#6366f1] flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                {item.reporter?.initial || item.reporter?.name?.charAt(0) || "R"}
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                {item.reporter?.name || "DevAssist Team"}
              </span>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">Created</span>
            <span className="font-bold text-[var(--text-primary)] font-mono text-[11px]">
              {item.createdDate || "Recently"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PARENT WORK ITEM CARD                                      */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-3.5"
      >
        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pb-3 border-b border-[var(--border-color)]">
          <GitFork size={13} className="text-[#4d8bf8]" />
          <span>Parent Work Item</span>
        </div>

        {item.parent?.id ? (
          <div
            onClick={() => {
              const targetId = item.parent.id.replace(/^#/, "");
              navigate(`/work-items/${targetId}`);
            }}
            className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[#4d8bf8]/50 hover:bg-[var(--bg-subtle)]/60 transition-all cursor-pointer group shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#4d8bf8] group-hover:underline">
                {item.parent.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25">
                {item.parent.status || "In Progress"}
              </span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#4d8bf8] transition-colors flex items-center justify-between">
                <span>{item.parent.title}</span>
                <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 text-[#4d8bf8] transition-opacity" />
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                {item.parent.category || "Backend Infrastructure"}
              </p>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]/60">
              This work item is part of the parent work item above.
            </p>
          </div>
        ) : (
          <div className="py-4 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
            <p className="text-xs text-[var(--text-muted)] font-medium">
              No parent work item assigned.
            </p>
          </div>
        )}
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ATTACHMENTS CARD                                           */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-3.5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <Paperclip size={13} className="text-[#4d8bf8]" />
            <span>Attachments</span>
          </div>

          <button
            type="button"
            onClick={onAddAttachment}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[#4d8bf8] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            title="Add attachment"
          >
            <Plus size={14} />
          </button>
        </div>

        {item.attachments && item.attachments.length > 0 ? (
          <div className="space-y-2.5">
            {item.attachments.map((file, idx) => (
              <div
                key={file.name || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[#4d8bf8]/40 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8] shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {file.size} • {file.date || "Recently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={() => handleView(file)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#4d8bf8] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    title="View"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#4d8bf8] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
            <p className="text-xs text-[var(--text-muted)] font-medium">
              No attachments added yet.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
