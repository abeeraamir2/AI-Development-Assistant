// src/components/Settings/SecuritySection.jsx
import React, { useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function SecuritySection({ authToken }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sessionLoggingOut, setSessionLoggingOut] = useState(false);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // Requirements checks
  const isMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!isMinLength) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (!hasLetter || !hasNumber) {
      toast.error("New password must contain at least one letter and one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update password.");
      }

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("authToken", data.access_token);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(data.message || "Password changed successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setSessionLoggingOut(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/auth/revoke-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to revoke sessions.");
      }

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("authToken", data.access_token);
      }

      toast.success(data.message || "Logged out of all other active sessions.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSessionLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="border-b border-[var(--border-color)] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Security Settings
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Manage your account credentials, password requirements, and active sessions.
        </p>
      </div>

      {/* Main Change Password Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]/60">
          <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Change Password
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Ensure your account uses a strong, unique password.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Lock size={14} />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-[#4d8bf8] focus:bg-[var(--bg-surface)] outline-hidden text-xs font-medium text-[var(--text-primary)] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Lock size={14} />
              </div>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-[#4d8bf8] focus:bg-[var(--bg-surface)] outline-hidden text-xs font-medium text-[var(--text-primary)] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Lock size={14} />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-[#4d8bf8] focus:bg-[var(--bg-surface)] outline-hidden text-xs font-medium text-[var(--text-primary)] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Helper Checklist */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]/70 space-y-2">
            <p className="text-[11px] font-bold text-[var(--text-primary)]">
              Password Requirements
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  isMinLength ? "text-emerald-500 font-semibold" : "text-[var(--text-muted)]"
                }`}
              >
                {isMinLength ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasLetter ? "text-emerald-500 font-semibold" : "text-[var(--text-muted)]"
                }`}
              >
                {hasLetter ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>Contains a letter</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? "text-emerald-500 font-semibold" : "text-[var(--text-muted)]"
                }`}
              >
                {hasNumber ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>Contains a number</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  isMatching ? "text-emerald-500 font-semibold" : "text-[var(--text-muted)]"
                }`}
              >
                {isMatching ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? "Updating Password..." : "Change Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Session Security Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Active Sessions
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md">
            Revoke all other active logins across other browsers or devices. You will remain logged into this current session.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogoutOtherSessions}
          disabled={sessionLoggingOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {sessionLoggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
          <span>{sessionLoggingOut ? "Revoking..." : "Log out other sessions"}</span>
        </button>
      </div>
    </div>
  );
}
