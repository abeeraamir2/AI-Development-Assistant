// src/components/Projects/ProjectAccessGate.jsx
import React, { useEffect } from "react";
import {
  Lock,
  User,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  RotateCcw,
  ArrowRight,
  FolderLock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useProjectAccess } from "../../context/ProjectAccessContext";

export default function ProjectAccessGate({
  project,
  userEmail,
  userRole,
  onOpenProject,
}) {
  const {
    getProjectAccessStatus,
    checkProjectAccess,
    requestAccess,
    requestAgain,
  } = useProjectAccess();

  const projectId = project?.id || project?._id;

  // Query live status from backend on mount or when project changes
  useEffect(() => {
    if (projectId) {
      checkProjectAccess(projectId);
    }
  }, [projectId, checkProjectAccess]);

  const accessStatus = getProjectAccessStatus(project, userEmail, userRole);

  const projectName = project?.name || "E-Commerce Platform";
  const projectDescription =
    project?.description ||
    "An enterprise multi-vendor e-commerce platform with automated requirement tracing and full-stack sprint workflows.";
  const ownerName = project?.owner_name || "Abeera Amir";
  const ownerRole = "Project Owner";

  const handleRequest = () => {
    requestAccess(project);
  };

  const handleRequestAgain = () => {
    requestAgain(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto my-8 p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-lg space-y-8 text-center"
    >
      {/* Top Lock Badge */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-xs">
          <FolderLock size={28} strokeWidth={2.2} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Lock size={12} />
          <span>Private Project</span>
        </div>
      </div>

      {/* Project Title & Description */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          {projectName}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {projectDescription}
        </p>
      </div>

      {/* Project Owner Snapshot Card */}
      <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/60 max-w-md mx-auto flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-slate-800 text-indigo-200 border border-indigo-500/30 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            {ownerName[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-black text-[var(--text-primary)]">
              {ownerName}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Created this initiative
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#4d8bf8]/10 text-[#4d8bf8] border border-[#4d8bf8]/20">
          <Shield size={11} />
          <span>{ownerRole}</span>
        </span>
      </div>

      {/* Dynamic State Feedback & Actions */}
      <div className="max-w-md mx-auto space-y-4 pt-2">
        {/* ============================================================ */}
        {/* STATE A: NOT REQUESTED                                       */}
        {/* ============================================================ */}
        {accessStatus === "NOT_REQUESTED" && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              This initiative is restricted to approved members. Submit a request to the project owner to access work items and specifications.
            </p>

            <button
              type="button"
              onClick={handleRequest}
              className="w-full py-3 px-6 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={16} strokeWidth={2.5} />
              <span>Request to Join</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE B: PENDING                                             */}
        {/* ============================================================ */}
        {accessStatus === "PENDING" && (
          <div className="space-y-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
              <Clock size={15} />
              <span>Request Pending</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your request has been sent to the project owner. You'll be notified when they respond.
            </p>

            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold cursor-not-allowed opacity-80"
            >
              Pending Approval
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE C: REJECTED                                            */}
        {/* ============================================================ */}
        {accessStatus === "REJECTED" && (
          <div className="space-y-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
              <XCircle size={15} />
              <span>Request Rejected</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your previous request to join this project was rejected by the project owner. You may request access again if you need to contribute.
            </p>

            <button
              type="button"
              onClick={handleRequestAgain}
              className="w-full py-3 px-6 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} strokeWidth={2.5} />
              <span>Request Again</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE D: APPROVED                                            */}
        {/* ============================================================ */}
        {accessStatus === "APPROVED" && (
          <div className="space-y-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              <span>You're a member of this project</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your join request was approved by the project owner. You now have full access to this project.
            </p>

            <button
              type="button"
              onClick={onOpenProject}
              className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Open Project</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
