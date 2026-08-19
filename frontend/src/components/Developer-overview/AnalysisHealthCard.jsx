// src/components/developer-overview/AnalysisHealthCard.jsx
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalysisHealthCard({ metrics }) {
  const successRate = metrics?.success_rate || 92;
  const gaugeData = [
    { name: "Completed", value: successRate, color: "#34d399" },
    { name: "Remaining", value: 100 - successRate, color: "var(--border-color)" },
  ];

  return (
    <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs flex flex-col justify-between w-full lg:w-80">
      <h2 className="font-bold text-base tracking-wide">Analysis Health</h2>

      {/* Circular Progress Gauge */}
      <div className="relative h-40 w-40 mx-auto my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={65}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold">{successRate}%</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Completion Rate</span>
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-[var(--text-secondary)]">Successful Analyses</p>

      {/* Breakdown Row */}
      <div className="flex justify-around items-center pt-3 border-t border-[var(--border-color)] text-xs text-center mt-2">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold">Total</p>
          <p className="font-extrabold text-sm">{metrics?.requirements_analyzed || 18}</p>
        </div>
        <div>
          <p className="text-[10px] text-emerald-400 font-bold">Completed</p>
          <p className="font-extrabold text-sm text-emerald-400">{metrics?.completed_analyses || 15}</p>
        </div>
        <div>
          <p className="text-[10px] text-amber-400 font-bold">Review</p>
          <p className="font-extrabold text-sm text-amber-400">{metrics?.needs_attention || 3}</p>
        </div>
      </div>
    </div>
  );
}