"use client";

import { useCallback, useRef } from "react";

interface UploadZoneProps {
  onUpload: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export default function UploadZone({ onUpload, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    zoneRef.current?.classList.add("drag-over");
  }, []);

  const handleDragLeave = useCallback(() => {
    zoneRef.current?.classList.remove("drag-over");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    zoneRef.current?.classList.remove("drag-over");
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onUpload(e.target.files);
  }, [onUpload]);

  return (
    <div
      ref={zoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border: "2px dashed var(--border)",
        borderRadius: "16px",
        padding: "40px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        background: "var(--bg-secondary)",
        opacity: disabled ? 0.6 : 1,
      }}
      className="hover:border-indigo-500 hover:bg-indigo-950/20"
    >
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "16px", marginBottom: "6px" }}>
        Photos Drag & Drop karo ya Click karo
      </p>
      <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
        JPG, PNG, GIF, WebP support hai • Multiple files ek saath
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
