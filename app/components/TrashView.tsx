"use client";
import { useState } from "react";
import { Photo } from "../types";
import { formatDate, formatSize } from "../lib/storage";

interface TrashViewProps {
  trash: Photo[];
  onRestore: (ids: string[]) => void;
  onPermanentDelete: (ids: string[]) => void;
  onEmptyTrash: () => void;
}

export default function TrashView({ trash, onRestore, onPermanentDelete, onEmptyTrash }: TrashViewProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  if (trash.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🗑️</div>
        <h2 className="empty-title">Trash Khali Hai!</h2>
        <p className="empty-sub">Deleted photos yahan aayenge. 30 din baad automatically delete ho jaayenge.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        <p style={{ color:"var(--text-secondary)",fontSize:14,flex:1 }}>
          {trash.length} photo{trash.length>1?"s":""} trash mein hain
        </p>
        {selected.length > 0 && (
          <>
            <button className="btn-ghost" onClick={()=>onRestore(selected)}>↩️ Restore ({selected.length})</button>
            <button className="btn-danger" onClick={()=>{onPermanentDelete(selected);setSelected([]);}}>🗑️ Delete Forever ({selected.length})</button>
          </>
        )}
        <button className="btn-danger" onClick={()=>{ if(confirm("Sab kuch hamesha ke liye delete karna chahte ho?")) onEmptyTrash(); }}>
          🗑️ Empty Trash
        </button>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12 }}>
        {trash.map(photo => (
          <div key={photo.id} style={{
            borderRadius:14,overflow:"hidden",border:`2px solid ${selected.includes(photo.id)?"var(--danger)":"var(--border)"}`,
            background:"var(--bg-card)",cursor:"pointer",position:"relative",
          }} onClick={()=>toggle(photo.id)}>
            {selected.includes(photo.id) && (
              <div style={{ position:"absolute",top:8,left:8,background:"var(--danger)",borderRadius:"50%",
                width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,zIndex:3 }}>✓</div>
            )}
            <img src={photo.thumbnailUrl} alt={photo.name}
              style={{ width:"100%",height:130,objectFit:"cover",opacity:.6,display:"block" }}/>
            <div style={{ padding:"10px 12px" }}>
              <p style={{ color:"var(--text-primary)",fontSize:13,fontWeight:500,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{photo.name}</p>
              <p style={{ color:"var(--text-muted)",fontSize:11,marginTop:3 }}>
                Deleted {photo.deletedAt ? formatDate(photo.deletedAt) : ""}
              </p>
              <div style={{ display:"flex",gap:6,marginTop:8 }}>
                <button onClick={e=>{e.stopPropagation();onRestore([photo.id]);}} className="btn-ghost"
                  style={{ flex:1,padding:"5px 8px",fontSize:11 }}>↩️ Restore</button>
                <button onClick={e=>{e.stopPropagation();onPermanentDelete([photo.id]);}} className="btn-danger"
                  style={{ flex:1,padding:"5px 8px",fontSize:11 }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
