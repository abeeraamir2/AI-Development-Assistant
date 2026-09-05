import React from "react";
import { Database } from "lucide-react";

export default function DatabaseSchemaSection({ schema = [] }) {

  const tables = Array.isArray(schema)
    ? schema
    : [];

  if (tables.length === 0) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">

      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">

        <Database
          size={16}
          className="text-[var(--accent)]"
        />

        Database Schema Updates

      </div>

      {/* Tables */}
      <div className="space-y-5">

        {tables.map((table, tableIndex) => (

          <div
            key={tableIndex}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden"
          >

            {/* Table Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/50">

              <div className="font-mono text-xs font-bold">

                Table:{" "}

                <span className="text-[var(--accent)]">
                  {table.table_name}
                </span>

              </div>

              {table.src && (
                <span className="text-[var(--text-muted)] text-[10px]">
                  {table.src}
                </span>
              )}

            </div>

            {/* Columns */}
            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs min-w-[360px]">

                <thead>

                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase font-semibold">

                    <th className="py-2.5 px-4">
                      Field
                    </th>

                    <th className="py-2.5 px-4">
                      Type
                    </th>

                    <th className="py-2.5 px-4">
                      Constraints
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[var(--border-color)]">

                  {table.fields?.map((field, fieldIndex) => (

                    <tr
                      key={fieldIndex}
                      className="font-mono"
                    >

                      {/* Field */}
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        {field.name}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 text-emerald-400 font-medium">
                        {field.type}
                      </td>

                      {/* Constraints */}
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {field.constraints}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}