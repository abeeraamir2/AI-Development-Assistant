import React from "react";

export default function TeamOverviewTable({ members = [] }) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs">
      <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Team Overview</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold">
              <th className="pb-3">Member</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Points (Done/Assigned)</th>
              <th className="pb-3 w-40">Progress</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/40">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                <td className="py-3.5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[11px] text-[var(--text-primary)]">
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{member.name}</span>
                </td>
                <td className="py-3.5 text-[var(--text-muted)]">{member.role}</td>
                <td className="py-3.5 font-semibold text-[var(--text-primary)]">{member.points}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${member.barColor || "bg-[#4d8bf8]"} rounded-full`}
                        style={{ width: `${member.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] w-8 text-right">
                      {member.progress}%
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-right">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${member.statusColor}`}>
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}