// src/components/Settings/NotificationsSection.jsx
import React, { useState, useEffect } from "react";
import {
  Bell as BellIcon,
  UserPlus as UserPlusIcon,
  CheckSquare as CheckSquareIcon,
  Activity as ActivityIcon,
  Check as CheckIcon,
  Loader2 as Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PREFERENCES = {
  joinRequests: true,
  workItemAssignments: true,
  statusUpdates: true,
};

export default function NotificationsSection({ authToken }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/users/me/notification-preferences", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to load notification preferences.");
      }

      const data = await res.json();
      setPreferences({ ...DEFAULT_PREFERENCES, ...data });
    } catch (err) {
      console.error(err);
      try {
        const saved = localStorage.getItem("devassist_notification_preferences");
        if (saved) setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [authToken]);

  const handleToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setSavingKey(key);

    try {
      localStorage.setItem("devassist_notification_preferences", JSON.stringify(updated));
      const token = getToken();
      const res = await fetch("http://localhost:8000/users/me/notification-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to persist preference.");
      }

      const savedData = await res.json();
      setPreferences(savedData);
      toast.success("Notification preferences updated.");
    } catch (err) {
      toast.error(err.message);
      // Rollback on failure
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    } finally {
      setSavingKey(null);
    }
  };

  const notificationOptions = [
    {
      id: "joinRequests",
      title: "Project Join Requests",
      description: "Receive notifications when someone requests access to your private project.",
      icon: UserPlusIcon,
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "workItemAssignments",
      title: "Work Item Assignments",
      description: "Receive notifications when a work item is assigned to you.",
      icon: CheckSquareIcon,
      iconColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      id: "statusUpdates",
      title: "Work Item Status Updates",
      description: "Receive notifications when work items you're involved with change status.",
      icon: ActivityIcon,
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-center gap-3">
        <Loader2Icon size={18} className="animate-spin text-[#4d8bf8]" />
        <span className="text-xs text-[var(--text-muted)] font-medium">
          Loading notification preferences...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="border-b border-[var(--border-color)] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Notification Preferences
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Customize which events trigger in-app alerts and notifications.
        </p>
      </div>

      {/* Main Preferences Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4 divide-y divide-[var(--border-color)]/60">
        <div className="flex items-center gap-3 pb-4">
          <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
            <BellIcon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Activity & Workflow Alerts
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Toggle specific event types you want to be notified about.
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="pt-2 space-y-3">
          {notificationOptions.map((opt) => {
            const Icon = opt.icon;
            const isEnabled = !!preferences[opt.id];
            const isToggling = savingKey === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => !isToggling && handleToggle(opt.id)}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-subtle)] transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${opt.iconColor}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                      {opt.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>

                {/* Modern Switch Toggle */}
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 cursor-pointer ${
                    isEnabled ? "bg-[#4d8bf8]" : "bg-slate-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center text-[9px] ${
                      isEnabled ? "translate-x-5 text-[#4d8bf8]" : "translate-x-0"
                    }`}
                  >
                    {isToggling ? (
                      <Loader2Icon size={9} className="animate-spin text-slate-500" />
                    ) : isEnabled ? (
                      <CheckIcon size={10} strokeWidth={3} />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
