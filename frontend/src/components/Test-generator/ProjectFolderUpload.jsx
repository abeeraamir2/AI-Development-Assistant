// src/components/test-generator/ProjectFolderUpload.jsx
import React, { useState, useRef } from "react";
import {
  FolderUp,
  Folder,
  FileCode,
  Archive,
  ChevronDown,
  ChevronRight,
  Trash2,
  Code2,
  Upload,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectFolderUpload({
  projects = [],
  selectedProjectId,
  onSelectProjectId,
  uploadedProject,
  onProjectFilesSelected,
  onClearProject,
  focusNotes,
  setFocusNotes,
}) {
  const [uploadMode, setUploadMode] = useState("folder"); // "folder" | "zip"
  const [isTreeExpanded, setIsTreeExpanded] = useState(false);
  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const selectedProjectObj = projects.find(
    (p) => (p.id || p._id) === selectedProjectId
  );

  // Handle folder selection via directory picker
  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const relativePaths = files.map((f) => f.webkitRelativePath || f.name);
    let inferredName = selectedProjectObj?.name || "My Code Project";
    if (files[0].webkitRelativePath) {
      const parts = files[0].webkitRelativePath.split("/");
      if (parts.length > 0 && parts[0]) {
        inferredName = parts[0];
      }
    }

    onProjectFilesSelected({
      type: "folder",
      name: selectedProjectObj ? selectedProjectObj.name : inferredName,
      files,
      relativePaths,
      count: files.length,
    });
  };

  // Handle zip archive upload
  const handleZipChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onProjectFilesSelected({
      type: "zip",
      name: selectedProjectObj ? selectedProjectObj.name : file.name.replace(/\.[^/.]+$/, ""),
      file,
      count: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:col-span-2 flex flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xs"
    >
      {/* 1. Project Selection Dropdown */}
      <div className="space-y-1.5 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Layers size={14} className="text-[var(--accent)]" />
            1. Select Target Project <span className="text-rose-400">*</span>
          </label>
          {selectedProjectObj && (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Project Linked
            </span>
          )}
        </div>

        <div className="relative">
          <select
            value={selectedProjectId || ""}
            onChange={(e) => onSelectProjectId(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-hidden transition-all cursor-pointer pr-10 shadow-xs"
          >
            <option value="" disabled>
              -- Select a Project to generate test cases for --
            </option>
            {projects.map((proj) => {
              const pId = proj.id || proj._id;
              return (
                <option key={pId} value={pId}>
                  {proj.name} ({proj.visibility || "private"})
                </option>
              );
            })}
          </select>
          <ChevronDown
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
        </div>

        {selectedProjectObj && (
          <p className="text-[11px] text-[var(--text-muted)] pl-1">
            {selectedProjectObj.description || "No description provided for this project."}
          </p>
        )}
      </div>

      {/* 2. Codebase Upload Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FolderUp size={16} className="text-[var(--accent)]" />
            2. Upload Project Codebase Folder
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Upload the source code folder for the selected project to analyze routes, models, and functions.
          </p>
        </div>

        {/* Source Mode Toggle: Folder or ZIP */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs">
          <button
            type="button"
            onClick={() => setUploadMode("folder")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              uploadMode === "folder"
                ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Folder Upload
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("zip")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              uploadMode === "zip"
                ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            ZIP Archive
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleZipChange}
        accept=".zip,.tar,.gz"
        className="hidden"
      />

      {/* Mode 1: Folder Upload Dropzone */}
      {uploadMode === "folder" && !uploadedProject && (
        <div
          onClick={() => folderInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center p-7 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] rounded-2xl bg-[var(--bg-primary)]/50 hover:bg-[var(--bg-primary)] transition-all cursor-pointer text-center"
        >
          <div className="p-3.5 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-105 transition-transform mb-2.5">
            <FolderUp size={28} />
          </div>
          <p className="text-xs font-bold text-[var(--text-primary)]">
            Click to select and upload the Project Folder
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-sm">
            Select the root folder from your PC. All source code and config files will be scanned.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full">
            <Code2 size={12} />
            Supports .py, .js, .jsx, .ts, .tsx, .java, .go, .cs, .sql, .json
          </div>
        </div>
      )}

      {/* Mode 2: ZIP Upload Dropzone */}
      {uploadMode === "zip" && !uploadedProject && (
        <div
          onClick={() => zipInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center p-7 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent)] rounded-2xl bg-[var(--bg-primary)]/50 hover:bg-[var(--bg-primary)] transition-all cursor-pointer text-center"
        >
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform mb-2.5">
            <Archive size={28} />
          </div>
          <p className="text-xs font-bold text-[var(--text-primary)]">
            Upload Project ZIP Archive
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-sm">
            Drag & drop or click to upload a compressed <span className="font-semibold text-[var(--text-primary)]">.zip</span> archive.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
            <Upload size={12} />
            Max file size: 50MB
          </div>
        </div>
      )}

      {/* Selected Project Summary Card */}
      {uploadedProject && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                {uploadedProject.type === "zip" ? <Archive size={20} /> : <Folder size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {uploadedProject.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 uppercase">
                    Ready for analysis
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {uploadedProject.type === "zip"
                    ? `Archive file (${(uploadedProject.file?.size / (1024 * 1024)).toFixed(2)} MB)`
                    : `${uploadedProject.count} files loaded from folder`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearProject}
              title="Remove uploaded files"
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Expandable File Tree Preview for Folders */}
          {uploadedProject.relativePaths && uploadedProject.relativePaths.length > 0 && (
            <div className="pt-2 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => setIsTreeExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                {isTreeExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>View Included Project Files ({uploadedProject.relativePaths.length})</span>
              </button>

              <AnimatePresence>
                {isTreeExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="max-h-40 overflow-y-auto p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] font-mono space-y-1">
                      {uploadedProject.relativePaths.slice(0, 100).map((path, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[var(--text-muted)] truncate">
                          <FileCode size={12} className="text-[var(--accent)] shrink-0" />
                          <span className="truncate">{path}</span>
                        </div>
                      ))}
                      {uploadedProject.relativePaths.length > 100 && (
                        <p className="text-[10px] text-[var(--text-muted)] pt-1 italic">
                          + {uploadedProject.relativePaths.length - 100} more files...
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* 3. Optional QA Focus Notes */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
          <span>Testing Focus & Constraints (Optional)</span>
          <span className="text-[10px] text-[var(--text-muted)] lowercase font-normal">
            guides AI on specific edge cases
          </span>
        </label>
        <textarea
          rows={2}
          value={focusNotes}
          onChange={(e) => setFocusNotes(e.target.value)}
          placeholder="e.g. Focus heavily on JWT authentication expiration, SQL injection vectors, checkout discount race conditions, and error status code compliance..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors resize-none"
        />
      </div>
    </motion.div>
  );
}
