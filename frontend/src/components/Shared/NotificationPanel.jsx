// src/components/Shared/NotificationPanel.jsx
import React, { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useProjectAccess } from "../../context/ProjectAccessContext";
import NotificationItem from "./NotificationItem";

export default function NotificationPanel({ onClose }) {
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    markAllAsRead,
    clearNotification,
    refreshNotifications,
  } = useProjectAccess();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px]"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)]/60 bg-[var(--bg-subtle)]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#4d8bf8]/10 text-[#4d8bf8]">
            <Bell size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black tracking-tight text-[var(--text-primary)]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#4d8bf8] text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[11px] font-bold text-[#4d8bf8] hover:text-[#3b76e8] transition-colors cursor-pointer"
          >
            <CheckCheck size={13} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-[var(--border-color)]/40 flex items-center justify-between gap-2 bg-[var(--bg-surface)]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === "all"
                ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === "unread"
                ? "bg-[var(--bg-subtle)] text-[#4d8bf8]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Sync / Refresh from Backend Button */}
        <button
          type="button"
          onClick={refreshNotifications}
          disabled={loadingNotifications}
          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh notifications from database"
        >
          <RotateCcw size={11} className={loadingNotifications ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="p-2 space-y-1.5 overflow-y-auto max-h-80 custom-scrollbar">
        {loadingNotifications && notifications.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-[#4d8bf8]" />
            <p className="text-[11px] font-medium">Checking for notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-2.5">
            <div className="p-3 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)]">
              <BellOff size={20} className="opacity-50" />
            </div>
            <p className="font-semibold text-[var(--text-primary)]">
              {activeTab === "unread" ? "No unread notifications" : "All caught up!"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-[200px]">
              {activeTab === "unread"
                ? "You have reviewed all incoming notifications."
                : "New project join requests and work item updates will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onDismiss={clearNotification}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 px-4 bg-[var(--bg-subtle)]/50 border-t border-[var(--border-color)]/40 text-[10px] text-[var(--text-muted)] font-medium text-center">
        Project join requests and workflow updates
      </div>
    </motion.div>
  );
}
