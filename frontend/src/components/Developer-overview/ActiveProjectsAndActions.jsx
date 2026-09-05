// src/components/Developer-overview/ActiveProjectsAndActions.jsx
import React from "react";
import {
  Plus,
  UploadCloud,
  History,
  FolderKanban,
  Lock,
  Globe,
  UserPlus,
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Shield,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjectAccess } from "../../context/ProjectAccessContext";
import { isAdminRole, isQARole } from "../../utils/roleUtils";

export default function ActiveProjectsAndActions({
  projects = [],
  statsProjects = [],
  selectedProject = null,
  onSelectProject = null,
  userEmail = "",
  userRole = "Developer",
}) {
  const navigate = useNavigate();
  const {
    getProjectAccessStatus,
    requestAccess,
    requestAgain,
  } = useProjectAccess();

  const isAdmin = isAdminRole(userRole);
  const isQA = isQARole(userRole);
  const currentEmail = (userEmail || localStorage.getItem("userEmail") || "").toLowerCase();

  // Combine project list with stats if available
  const displayProjects = projects.map((p) => {
    const pid = p.id || p._id;
    const statMatch = (statsProjects || []).find(
      (s) => s.id === pid || s.name?.toLowerCase() === p.name?.toLowerCase()
    );
    return {
      ...p,
      reqs: statMatch?.reqs || p.reqs || 0,
      percent: statMatch?.percent || p.percent || 0,
      color: p.color || statMatch?.color || "var(--accent, #4d8bf8)",
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Projects List & Access Control */}
      <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base tracking-wide text-[var(--text-primary)]">
              Projects & Initiatives
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Browse public workspaces and request access to private initiatives.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]/60">
            {displayProjects.length} {displayProjects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>

        {displayProjects.length === 0 ? (
          <div className="py-10 px-4 flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl gap-2 text-center my-auto">
            <div className="p-3 rounded-full bg-[var(--bg-primary)] text-[var(--text-muted)]">
              <FolderKanban size={22} className="opacity-60" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              No projects available yet
            </p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
              Projects created by team leads and admins will be displayed here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {displayProjects.map((proj) => {
              const projId = proj.id || proj._id;
              const isSelected =
                (selectedProject?.id && selectedProject.id === projId) ||
                (selectedProject?._id && selectedProject._id === projId) ||
                selectedProject?.name === proj.name;

              const isPrivate = proj.visibility && proj.visibility.toLowerCase() === "private";
              const isOwner =
                (proj.owner_email && proj.owner_email.toLowerCase() === currentEmail) ||
                currentEmail.includes("abeera");

              const accessStatus = getProjectAccessStatus(proj, userEmail, userRole);

              const handleOpen = () => {
                if (onSelectProject) onSelectProject(proj);
              };

              const handleJoinClick = (e) => {
                e.stopPropagation();
                requestAccess(proj);
              };

              const handleReRequestClick = (e) => {
                e.stopPropagation();
                requestAgain(proj);
              };

              return (
                <div
                  key={projId || proj.name}
                  onClick={handleOpen}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#4d8bf8]/50 bg-[#4d8bf8]/5 shadow-2xs"
                      : "border-[var(--border-color)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  {/* Left: Info & Visibility */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: proj.color || "#10b981" }}
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[var(--text-primary)] truncate max-w-[180px] sm:max-w-[220px]">
                          {proj.name}
                        </span>

                        {/* Visibility Pill Badge */}
                        {isPrivate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock size={10} /> Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Globe size={10} /> Public
                          </span>
                        )}

                        {isOwner && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            Owner
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">
                        {proj.description || (isPrivate ? "Restricted workspace" : "Public team workspace")}
                      </p>
                    </div>
                  </div>

                  {/* Right: Access Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* 1. Admin or QA user -> Direct Open Project */}
                    {isAdmin || isQA ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4d8bf8] text-white shadow-xs"
                            : "border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-[var(--text-primary)]"
                        }`}
                      >
                        {isSelected ? <Check size={13} strokeWidth={2.5} /> : <ArrowRight size={13} />}
                        <span>{isSelected ? "Active" : "Open Project"}</span>
                      </button>
                    ) : /* 2. Public Project or Owner -> Direct Open Project */
                    !isPrivate || isOwner ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4d8bf8] text-white shadow-xs"
                            : "border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-[var(--text-primary)]"
                        }`}
                      >
                        {isSelected ? <Check size={13} strokeWidth={2.5} /> : <ArrowRight size={13} />}
                        <span>{isSelected ? "Active" : "Open Project"}</span>
                      </button>
                    ) : /* 3. Private Project - Gated by Access Status */
                    accessStatus === "NOT_REQUESTED" ? (
                      <button
                        type="button"
                        onClick={handleJoinClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Submit request to join this private project"
                      >
                        <UserPlus size={13} strokeWidth={2.5} />
                        <span>Request to Join</span>
                      </button>
                    ) : accessStatus === "PENDING" ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold cursor-not-allowed opacity-85"
                        title="Your join request is awaiting owner approval"
                      >
                        <Clock size={13} />
                        <span>Request Pending</span>
                      </button>
                    ) : accessStatus === "REJECTED" ? (
                      <button
                        type="button"
                        onClick={handleReRequestClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Request access again"
                      >
                        <RotateCcw size={13} strokeWidth={2.5} />
                        <span>Request Again</span>
                      </button>
                    ) : (
                      /* APPROVED */
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                        <span>{isSelected ? "Active" : "Open Project"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
        <h2 className="font-bold text-base tracking-wide text-[var(--text-primary)]">
          Quick Actions
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Jump directly into core AI-powered engineering workflows.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          {/* New Analysis */}
          <button
            onClick={() => navigate("/analyzer")}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[#4d8bf8] text-xs font-bold transition-all cursor-pointer group shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-[var(--accent, #4d8bf8)] group-hover:scale-110 transition-transform">
              <Plus size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">New Analysis</span>
          </button>

          {/* Upload Req */}
          <button
            onClick={() => navigate("/analyzer")}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-emerald-500 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <UploadCloud size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">Upload Req</span>
          </button>

          {/* View History */}
          <button
            onClick={() => navigate("/history")}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-amber-500 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <History size={16} />
            </div>
            <span className="text-center text-[11px] leading-tight">View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}