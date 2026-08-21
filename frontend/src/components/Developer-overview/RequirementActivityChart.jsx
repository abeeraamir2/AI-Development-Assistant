// src/components/Developer-overview/RequirementActivityChart.jsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";

export default function RequirementActivityChart({ data = [] }) {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((item) => (item.runs || 0) > 0);

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4 flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base tracking-wide">Requirement Activity</h2>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>Analyses run</span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 w-full flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl gap-2 p-4 text-center">
          <div className="p-2.5 rounded-full bg-[var(--bg-primary)] text-[var(--text-muted)]">
            <Activity size={20} className="opacity-60" />
          </div>
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            No requirement activity yet
          </p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-xs">
            Analyses performed for this project will track here across time.
          </p>
        </div>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-2 shadow-md text-xs font-bold">
                        {payload[0].value} Analyses
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="runs"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{ r: 4, fill: "#a78bfa", strokeWidth: 2, stroke: "#1e1b4b" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}