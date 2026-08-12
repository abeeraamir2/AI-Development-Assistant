import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { FileText, UploadCloud, File, X } from "lucide-react";

export default function RequirementInput({
    inputText,
    setInputText,
    uploadedFile,
    setUploadedFile,
    }) {
    const onDrop = useCallback(
        (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            toast.error("File rejected. Upload PDF, DOCX, or MD under 10MB.");
            return;
        }
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setUploadedFile(file);
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
        className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xs"
        >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold text-sm text-[var(--text-primary)]">
                Requirement Input
            </h2>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-muted)]">
            Markdown Supported
            </span>
        </div>

        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter requirement details, user stories, acceptance criteria, or paste code snippets here..."
            className="w-full h-52 p-3 text-xs font-sans rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
        />

        {uploadedFile ? (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex items-center gap-2.5">
                <File size={18} className="text-[var(--accent)]" />
                <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {uploadedFile.name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => {
                setUploadedFile(null);
                toast.info("Attachment removed");
                }}
                className="p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
            >
                <X size={16} />
            </button>
            </div>
        ) : (
            <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center py-6 px-4 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                isDragActive
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent)]/50"
            }`}
            >
            <input {...getInputProps()} />
            <UploadCloud size={24} className="text-[var(--text-muted)] mb-2" />
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                {isDragActive
                ? "Drop specification document here..."
                : "Drag & Drop specification documents here"}
            </p>
            <p className="text-[10px] font-medium text-[var(--text-muted)]">
                Supports PDF, DOCX, MD (Max 10MB)
            </p>
            </div>
        )}
        </motion.div>
    );
}