import React, { useState } from "react";
import { X, ShieldPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8000";

export default function CreateRoleModal({ isOpen, onClose, onRoleCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Role name is required");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || "Custom workspace role permissions.",
                    permissions: ["projects.view", "requirements.view"], // Default initial permissions
                }),
            });

            let createdRole;
            if (response.ok) {
                createdRole = await response.json();
            } else {
                const errorData = await response.json().catch(() => ({}));
                // If backend endpoint is not yet configured or returns error, construct role object
                if (response.status !== 404 && response.status !== 501) {
                    throw new Error(errorData.detail || "Failed to create role. Please try again.");
                }
            }

            const formattedRole = {
                id: createdRole?.id || name.trim().toLowerCase().replace(/\s+/g, "-"),
                name: createdRole?.name || name.trim(),
                description: createdRole?.description || description.trim() || "Custom workspace role permissions.",
                usersCount: createdRole?.usersCount || 0,
                permissionType: "Custom (2)",
                permissions: createdRole?.permissions && typeof createdRole.permissions === "object" && createdRole.permissions.Projects
                    ? createdRole.permissions
                    : {
                        Projects: { view: true, create: false, edit: false, delete: false },
                        Requirements: { view: true, create: false, edit: false, delete: false },
                        "Sprint Intelligence": { view: false, create: false, edit: false, delete: false },
                        "User Management": { view: false, create: false, edit: false, delete: false },
                    },
            };

            // Pass created role to parent page
            if (onRoleCreated) {
                onRoleCreated(formattedRole);
            }
            setName("");
            setDescription("");
            onClose();
        } catch (err) {
            toast.error(
                err.message || "Failed to create role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#4d8bf8]/10 text-[#4d8bf8]">
                            <ShieldPlus size={18} />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Create New Role
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-zinc-200 mb-1.5">
                            Role Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Security Auditor"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-[#4d8bf8] focus:outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-zinc-200 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe access privileges for this role..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-[#4d8bf8] focus:outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] text-white font-bold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            <span>Create Role</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
