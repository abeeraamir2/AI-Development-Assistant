import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import RolesSummaryTable from "../../components/Roles-and-permissions/RolesSummaryTable";
import PermissionMatrix from "../../components/Roles-and-permissions/PermissionMatrix";
import CreateRoleModal from "../../components/modals/CreateRoleModal";

const API_BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Converts backend permission array -> nested matrix object for UI
const permissionArrayToMatrix = (permArray = []) => {
  const permSet = new Set(permArray);
  return {
    Projects: {
      view: permSet.has("projects.view"),
      create: permSet.has("projects.create"),
      edit: permSet.has("projects.update"),
      delete: permSet.has("projects.delete"),
    },
    Requirements: {
      view: permSet.has("requirements.view"),
      create: permSet.has("requirements.analyze"),
      edit: permSet.has("requirements.analyze"),
      delete: false,
    },
    "Test Suites": {
      view: permSet.has("tests.view"),
      create: permSet.has("tests.create"),
      edit: permSet.has("tests.create"),
      delete: false,
    },
    "Bug Diagnostician": {
      view: permSet.has("bugs.view"),
      create: permSet.has("bugs.analyze"),
      edit: false,
      delete: false,
    },
    "User Management": {
      view: permSet.has("users.view"),
      create: permSet.has("users.create"),
      edit: permSet.has("users.update"),
      delete: permSet.has("users.delete"),
    },
  };
};

// Converts nested matrix object -> backend permission array
const matrixToPermissionArray = (matrix = {}) => {
  const result = [];
  if (matrix["Projects"]?.view) result.push("projects.view");
  if (matrix["Projects"]?.create) result.push("projects.create");
  if (matrix["Projects"]?.edit) result.push("projects.update");
  if (matrix["Projects"]?.delete) result.push("projects.delete");

  if (matrix["Requirements"]?.view) result.push("requirements.view");
  if (matrix["Requirements"]?.create || matrix["Requirements"]?.edit) {
    result.push("requirements.analyze");
  }

  if (matrix["Test Suites"]?.view) result.push("tests.view");
  if (matrix["Test Suites"]?.create || matrix["Test Suites"]?.edit) {
    result.push("tests.create");
  }

  if (matrix["Bug Diagnostician"]?.view) result.push("bugs.view");
  if (matrix["Bug Diagnostician"]?.create) result.push("bugs.analyze");

  if (matrix["User Management"]?.view) result.push("users.view");
  if (matrix["User Management"]?.create) result.push("users.create");
  if (matrix["User Management"]?.edit) result.push("users.update");
  if (matrix["User Management"]?.delete) result.push("users.delete");

  return Array.from(new Set(result));
};

// Format backend role doc to frontend table & matrix shape
const formatRoleForFrontend = (roleDoc) => {
  const isAllAccess = roleDoc.name?.toLowerCase() === "admin";
  const matrix = permissionArrayToMatrix(roleDoc.permissions || []);
  return {
    id: roleDoc.id,
    name: roleDoc.name,
    description: roleDoc.description || "",
    usersCount: roleDoc.users_count || 0,
    permissionType: isAllAccess
      ? "All access"
      : `Custom (${(roleDoc.permissions || []).length})`,
    is_custom: roleDoc.is_custom ?? true,
    rawPermissions: roleDoc.permissions || [],
    permissions: matrix,
  };
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activePermissions, setActivePermissions] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);

  // 1. Fetch live roles from Backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to fetch roles from server.");
      }
      const data = await res.json();
      const formatted = (data || []).map(formatRoleForFrontend);
      setRoles(formatted);

      if (formatted.length > 0) {
        setSelectedRoleId((prevSelected) => {
          const matched =
            formatted.find((r) => r.id === prevSelected) || formatted[0];
          setActivePermissions(matched.permissions);
          return matched.id;
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch roles from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const currentRole =
    roles.find((r) => r.id === selectedRoleId) || roles[0] || null;

  const handleSelectRole = (id) => {
    setSelectedRoleId(id);
    const target = roles.find((r) => r.id === id);
    if (target) {
      setActivePermissions(target.permissions);
    }
  };

  const handlePermissionToggle = (moduleName, action) => {
    setActivePermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: !prev[moduleName]?.[action],
      },
    }));
  };

  // 2. Persist Permission Matrix changes via PUT /roles/:id
  const handleSaveMatrix = async () => {
    if (!currentRole) return;
    setSavingMatrix(true);
    try {
      const updatedPermList = matrixToPermissionArray(activePermissions);
      const res = await fetch(`${API_BASE_URL}/roles/${currentRole.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissions: updatedPermList }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.detail || "Failed to update permission matrix."
        );
      }

      const updatedRole = await res.json();
      const formattedUpdated = formatRoleForFrontend(updatedRole);
      setRoles((prev) =>
        prev.map((r) => (r.id === currentRole.id ? formattedUpdated : r))
      );
      setActivePermissions(formattedUpdated.permissions);
      toast.success(`Updated permission matrix for ${currentRole.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to update permission matrix.");
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleResetMatrix = () => {
    if (currentRole) {
      setActivePermissions(currentRole.permissions);
      toast.info("Reverted unsaved matrix changes");
    }
  };

  // 3. Delete custom role via DELETE /roles/:id
  const handleDeleteRole = async (id, name) => {
    const targetRole = roles.find((r) => r.id === id);
    if (targetRole && !targetRole.is_custom) {
      toast.error("Built-in system roles cannot be deleted.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.detail || `Failed to delete role "${name}".`
        );
      }

      setRoles((prev) => prev.filter((r) => r.id !== id));

      if (selectedRoleId === id) {
        const remaining = roles.filter((r) => r.id !== id);
        if (remaining.length > 0) {
          setSelectedRoleId(remaining[0].id);
          setActivePermissions(remaining[0].permissions);
        }
      }
      toast.success(`Role "${name}" removed successfully.`);
    } catch (err) {
      toast.error(err.message || `Failed to delete role "${name}".`);
    }
  };

  // 4. Callback when CreateRoleModal creates a new role
  const handleRoleCreated = (newRoleData) => {
    const formatted = formatRoleForFrontend(newRoleData);
    setRoles((prev) => [...prev, formatted]);
    setSelectedRoleId(formatted.id);
    setActivePermissions(formatted.permissions);
    toast.success(`Role "${formatted.name}" created successfully!`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-slate-50/50 dark:bg-zinc-950 space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage system roles and control access to DevAssist features.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Create Role</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#4d8bf8] animate-spin" />
        </div>
      ) : (
        <>
          {/* Roles Summary Table */}
          <RolesSummaryTable
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectRole={handleSelectRole}
            onDeleteRole={handleDeleteRole}
          />

          {/* Interactive Permission Matrix */}
          {currentRole && activePermissions && (
            <PermissionMatrix
              selectedRole={currentRole}
              permissions={activePermissions}
              onPermissionToggle={handlePermissionToggle}
              onSave={handleSaveMatrix}
              onReset={handleResetMatrix}
              isSaving={savingMatrix}
            />
          )}
        </>
      )}

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoleCreated={handleRoleCreated}
      />
    </div>
  );
}
