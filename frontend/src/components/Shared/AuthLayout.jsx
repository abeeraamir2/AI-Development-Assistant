import React from "react";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7fb] p-4 md:p-8 font-sans">
      {/* Central Split Card */}
      <div className="w-full max-w-5xl min-h-[580px] bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-100">
        
        {/* LEFT COLUMN: Grid Background & Value Props */}
        <div 
          className="relative p-8 md:p-12 flex flex-col justify-between bg-[#f8faff] border-r border-slate-100"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        >
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-slate-900 bg-white shadow-xs">
              <Sparkles size={20} strokeWidth={2.2} className="text-slate-900" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                DevAssist
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                AI DEVELOPMENT ASSISTANT
              </div>
            </div>
          </div>

          {/* Center Info Card */}
          <div className="my-auto py-8">
            <div className="bg-white/80 backdrop-blur-md p-7 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                AI-Powered Requirement Intelligence
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload a requirement document and get instant AI-generated summaries,
                acceptance criteria, API specs, and dev tasks.
              </p>

              {/* Metrics Highlights */}
              <div className="flex items-center gap-10 pt-2">
                <div>
                  <div className="text-xl font-extrabold text-[#3b82f6]">10x</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Faster Analysis
                  </div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#3b82f6]">0%</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Context Lost
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom subtle text / spacing */}
          <div className="text-[11px] text-slate-400 font-medium">
            Secure enterprise workspace
          </div>
        </div>

        {/* RIGHT COLUMN: Form Area */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}