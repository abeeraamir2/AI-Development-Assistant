import React from "react";
import { Shield, Code2, Bug, Briefcase, Edit2, Trash2 } from "lucide-react";

export default function UserTableRow({
  user,
  onEdit,
  onDelete,
}) {
  const renderRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-200">
            <Shield size={12} className="text-[#4d8bf8]" />
            <span>Admin</span>
          </span>
        );
      case "Developer":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-200">
            <Code2 size={12} className="text-emerald-400" />
            <span>Developer</span>
          </span>
        );
      case "QA Engineer":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-200">
            <Bug size={12} className="text-amber-400" />
            <span>QA Engineer</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800/80 border border-zinc-700 text-zinc-200">
            <Briefcase size={12} className="text-purple-400" />
            <span>{role}</span>
          </span>
        );
    }
  };

  return (
    <tr className="hover:bg-[var(--bg-subtle)]/40 transition-colors group">
      <td className="py-3.5 pl-6 pr-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
          {user.name ? user.name.charAt(0) : "U"}
        </div>
        <span className="font-bold text-[var(--text-primary)]">{user.name}</span>
      </td>

      <td className="py-3.5 px-3 text-[var(--text-secondary)] font-mono text-[11px]">
        {user.email}
      </td>

      <td className="py-3.5 px-3">{renderRoleBadge(user.role)}</td>

      <td className="py-3.5 px-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            user.status === "Active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-zinc-800 text-zinc-400 border-zinc-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.status === "Active" ? "bg-emerald-400" : "bg-zinc-500"
            }`}
          />
          <span>{user.status}</span>
        </span>
      </td>

      <td className="py-3.5 px-3 text-[var(--text-muted)] text-[11px]">
        {user.joined}
      </td>

      <td className="py-3.5 pr-6 pl-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#4d8bf8] hover:bg-[#4d8bf8]/10 transition-colors cursor-pointer"
            title="Edit User"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(user.id, user.name)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete User"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}