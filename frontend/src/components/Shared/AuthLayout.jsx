import React from "react";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f9] p-4 sm:p-6 md:p-10 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Central Split Card - 50/50 Equal Grid */}
      <div className="w-full max-w-[960px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
        
        {/* LEFT COLUMN: Equal 50% Width */}
        <div 
          className="relative p-8 md:p-10 flex flex-col justify-between bg-[#f8faff] border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-900/90 bg-white shadow-xs">
              <Sparkles size={20} strokeWidth={2.2} className="text-slate-900" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                DevAssist
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                AI Development Assistant
              </div>
            </div>
          </div>

          {/* Center Feature Card */}
          <div className="relative z-10 my-auto py-6">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-[#4d8bf8] uppercase tracking-wide">
                <Zap size={11} className="fill-[#4d8bf8] text-[#4d8bf8]" />
                <span>End-to-End AI Workspace</span>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                Full-Lifecycle Engineering Intelligence
              </h2>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze complex PRDs, auto-generate QA test suites, synthesize bug reports, and track sprint metrics across cross-functional teams.
              </p>

              {/* Metrics Highlights */}
              <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-[#4d8bf8]">3-in-1</div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    Dev, QA & PM Tools
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-[#4d8bf8]">100%</div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    Traceable Specs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Secure enterprise workspace</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Equal 50% Width Form Panel */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          <div className="w-full">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}