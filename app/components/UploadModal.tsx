"use client";
import { useRef, useCallback } from "react";

interface UploadModalProps {
  onUpload: (files: FileList | File[]) => Promise<boolean>;
  onClose: () => void;
  disabled?: boolean;
}

export default function UploadModal({ onUpload, onClose, disabled }: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef  = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    zoneRef.current?.classList.remove("drag");
    if (!disabled && e.dataTransfer.files.length) {
      const saved = await onUpload(e.dataTransfer.files);
      if (saved) onClose();
    }
  }, [onUpload, onClose]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const saved = await onUpload(files);
      if (saved) onClose();
      e.target.value = "";
    }
  }, [onUpload, onClose]);

  return (
    <div className="modal-backdrop anim-fadeIn" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box anim-scaleUp" style={{ width:480 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h2 className="modal-title" style={{ marginBottom:0 }}>📤 Photos Upload Karo</h2>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>

        <div ref={zoneRef} className="upload-zone"
          onDragOver={e=>{e.preventDefault();zoneRef.current?.classList.add("drag");}}
          onDragLeave={()=>zoneRef.current?.classList.remove("drag")}
          onDrop={handleDrop}
          onClick={()=>!disabled&&inputRef.current?.click()}
        >
          <div style={{ fontSize:52,marginBottom:14 }}>📸</div>
          <p style={{ color:"var(--text-primary)",fontWeight:700,fontSize:16,marginBottom:8 }}>
            Drag & Drop karo
          </p>
          <p style={{ color:"var(--text-secondary)",fontSize:13,marginBottom:16 }}>
            ya click karke select karo
          </p>
          <p style={{ color:"var(--text-muted)",fontSize:12 }}>
            JPG • PNG • GIF • WebP • Multiple files OK
          </p>
          <input ref={inputRef} type="file" multiple accept="image/*"
            style={{ display:"none" }} onChange={handleChange} disabled={disabled}/>
        </div>
      </div>
    </div>
  );
}
