"use client";
import { useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number; y: number;
  onClose: () => void;
  onOpen: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  onMoveToAlbum: () => void;
  onMoveToTrash: () => void;
  onDownload: () => void;
  onEdit: () => void;
}

export default function ContextMenu({ x, y, onClose, onOpen, onFavorite, isFavorite, onMoveToAlbum, onMoveToTrash, onDownload, onEdit }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Adjust if near edge
  const style: React.CSSProperties = {
    top: Math.min(y, window.innerHeight - 260),
    left: Math.min(x, window.innerWidth - 200),
  };

  const item = (icon: string, label: string, action: () => void, danger=false) => (
    <button className={`ctx-item ${danger?"danger":""}`} onClick={() => { action(); onClose(); }}>
      <span style={{ fontSize:15 }}>{icon}</span> {label}
    </button>
  );

  return (
    <div className="ctx-menu anim-scaleUp" ref={ref} style={{ position:"fixed", ...style }}>
      {item("🔍","Open",onOpen)}
      {item(isFavorite?"💔":"❤️", isFavorite?"Remove Favorite":"Add Favorite", onFavorite)}
      {item("✏️","Edit Photo",onEdit)}
      {item("📁","Move to Album",onMoveToAlbum)}
      {item("⬇️","Download",onDownload)}
      <div className="ctx-divider"/>
      {item("🗑️","Move to Trash",onMoveToTrash,true)}
    </div>
  );
}
