import React from "react";
import { Shield, Code2, Bug, Briefcase, Edit2, Trash2 } from "lucide-react";

export default function RolesSummaryTable({
    roles,
    selectedRoleId,
    onSelectRole,
    onDeleteRole,
}) {
    const getRoleIcon = (name) => {
        switch (name.toLowerCase()) {
        case "admin":
            return <Shield size={14} className="text-[#4d8bf8]" />;
        case "developer":
            return <Code2 size={14} className="text-emerald-500" />;
        case "tester":
        case "qa":
            return <Bug size={14} className="text-amber-500" />;
        default:
            return <Briefcase size={14} className="text-purple-500" />;
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                <th className="py-3.5 px-5">Role Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Users</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 pr-5 pl-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {roles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                    <tr
                    key={role.id}
                    onClick={() => onSelectRole(role.id)}
                    className={`transition-colors cursor-pointer group ${
                        isSelected
                        ? "bg-blue-50/40 dark:bg-blue-950/20"
                        : "hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                    }`}
                    >
                    {/* Role Name */}
                    <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                            {getRoleIcon(role.name)}
                        </div>
                        <span
                            className={`font-bold ${
                            isSelected
                                ? "text-[#4d8bf8]"
                                : "text-slate-900 dark:text-zinc-100"
                            }`}
                        >
                            {role.name}
                        </span>
                        </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-slate-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                        {role.description}
                    </td>

                    {/* Users Count Pill */}
                    <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {role.usersCount}
                        </span>
                    </td>

                    {/* Permissions Type */}
                    <td className="py-4 px-4 font-medium text-slate-600 dark:text-zinc-300">
                        {role.permissionType}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-5 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                        <button
                            type="button"
                            onClick={() => onSelectRole(role.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4d8bf8] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                            title="Configure Matrix"
                        >
                            <Edit2 size={13} />
                        </button>
                        {role.name !== "Admin" && (
                            <button
                            type="button"
                            onClick={() => onDeleteRole(role.id, role.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete Role"
                            >
                            <Trash2 size={13} />
                            </button>
                        )}
                        </div>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
        </div>
    );
}