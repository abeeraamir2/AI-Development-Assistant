// src/pages/work-items/EditWorkItemPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import WorkItemForm from "../../components/Work-items/WorkItemForm";
import WorkItemStatusBadge from "../../components/Work-items/WorkItemStatusBadge";
import { getWorkItemByIdApi } from "../../services/workItemsApi";

export default function EditWorkItemPage({ authToken, userRole, userEmail }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getWorkItemByIdApi(id);
      setItem(data);
    } catch (err) {
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem, authToken]);

  const handleBack = () => {
    if (item?.id) {
      const targetId = item.id.replace(/^#/, "");
      navigate(`/work-items/${targetId}`);
    } else {
      navigate("/work-items");
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 min-h-full flex flex-col items-center justify-center text-center space-y-3 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 size={32} className="animate-spin text-[#4d8bf8]" />
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading work item for editing...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY / ERROR STATE FOR INVALID OR DELETED WORK ITEM ID
  // -------------------------------------------------------------
  if (!item) {
    return (
      <div className="w-full p-6 md:p-12 min-h-full flex flex-col items-center justify-center text-center space-y-4 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Toaster position="top-right" richColors />
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertCircle size={36} />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-xl font-black text-[var(--text-primary)]">
            Work Item Not Found
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The work item you're trying to edit (<strong className="font-mono text-[var(--text-primary)]">#{id?.replace(/^#/, "")}</strong>) doesn't exist or may have been removed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/work-items")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Work Items</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header & Badges */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4d8bf8] dark:text-zinc-400 dark:hover:text-[#818cf8] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Work Item</span>
          </button>

          {item && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-[var(--border-color)] bg-[var(--bg-surface)] text-[#4d8bf8]">
                {item.id}
              </span>
              <WorkItemStatusBadge status={item.status} />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Edit Work Item
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Update the details, assignment, status, and relationships of this work item.
          </p>
        </div>
      </motion.div>

      {/* Main Reusable Form in Edit Mode */}
      {item && (
        <WorkItemForm
          mode="edit"
          initialData={item}
          currentUserEmail={userEmail}
          currentUserRole={userRole}
        />
      )}
    </div>
  );
}
