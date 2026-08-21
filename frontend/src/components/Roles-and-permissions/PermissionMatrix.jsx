import React from "react";
import { SlidersHorizontal, Folder, FileText, Activity, Users, Check, ShieldCheck, Loader2 } from "lucide-react";

const MODULE_ICONS = {
    Projects: Folder,
    Requirements: FileText,
    "Sprint Intelligence": Activity,
    "Test Suites": Activity,
    "Bug Diagnostician": Activity,
    "User Management": Users,
};

export default function PermissionMatrix({
    selectedRole,
    permissions,
    onPermissionToggle,
    onSave,
    onReset,
    isSaving,
}) {
    const isAdmin = selectedRole?.name === "Admin";
    const actions = ["view", "create", "edit", "delete"];

    return (
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden space-y-4 p-6">
        {/* Header with active editing indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#4d8bf8]">
                <SlidersHorizontal size={16} />
            </div>
            <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Permission Matrix Overview
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {isAdmin
                    ? "Full system privileges are enabled by default for Administrators."
                    : "Granular CRUD control for each functional module."}
                </p>
            </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">
                {isAdmin ? "Viewing:" : "Editing:"}
            </span>
            <span className="font-bold text-[#4d8bf8]">{selectedRole?.name} Role</span>
            {isAdmin && (
                <span className="ml-1 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                System
                </span>
            )}
            </div>
        </div>

        {/* Grid Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/70 dark:border-zinc-800 text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                <tr>
                <th className="py-3 px-5">Module / Category</th>
                <th className="py-3 px-4 text-center">View</th>
                <th className="py-3 px-4 text-center">Create</th>
                <th className="py-3 px-4 text-center">Edit</th>
                <th className="py-3 px-4 text-center">Delete</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {Object.entries(permissions).map(([moduleName, perms]) => {
                const Icon = MODULE_ICONS[moduleName] || Folder;
                return (
                    <tr key={moduleName} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-zinc-200">
                        <Icon size={15} className="text-[#4d8bf8]" />
                        <span>{moduleName}</span>
                        </div>
                    </td>

                    {actions.map((action) => {
                        const isChecked = isAdmin ? true : !!perms[action];
                        return (
                        <td key={action} className="py-4 px-4 text-center">
                            <label className={`inline-flex items-center justify-center ${isAdmin ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}>
                            <input
                                type="checkbox"
                                disabled={isAdmin}
                                checked={isChecked}
                                onChange={() => onPermissionToggle(moduleName, action)}
                                className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 peer-checked:bg-[#4d8bf8] peer-checked:border-[#4d8bf8] peer-disabled:opacity-75 flex items-center justify-center transition-all shadow-xs">
                                {isChecked && <Check size={12} strokeWidth={3} className="text-white" />}
                            </div>
                            </label>
                        </td>
                        );
                    })}
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>

        {/* Footer Action Bar */}
        {isAdmin ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#4d8bf8] shrink-0" />
                    <span>The <strong>Admin</strong> role retains unrestricted root access across all modules and cannot be modified.</span>
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer disabled:opacity-50"
                >
                    {isSaving && <Loader2 size={13} className="animate-spin" />}
                    <span>{isSaving ? "Saving..." : "Save Matrix Changes"}</span>
                </button>
            </div>
        )}
        </div>
    );
}