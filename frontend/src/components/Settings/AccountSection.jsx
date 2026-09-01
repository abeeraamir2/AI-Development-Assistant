// src/components/Settings/AccountSection.jsx
import React, { useState } from "react";
import {
  UserCog,
  Shield,
  Calendar,
  LogOut,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";
import { normalizeRole } from "../../utils/roleUtils";

export default function AccountSection({ userEmail, userRole, onLogout, authToken }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const currentRole = normalizeRole(userRole || localStorage.getItem("userRole") || "Developer");
  const storedEmail = userEmail || localStorage.getItem("userEmail") || "abeeraamir87@gmail.com";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="border-b border-[var(--border-color)] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Account Management
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Review your account metadata, active session state, or manage account termination.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]/60">
          <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
            <UserCog size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Account Overview
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              System membership and security status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Account Status</span>
            </div>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              Active
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              In good standing
            </p>
          </div>

          {/* Member Since */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
              <Calendar size={14} className="text-[#4d8bf8]" />
              <span>Member Since</span>
            </div>
            <p className="text-sm font-black text-[var(--text-primary)]">
              August 2026
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              DevAssist Early Access
            </p>
          </div>

          {/* Role */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
              <Shield size={14} className="text-indigo-500" />
              <span>Assigned Role</span>
            </div>
            <p className="text-sm font-black text-[var(--text-primary)]">
              {currentRole}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              System Access Level
            </p>
          </div>
        </div>

        {/* Current Session Logout */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Current Session
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Logged in as <span className="font-mono text-[var(--text-secondary)] font-semibold">{storedEmail}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <LogOut size={13} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border-2 border-rose-500/30 bg-rose-500/5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <AlertTriangle size={18} />
          <h2 className="text-sm font-black tracking-wide uppercase">
            Danger Zone
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              Delete Account
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Deleting your account is permanent and cannot be undone. All your project memberships, sprint assignments, and personal settings will be permanently erased.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Trash2 size={13} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={onLogout}
        userEmail={storedEmail}
        authToken={authToken}
      />
    </div>
  );
}
