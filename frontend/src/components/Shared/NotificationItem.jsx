// src/components/Shared/NotificationItem.jsx
import React from "react";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Sparkles,
  Clock,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useProjectAccess } from "../../context/ProjectAccessContext";

export default function NotificationItem({ notification, onDismiss }) {
  const { approveJoinRequest, rejectJoinRequest, markAsRead } = useProjectAccess();

  const isJoinRequest = notification.type === "join_request";
  const isApproved = notification.status === "approved";
  const isRejected = notification.status === "rejected";
  const isPending = isJoinRequest && notification.status === "pending";

  const handleApprove = (e) => {
    e.stopPropagation();
    approveJoinRequest(notification.join_request_id || notification.id);
  };

  const handleReject = (e) => {
    e.stopPropagation();
    rejectJoinRequest(notification.join_request_id || notification.id);
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Render type-specific icon
  const renderIcon = () => {
    if (isJoinRequest) {
      if (isApproved) {
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} />
          </div>
        );
      }
      if (isRejected) {
        return (
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
            <XCircle size={15} />
          </div>
        );
      }
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#4d8bf8] border border-blue-500/20 flex items-center justify-center shrink-0">
          <UserPlus size={15} />
        </div>
      );
    }

    if (notification.type === "work_item") {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-[#818cf8] border border-indigo-500/20 flex items-center justify-center shrink-0">
          <CheckSquare size={15} />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Sparkles size={15} />
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
        notification.read
          ? "border-transparent bg-transparent hover:bg-[var(--bg-subtle)] opacity-85 hover:opacity-100"
          : "border-[var(--border-color)] bg-[var(--bg-subtle)]/70 hover:bg-[var(--bg-subtle)] shadow-2xs"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        {renderIcon()}

        {/* Text Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
              {notification.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                <Clock size={10} />
                {notification.createdAt || "Recently"}
              </span>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-[#4d8bf8] shrink-0" title="Unread" />
              )}
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {notification.message}
          </p>

          {/* Action Buttons for Pending Join Requests */}
          {isPending && (
            <div className="flex items-center gap-2 pt-2.5">
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 text-xs font-bold transition-all cursor-pointer"
              >
                <X size={13} strokeWidth={2.5} />
                <span>Reject</span>
              </button>
            </div>
          )}

          {/* Inline Approved / Rejected Confirmation Tag */}
          {isApproved && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Check size={11} strokeWidth={2.5} /> Approved & Added as Member
              </span>
            </div>
          )}

          {isRejected && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                <X size={11} strokeWidth={2.5} /> Request Rejected
              </span>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-500 transition-all rounded-md cursor-pointer"
            title="Dismiss notification"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
