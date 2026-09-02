// src/components/Work-items/WorkItemForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlignLeft,
  Sliders,
  GitFork,
  Paperclip,
  Calendar,
  User,
  ChevronDown,
  UploadCloud,
  FileText,
  X,
  Plus,
  AlertCircle,
  Sparkles,
  Search,
  Loader2,
  Folder,
} from "lucide-react";
import { motion } from "framer-motion";

import { toInputDateFormat } from "../../utils/dateUtils";
import {
  createWorkItemApi,
  updateWorkItemApi,
  getEligibleParentsApi,
  getWorkItemsApi,
  getProjectsApi,
  getUsersApi,
} from "../../services/workItemsApi";

export default function WorkItemForm({
  mode = "create",
  initialData = null,
  defaultProjectId = null,
  currentUserEmail,
  currentUserRole,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditMode = mode === "edit" && Boolean(initialData);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState(initialData?.status || "Not Started");
  const [projectId, setProjectId] = useState(
    initialData?.projectId || initialData?.project_id || defaultProjectId || ""
  );
  const [assignedToId, setAssignedToId] = useState(
    initialData?.assignedTo?.user_id || initialData?.assignedTo?.id || initialData?.assignedTo?._id || ""
  );
  const [startDate, setStartDate] = useState(
    toInputDateFormat(initialData?.startDate) || ""
  );
  const [endDate, setEndDate] = useState(
    toInputDateFormat(initialData?.endDate) || ""
  );
  const [parentId, setParentId] = useState(
    initialData?.parent?.id ? initialData.parent.id : "none"
  );
  const [linkedItems, setLinkedItems] = useState(
    initialData?.linkedWorkItems || []
  );
  const [attachments, setAttachments] = useState(
    initialData?.attachments || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Options from live backend API
  const [parentOptions, setParentOptions] = useState([
    { id: "none", label: "None", value: null },
  ]);
  const [allWorkItems, setAllWorkItems] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Handle status transition without mutating existing dates
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  // Load parent options, linkable items, projects, and users from live database
  useEffect(() => {
    async function loadOptions() {
      try {
        const [parents, items, projs, users] = await Promise.all([
          getEligibleParentsApi(initialData?.id),
          getWorkItemsApi(),
          getProjectsApi(),
          getUsersApi(),
        ]);
        if (parents && Array.isArray(parents)) {
          setParentOptions(parents);
        }
        if (items && Array.isArray(items)) {
          setAllWorkItems(items);
        }
        if (projs && Array.isArray(projs)) {
          setProjectsList(projs);
          if (!projectId && !isEditMode && projs.length > 0) {
            const matched = defaultProjectId
              ? projs.find((p) => (p.id || p._id) === defaultProjectId)
              : projs[0];
            if (matched) {
              setProjectId(matched.id || matched._id);
            }
          }
        }
        if (users && Array.isArray(users)) {
          setUsersList(users);
          if (!assignedToId && !isEditMode && users.length > 0) {
            const matchedUser = currentUserEmail
              ? users.find((u) => u.email?.toLowerCase() === currentUserEmail.toLowerCase())
              : null;
            const chosen = matchedUser || users[0];
            if (chosen) {
              setAssignedToId(chosen.id || chosen._id);
            }
          }
        }
      } catch (err) {
        // Graceful fallback to initial data if any
      }
    }
    loadOptions();
  }, [initialData?.id, defaultProjectId, isEditMode, currentUserEmail]);

  // Populate data when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setStatus(initialData.status || "Not Started");
      setProjectId(initialData.projectId || initialData.project_id || "");
      setAssignedToId(
        initialData.assignedTo?.user_id ||
        initialData.assignedTo?.id ||
        initialData.assignedTo?._id ||
        ""
      );
      setStartDate(toInputDateFormat(initialData.startDate) || "");
      setEndDate(toInputDateFormat(initialData.endDate) || "");
      setParentId(initialData.parent?.id ? initialData.parent.id : "none");
      setLinkedItems(initialData.linkedWorkItems || []);
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  // Available linkable items excluding current item
  const linkableOptions = allWorkItems.filter(
    (item) => item.id !== initialData?.id
  );

  const filteredLinkOptions = linkableOptions.filter((item) =>
    (item.title || "").toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
    (item.id || "").toLowerCase().includes(linkSearchQuery.toLowerCase())
  );

  // Handle Multi-Select Linked Items
  const handleToggleLinkedItem = (item) => {
    setLinkedItems((prev) => {
      const exists = prev.some((l) => l.id === item.id);
      if (exists) {
        return prev.filter((l) => l.id !== item.id);
      }
      return [
        ...prev,
        { id: item.id, title: item.title, category: item.category, status: item.status || "In Progress" },
      ];
    });
  };

  const handleRemoveLinkedItem = (id) => {
    setLinkedItems((prev) => prev.filter((l) => l.id !== id));
  };

  // Handle File Selection & Drag-and-drop
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAttachment = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        type: file.type || "document",
      };
      setAttachments((prev) => [...prev, newAttachment]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const newAttachment = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        type: file.type || "document",
      };
      setAttachments((prev) => [...prev, newAttachment]);
    }
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    if (isEditMode) {
      const targetId = initialData.id.replace(/^#/, "");
      navigate(`/work-items/${targetId}`);
    } else {
      navigate("/work-items");
    }
  };

  // Validation and Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Required Field: Title
    if (!title.trim()) {
      newErrors.title = "Work Item Title is required.";
    }

    // 2. Required Field: Project
    if (!projectId) {
      newErrors.projectId = "Please select a project for this work item.";
    }

    // 3. Required Field: Category
    if (!category) {
      newErrors.category = "Please select a category.";
    }

    // 4. Required Field: Assigned To
    if (!assignedToId) {
      newErrors.assignedTo = "Please select an assignee from the team.";
    }

    // 5. Date Validation: End Date must not be earlier than Start Date
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = "End Date cannot be earlier than Start Date.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the highlighted errors before proceeding.");
      return;
    }

    // Resolve user from database users list
    const selectedUser = usersList.find(
      (u) => (u.id && u.id === assignedToId) || (u._id && u._id === assignedToId)
    );
    const assignedUserId = selectedUser?.id || selectedUser?._id || assignedToId;
    const assignedUserEmail = selectedUser?.email || initialData?.assignedTo?.email;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // -------------------------------------------------------------
        // UPDATE WORK ITEM (EDIT MODE)
        // -------------------------------------------------------------
        const updatePayload = {
          title: title.trim(),
          description: description.trim(),
          category,
          status,
          project_id: projectId,
          assigned_to_id: assignedUserId,
          assigned_to_email: assignedUserEmail,
          start_date: status === "Not Started" ? (startDate || null) : (startDate || null),
          end_date: status === "Not Started" ? (endDate || null) : (endDate || null),
          parent_id: parentId === "none" ? null : parentId,
          linked_work_item_ids: linkedItems.map((l) => l.id),
          attachments,
        };

        const updated = await updateWorkItemApi(initialData.id, updatePayload);
        toast.success("Work item updated successfully.");
        const targetId = (updated.id || initialData.id).replace(/^#/, "");
        navigate(`/work-items/${targetId}`);
      } else {
        // -------------------------------------------------------------
        // CREATE NEW WORK ITEM (CREATE MODE)
        // -------------------------------------------------------------
        const createPayload = {
          title: title.trim(),
          description: description.trim(),
          category,
          status: status || "Not Started",
          project_id: projectId,
          assigned_to_id: assignedUserId,
          assigned_to_email: assignedUserEmail,
          start_date: status === "Not Started" ? (startDate || null) : (startDate || null),
          end_date: status === "Not Started" ? (endDate || null) : (endDate || null),
          parent_id: parentId === "none" ? null : parentId,
          linked_work_item_ids: linkedItems.map((l) => l.id),
          attachments,
        };

        const createdItem = await createWorkItemApi(createPayload);
        toast.success(`Work Item ${createdItem.id} created successfully!`);
        navigate("/work-items");
      }
    } catch (err) {
      toast.error(err.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: BASIC INFORMATION                                  */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm">
          <AlignLeft size={16} className="text-[#4d8bf8]" />
          <span>Basic Information</span>
        </div>

        {/* Work Item Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Work Item Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="e.g. Implement User Authentication API"
            className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden transition-all shadow-xs ${
              errors.title
                ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-[var(--border-color)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15"
            }`}
          />
          {errors.title && (
            <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Project Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Project <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Folder
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                if (errors.projectId)
                  setErrors((prev) => ({ ...prev, projectId: null }));
              }}
              className={`w-full appearance-none pl-9 pr-9 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden transition-all cursor-pointer shadow-xs ${
                errors.projectId
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border-color)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15"
              }`}
            >
              <option value="" disabled>
                Select a project
              </option>
              {projectsList.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          {errors.projectId && (
            <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              <span>{errors.projectId}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work that needs to be completed..."
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-zinc-500 focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-hidden transition-all shadow-xs resize-y"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category)
                  setErrors((prev) => ({ ...prev, category: null }));
              }}
              className={`w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden transition-all cursor-pointer shadow-xs ${
                errors.category
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border-color)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15"
              }`}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="DevOps">DevOps</option>
              <option value="Testing">Testing</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          {errors.category && (
            <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              <span>{errors.category}</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: WORK MANAGEMENT                                    */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm">
          <Sliders size={16} className="text-[#4d8bf8]" />
          <span>Work Management</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-hidden transition-all cursor-pointer shadow-xs"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Assign To (From MongoDB Users Collection) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Assign To <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={assignedToId}
                onChange={(e) => {
                  setAssignedToId(e.target.value);
                  if (errors.assignedTo)
                    setErrors((prev) => ({ ...prev, assignedTo: null }));
                }}
                className={`w-full appearance-none pl-9 pr-9 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden transition-all cursor-pointer shadow-xs ${
                  errors.assignedTo
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-color)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15"
                }`}
              >
                {usersList.length === 0 ? (
                  <option value="" disabled>
                    Loading users from database...
                  </option>
                ) : (
                  usersList.map((usr) => (
                    <option key={usr.id || usr._id} value={usr.id || usr._id}>
                      {usr.name} ({usr.role || "Developer"}) — {usr.email}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            {errors.assignedTo && (
              <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                <span>{errors.assignedTo}</span>
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Start Date
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-hidden transition-all shadow-xs"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              End Date
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate)
                    setErrors((prev) => ({ ...prev, endDate: null }));
                }}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] focus:outline-hidden transition-all shadow-xs ${
                  errors.endDate
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-color)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15"
                }`}
              />
            </div>
            {errors.endDate && (
              <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                <span>{errors.endDate}</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: RELATIONSHIPS                                      */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm">
          <GitFork size={16} className="text-[#4d8bf8]" />
          <span>Relationships</span>
        </div>

        {/* Parent Work Item (Hierarchical with circular prevention) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Parent Work Item
          </label>
          <div className="relative">
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[#4d8bf8] focus:ring-2 focus:ring-[#4d8bf8]/15 focus:outline-hidden transition-all cursor-pointer shadow-xs"
            >
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium">
            Select a parent if this work item is a smaller part of an existing work item (Parent → Child).
          </p>
        </div>

        {/* Link Work Items (Multi-select with chips) */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-[var(--text-primary)]">
            Linked Work Items
          </label>

          {/* Selected Chips */}
          {linkedItems.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              {linkedItems.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#4d8bf8]/10 text-[#4d8bf8] dark:text-[#818cf8] border border-[#4d8bf8]/30 animate-in fade-in"
                >
                  <span>{l.title || l.id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLinkedItem(l.id)}
                    className="hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search to Link */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={linkSearchQuery}
              onChange={(e) => setLinkSearchQuery(e.target.value)}
              placeholder="Search to link related work items..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] placeholder-slate-400 focus:border-[#4d8bf8] focus:outline-hidden transition-all shadow-xs"
            />
          </div>

          {/* Available Link Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredLinkOptions.map((item) => {
              const isSelected = linkedItems.some((l) => l.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleLinkedItem(item)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#4d8bf8] bg-[#4d8bf8]/10 text-[var(--text-primary)]"
                      : "border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[#4d8bf8]/50 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="truncate">
                    <strong className="text-[var(--text-primary)]">{item.id}</strong> {item.title}
                  </span>
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 border ml-2 ${
                      isSelected
                        ? "bg-[#4d8bf8] border-[#4d8bf8] text-white"
                        : "border-slate-300 dark:border-zinc-700"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium">
            Link related work items that are connected to this work (Related ↔ Related).
          </p>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: ATTACHMENTS                                        */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm">
          <Paperclip size={16} className="text-[#4d8bf8]" />
          <span>Attachments</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? "border-[#4d8bf8] bg-[#4d8bf8]/5"
              : "border-[var(--border-color)] hover:border-[#4d8bf8]/50 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#4d8bf8]/10 text-[#4d8bf8] flex items-center justify-center">
            <UploadCloud size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Click to upload <span className="font-normal text-[var(--text-muted)]">or drag and drop</span>
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              PDF, Figma, DOCX, Images up to 25MB
            </p>
          </div>
        </div>

        {/* Uploaded File List */}
        {attachments.length > 0 && (
          <div className="space-y-2 pt-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText size={16} className="text-[#4d8bf8] shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{file.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{file.size} • {file.date || "Just now"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="text-[var(--text-muted)] hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                  title="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: ACTIONS (SAVE & CANCEL)                            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4d8bf8] hover:bg-[#3b76e8] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>{isEditMode ? "Save Changes" : "Create Work Item"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
