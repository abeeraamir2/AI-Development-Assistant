import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BurndownChartCard({ data = [] }) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Burndown Chart</h2>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-zinc-500 rounded" />
            <span className="text-[var(--text-muted)]">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#4d8bf8] rounded" />
            <span className="text-[var(--text-primary)]">Actual</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} fontSize={11} />
            <YAxis stroke="var(--text-muted)" tickLine={false} fontSize={11} domain={[0, 60]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-color)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "var(--text-primary)",
              }}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#6b7280"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#4d8bf8"
              strokeWidth={3}
              dot={{ fill: "#4d8bf8", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}