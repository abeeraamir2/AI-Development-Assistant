import React, { useState, useEffect } from "react";
import { X, Loader2, UserCheck, Key } from "lucide-react";

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [status, setStatus] = useState("Active");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "Developer");
      setStatus(user.status || "Active");
      setPassword("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
        status,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      await onUserUpdated(user.id, payload);
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Edit User Details
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Update account info, role, or access status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all placeholder-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.mercer@devassist.io"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all placeholder-[var(--text-muted)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Developer">Developer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Product Owner">Product Owner</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
              <span>Reset Password (optional)</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">
                Leave blank to keep current
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password to reset"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:border-[#4d8bf8] focus:outline-none transition-all placeholder-[var(--text-muted)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name || !email}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] text-white font-bold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
