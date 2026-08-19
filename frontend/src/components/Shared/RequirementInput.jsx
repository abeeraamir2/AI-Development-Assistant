import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { FileText, UploadCloud, File, X, Edit3 } from "lucide-react";

export default function RequirementInput({
    inputText,
    setInputText,
    uploadedFile,
    setUploadedFile,
    }) {
    const [activeMode, setActiveMode] = useState(uploadedFile ? "file" : "text");

    const onDrop = useCallback(
        (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            toast.error("File rejected. Upload PDF, DOCX, TXT, or MD under 10MB.");
            return;
        }
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setUploadedFile(file);
            setActiveMode("file");
            toast.success(`Attached ${file.name}`);
        }
        },
        [setUploadedFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
            ".docx",
        ],
        "text/markdown": [".md"],
        "text/plain": [".txt"],
        },
        maxSize: 10 * 1024 * 1024,
        multiple: false,
    });

    return (
        <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs"
        >
        {/* Top Header & Mode Toggle Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold text-sm text-[var(--text-primary)]">
                Requirement Input
            </h2>
            </div>

            {/* Input Selector Switch */}
            <div className="flex items-center p-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <button
                type="button"
                onClick={() => setActiveMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMode === "text"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
                <Edit3 size={13} />
                <span>Paste Text</span>
            </button>
            <button
                type="button"
                onClick={() => setActiveMode("file")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMode === "file"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
                <UploadCloud size={13} />
                <span>Upload Document</span>
            </button>
            </div>
        </div>

        {/* Option A: Paste Requirement Details */}
        {activeMode === "text" && (
            <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">
                Option 1: Paste details, user stories, or acceptance criteria
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]">
                Markdown Supported
                </span>
            </div>

            <textarea
                value={inputText}
                onChange={(e) => {
                setInputText(e.target.value);
                if (uploadedFile) setUploadedFile(null); // Clear opposing input
                }}
                placeholder="Enter requirement details, user stories, acceptance criteria, or paste code snippets here..."
                className="w-full h-48 p-3.5 text-xs font-sans rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none leading-relaxed"
            />

            <div className="flex items-center justify-center gap-3 pt-1">
                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                or upload a file instead
                </span>
                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
            </div>

            <button
                type="button"
                onClick={() => setActiveMode("file")}
                className="w-full py-2 border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-center cursor-pointer"
            >
                Prefer uploading a specification file (.pdf, .docx, .md)? Click here
            </button>
            </div>
        )}

        {/* Option B: Upload Document */}
        {activeMode === "file" && (
            <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--text-secondary)]">
                Option 2: Attach a requirement specification file
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]">
                Max 10MB
                </span>
            </div>

            {uploadedFile ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent)] text-white">
                    <File size={20} />
                    </div>
                    <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
                        {uploadedFile.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Analysis
                    </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                    setUploadedFile(null);
                    toast.info("Attachment removed");
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
                </div>
            ) : (
                <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center py-10 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/50"
                }`}
                >
                <input {...getInputProps()} />
                <div className="p-3 rounded-full bg-[var(--bg-surface)] text-[var(--accent)] mb-3 shadow-xs">
                    <UploadCloud size={24} />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)] mb-1">
                    {isDragActive
                    ? "Drop specification document here..."
                    : "Drag & drop specification document here"}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                    Supports PDF, DOCX, TXT, MD (Max 10MB)
                </p>
                </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-1">
                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                or paste text instead
                </span>
                <div className="h-[1px] flex-1 bg-[var(--border-color)]" />
            </div>

            <button
                type="button"
                onClick={() => setActiveMode("text")}
                className="w-full py-2 border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-center cursor-pointer"
            >
                Want to type or paste text directly? Click here
            </button>
            </div>
        )}
        </motion.div>
    );
}