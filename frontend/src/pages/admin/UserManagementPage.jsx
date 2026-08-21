import React, { useState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import UserManagementHeader from "../../components/User-management/UserManagementHeader";
import UserTable from "../../components/User-management/UserTable";
import UserPagination from "../../components/User-management/UserPagination";
import AddUserModal from "../../components/modals/AddUserModal";
import EditUserModal from "../../components/modals/EditUserModal";

const ITEMS_PER_PAGE = 5;

export default function UserManagementPage({ authToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("http://localhost:8000/users", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.detail || "Failed to load users."
        );
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authToken]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === "All Roles" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "All Status" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  // Adjust current page if out of bounds (e.g. after deleting items)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, startIndex]);

  const displayStartIndex = filteredUsers.length > 0 ? startIndex + 1 : 0;
  const displayEndIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  // Create User via POST /users
  const handleUserAdded = async (payload) => {
    const token = getToken();
    const response = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.detail || "Failed to add user.";
      toast.error(msg);
      throw new Error(msg);
    }

    const newUser = await response.json();
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`User "${newUser.name}" added successfully!`);
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  // Update User via PUT /users/{id}
  const handleUserUpdated = async (userId, payload) => {
    const token = getToken();
    const response = await fetch(`http://localhost:8000/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.detail || "Failed to update user.";
      toast.error(msg);
      throw new Error(msg);
    }

    const updatedUser = await response.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );
    toast.success(`User "${updatedUser.name}" updated successfully!`);
  };

  // Delete User via DELETE /users/{id}
  const handleDeleteUser = async (id, name) => {
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to delete user.`);
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(`User "${name}" deleted successfully.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full bg-slate-50/50 dark:bg-zinc-950 space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header & Filter Controls */}
      <UserManagementHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Refined Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <UserTable
          users={paginatedUsers}
          onEditUser={handleOpenEdit}
          onDeleteUser={handleDeleteUser}
        />

        <UserPagination
          totalCount={filteredUsers.length}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={displayStartIndex}
          endIndex={displayEndIndex}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}