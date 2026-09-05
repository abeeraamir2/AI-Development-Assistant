import React from "react";
import UserTableRow from "./UserTableRow";

export default function UserTable({
  users,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[650px]">
        <thead className="border-b border-[var(--border-color)] bg-[var(--bg-subtle)]/50 text-[var(--text-muted)] font-semibold">
          <tr>
            <th className="py-3.5 pl-6 pr-3">User</th>
            <th className="py-3.5 px-3">Email</th>
            <th className="py-3.5 px-3">Role</th>
            <th className="py-3.5 px-3">Status</th>
            <th className="py-3.5 px-3">Joined</th>
            <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[var(--border-color)]">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-zinc-500">
                No users found matching your filters.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}