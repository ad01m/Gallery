"use client";

interface SelectionBarProps {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onExport: () => void;
  onFavorite: () => void;
}

export default function SelectionBar({ count, total, onSelectAll, onClear, onDelete, onMove, onExport, onFavorite }: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="selection-bar anim-slideUp">
      <button onClick={onClear}
        style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 4px" }}>
        ✕
      </button>
      <span style={{ color:"var(--accent-2)",fontWeight:700,fontSize:14 }}>{count} selected</span>
      <span style={{ color:"var(--text-muted)",fontSize:13 }}>of {total}</span>
      <button onClick={onSelectAll}
        style={{ background:"none",border:"none",color:"var(--text-secondary)",cursor:"pointer",fontSize:13 }}>
        Select All
      </button>

      <div style={{ width:1,height:24,background:"var(--border)",margin:"0 6px" }}/>

      <button className="btn-icon" onClick={onFavorite} title="Favorite selected">❤️</button>
      <button className="btn-icon" onClick={onMove} title="Move to album">📁</button>
      <button className="btn-icon" onClick={onExport} title="Export as ZIP">📦</button>
      <button className="btn-icon" onClick={onDelete} title="Move to trash"
        style={{ color:"var(--danger)",borderColor:"var(--danger)",background:"var(--danger-light)" }}>🗑️</button>
    </div>
  );
}
