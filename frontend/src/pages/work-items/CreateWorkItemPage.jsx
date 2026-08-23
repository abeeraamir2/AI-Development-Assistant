// src/pages/work-items/CreateWorkItemPage.jsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { motion } from "framer-motion";

import WorkItemForm from "../../components/Work-items/WorkItemForm";

export default function CreateWorkItemPage({ authToken, userRole, userEmail }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const defaultProjectId =
    searchParams.get("projectId") ||
    location.state?.defaultProject?.id ||
    location.state?.defaultProject?._id ||
    null;

  return (
    <div className="w-full p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header & Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <button
          type="button"
          onClick={() => navigate("/work-items")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#6366f1] dark:text-zinc-400 dark:hover:text-[#a5b4fc] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Work Items</span>
        </button>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Create New Work Item
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Create and assign a new piece of work for your project.
          </p>
        </div>
      </motion.div>

      {/* Main Form */}
      <WorkItemForm
        mode="create"
        defaultProjectId={defaultProjectId}
        currentUserEmail={userEmail}
        currentUserRole={userRole}
      />
    </div>
  );
}
