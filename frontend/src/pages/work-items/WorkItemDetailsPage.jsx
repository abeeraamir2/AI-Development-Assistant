// src/pages/work-items/WorkItemDetailsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft,
  Edit3,
  MoreVertical,
  Trash2,
  AlertCircle,
  Eye,
  Plus,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import WorkItemCategoryBadge from "../../components/Work-items/WorkItemCategoryBadge";
import WorkItemStatusBadge from "../../components/Work-items/WorkItemStatusBadge";
import WorkItemOverviewCard from "../../components/Work-items/WorkItemOverviewCard";
import WorkItemProgressCard from "../../components/Work-items/WorkItemProgressCard";
import ChildWorkItemsCard from "../../components/Work-items/ChildWorkItemsCard";
import LinkedWorkItemsCard from "../../components/Work-items/LinkedWorkItemsCard";
import WorkItemSidebarDetails from "../../components/Work-items/WorkItemSidebarDetails";
import WorkItemActivityTimeline from "../../components/Work-items/WorkItemActivityTimeline";
import DeleteWorkItemModal from "../../components/modals/DeleteWorkItemModal";

import {
  getWorkItemByIdApi,
  deleteWorkItemApi,
} from "../../services/workItemsApi";

export default function WorkItemDetailsPage({ authToken, userRole, userEmail }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childItems, setChildItems] = useState([]);
  const [linkedItems, setLinkedItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const menuRef = useRef(null);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getWorkItemByIdApi(id);
      setItem(data);
      if (data) {
        setChildItems(data.childWorkItems || []);
        setLinkedItems(data.linkedWorkItems || []);
      }
    } catch (err) {
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem, authToken]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle Edit Action
  const handleEdit = () => {
    setIsMenuOpen(false);
    const targetId = item?.id ? item.id.replace(/^#/, "") : id;
    navigate(`/work-items/${targetId}/edit`);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!item) return;
    try {
      await deleteWorkItemApi(item.id);
      setIsDeleteModalOpen(false);
      toast.success(`Work item ${item.id} deleted successfully.`);
      navigate("/work-items");
    } catch (err) {
      toast.error(err.message || "Failed to delete work item.");
    }
  };

  // Handle Add Child Navigation
  const handleAddChild = () => {
    if (!item) return;
    navigate(`/work-items/create?parent=${item.id.replace(/^#/, "")}`);
  };

  // Handle Link Work Item Action
  const handleLinkItem = () => {
    toast.info("Link Work Item modal/dialog will be available in future releases.");
  };

  const handleAddAttachment = () => {
    toast.info("Upload attachment action triggered.");
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="w-full p-12 min-h-full flex flex-col items-center justify-center text-center space-y-3 bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Loader2 size={32} className="animate-spin text-[#4d8bf8]" />
        <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading work item details...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY / ERROR STATE FOR INVALID WORK ITEM ID
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
            The work item with ID <strong className="font-mono text-[var(--text-primary)]">#{id?.replace(/^#/, "")}</strong> doesn't exist or may have been removed from this workspace.
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

      {/* Delete Confirmation Modal */}
      <DeleteWorkItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        item={item}
        childCount={childItems.length}
      />

      {/* ------------------------------------------------------------- */}
      {/* PAGE HEADER: Back Link + ID/Title + Badges + Action Buttons    */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <button
          type="button"
          onClick={() => navigate("/work-items")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4d8bf8] dark:text-zinc-400 dark:hover:text-[#818cf8] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Work Items</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: ID + Title + Category/Status Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#4d8bf8]">
                {item.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                {item.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <WorkItemCategoryBadge category={item.category} />
              <WorkItemStatusBadge status={item.status} />
            </div>
          </div>

          {/* Right: Edit & Three-Dot Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Work Item</span>
            </button>

            {/* Three-Dot Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
                title="More Actions"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} className="text-[#4d8bf8]" />
                    <span>Edit</span>
                  </button>

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN TWO-COLUMN GRID                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Content Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <WorkItemOverviewCard description={item.description} />

          <WorkItemProgressCard
            progress={item.progress}
            status={item.status}
            startDate={item.startDate}
            endDate={item.endDate}
          />

          <ChildWorkItemsCard
            parentItem={item}
            childItems={childItems}
            onAddChild={handleAddChild}
          />

          <LinkedWorkItemsCard
            linkedItems={linkedItems}
            onLinkItem={handleLinkItem}
          />

          <WorkItemActivityTimeline activity={item.activity} />
        </div>

        {/* Right / Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <WorkItemSidebarDetails
            item={item}
            onAddAttachment={handleAddAttachment}
          />
        </div>
      </div>
    </div>
  );
}
