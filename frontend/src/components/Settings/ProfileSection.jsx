// src/components/Settings/ProfileSection.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Code2,
  Sparkles,
  Camera,
  Check,
  Edit2,
  X,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeRole, isAdminRole, isQARole } from "../../utils/roleUtils";

export default function ProfileSection({ userEmail, userRole, authToken }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/users/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to load profile details.");
      }

      const data = await res.json();
      setProfile(data);
      setFullName(data.name || "");
      setEmail(data.email || "");
      setAvatarUrl(data.avatar || "");
    } catch (err) {
      console.error(err);
      const fallbackEmail = userEmail || localStorage.getItem("userEmail") || "user@devassist.io";
      const fallbackName = localStorage.getItem("userName") || fallbackEmail.split("@")[0].replace(".", " ").toUpperCase();
      setFullName(fallbackName);
      setEmail(fallbackEmail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authToken]);

  const currentRole = normalizeRole(
    profile?.role || userRole || localStorage.getItem("userRole") || "Developer"
  );
  const isAdmin = isAdminRole(currentRole);
  const isQA = isQARole(currentRole);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setAvatarUrl(base64);
      localStorage.setItem("userAvatar", base64);

      // Persist to backend immediately if not in editing mode
      try {
        const token = getToken();
        const res = await fetch("http://localhost:8000/users/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (res.ok) {
          toast.success("Avatar image updated.");
        }
      } catch (err) {
        console.error("Avatar save error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          avatar: avatarUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update profile.");
      }

      const updated = await res.json();
      setProfile(updated);
      localStorage.setItem("userName", updated.name);
      localStorage.setItem("userEmail", updated.email);
      if (updated.access_token) {
        localStorage.setItem("token", updated.access_token);
        localStorage.setItem("authToken", updated.access_token);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.name || "");
    setEmail(profile?.email || "");
    setIsEditing(false);
  };

  // Role Badge Styling
  const renderRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <ShieldCheck size={13} />
          <span>Admin</span>
        </span>
      );
    }
    if (isQA) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Sparkles size={13} />
          <span>QA Engineer</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Code2 size={13} />
        <span>Developer</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-center gap-3">
        <Loader2 size={18} className="animate-spin text-[#4d8bf8]" />
        <span className="text-xs text-[var(--text-muted)] font-medium">
          Loading profile details...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Profile Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your personal details, avatar, and view your system access level.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[#4d8bf8] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
            >
              <X size={13} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-6">
        {/* Avatar & Summary Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[var(--border-color)]/60">
          {/* Avatar Container */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-900 via-slate-800 to-slate-700 text-indigo-100 border-2 border-[var(--border-color)] shadow-md flex items-center justify-center font-black text-2xl overflow-hidden shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Change Avatar Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] text-white shadow-md border-2 border-[var(--bg-surface)] transition-transform group-hover:scale-110 cursor-pointer"
              title="Change Profile Avatar"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {fullName}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {renderRoleBadge()}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {profile?.status || "Active"}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              {email}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] pt-0.5">
              Click the camera icon to upload a personalized profile picture (JPG, PNG under 2MB).
            </p>
          </div>
        </div>

        {/* Profile Fields Form */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <User size={14} />
              </div>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isEditing
                    ? "border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-[#4d8bf8] focus:bg-[var(--bg-surface)] outline-hidden text-[var(--text-primary)] shadow-2xs"
                    : "border-transparent bg-[var(--bg-subtle)]/50 text-[var(--text-primary)] cursor-not-allowed opacity-90"
                }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Email Address
              </label>
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                Account Contact
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Mail size={14} />
              </div>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isEditing
                    ? "border-[var(--border-color)] bg-[var(--bg-subtle)] focus:border-[#4d8bf8] focus:bg-[var(--bg-surface)] outline-hidden text-[var(--text-primary)] shadow-2xs"
                    : "border-transparent bg-[var(--bg-subtle)]/50 text-[var(--text-primary)] cursor-not-allowed opacity-90"
                }`}
              />
            </div>
          </div>

          {/* Assigned System Role (READ-ONLY) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Assigned Role
              </label>
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                Read-Only
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Shield size={14} />
              </div>
              <input
                type="text"
                disabled
                value={currentRole}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-subtle)]/40 text-xs font-bold text-[var(--text-primary)] cursor-not-allowed select-none opacity-85"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 pt-0.5">
              <Info size={11} className="shrink-0" />
              <span>Role permissions are managed centrally by administrators.</span>
            </p>
          </div>

          {/* Account Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Account Status
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                <CheckCircle2 size={14} />
              </div>
              <input
                type="text"
                disabled
                value={profile?.status || "Active & Verified"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-subtle)]/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-not-allowed select-none opacity-85"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] pt-0.5">
              Your account is active with full workspace privileges.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
