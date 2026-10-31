"use client";
import { useEffect, useCallback, useState } from "react";
import { Photo } from "../types";
import { formatSize, formatDate } from "../lib/storage";

interface LightboxProps {
  photo: Photo;
  total: number;
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFavorite: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onEdit: (photo: Photo) => void;
}

export default function Lightbox({ photo, total, current, onClose, onPrev, onNext, onFavorite, onUpdateNote, onEdit }: LightboxProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [note, setNote] = useState(photo.note || "");
  const [editNote, setEditNote] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => { setNote(photo.note || ""); setZoom(1); }, [photo.id]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft")  onPrev();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "Escape")     onClose();
    if (e.key === "f")          onFavorite(photo.id);
    if (e.key === "i")          setShowInfo(s => !s);
    if (e.key === "+")          setZoom(z => Math.min(z+.25,3));
    if (e.key === "-")          setZoom(z => Math.max(z-.25,.5));
  }, [onClose, onPrev, onNext, onFavorite, photo.id]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const download = () => { const a=document.createElement("a"); a.href=photo.url; a.download=photo.name; a.click(); };

  return (
    <div className="lightbox anim-fadeIn" onClick={e => e.target===e.currentTarget && onClose()}>
      {/* Top bar */}
      <div style={{ position:"absolute",top:0,left:0,right:0,padding:"16px 20px",
        background:"linear-gradient(to bottom,rgba(0,0,0,.7),transparent)",
        display:"flex",alignItems:"center",gap:12,zIndex:10 }}>
        <button onClick={onClose} className="btn-icon" style={{ flexShrink:0 }}>✕</button>
        <span style={{ color:"rgba(255,255,255,.5)",fontSize:13 }}>{current+1} / {total}</span>
        <span style={{ color:"white",fontWeight:600,fontSize:15,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{photo.name}</span>
        <div style={{ display:"flex",gap:8,flexShrink:0 }}>
          <button className="btn-icon" onClick={()=>setZoom(z=>Math.min(z+.25,3))} title="Zoom in (+)">🔍</button>
          <button className="btn-icon" onClick={()=>setZoom(1)} title="Reset zoom">⊙</button>
          <button className="btn-icon" onClick={()=>onFavorite(photo.id)} title="Favorite (f)">
            {photo.favorite?"❤️":"🤍"}
          </button>
          <button className="btn-icon" onClick={()=>onEdit(photo)} title="Edit photo">✏️</button>
          <button className="btn-icon" onClick={()=>setShowInfo(s=>!s)} title="Info (i)">ℹ️</button>
          <button className="btn-icon" onClick={download} title="Download">⬇️</button>
        </div>
      </div>

      {/* Nav */}
      <button className="lightbox-nav" onClick={onPrev} style={{ left:20 }}>‹</button>

      <img src={photo.url} alt={photo.name} className="lightbox-img"
        style={{ transform:`scale(${zoom})`, maxWidth: showInfo?"calc(100vw - 320px)":"90vw" }} />

      <button className="lightbox-nav" onClick={onNext} style={{ right: showInfo?340:20 }}>›</button>

      {/* Info panel */}
      {showInfo && (
        <div className="anim-slideR" style={{
          position:"absolute",right:0,top:0,bottom:0,width:300,
          background:"var(--bg-sidebar)",borderLeft:"1px solid var(--border)",
          padding:"80px 20px 20px",overflowY:"auto",display:"flex",flexDirection:"column",gap:14,
          zIndex:10,
        }}>
          <Row label="📋 Name" value={photo.name}/>
          <Row label="📅 Date" value={formatDate(photo.createdAt)}/>
          <Row label="📦 Size" value={formatSize(photo.size)}/>
          <Row label="📐 Dims" value={`${photo.width} × ${photo.height}`}/>
          {photo.tags.length>0 && (
            <div>
              <p style={{ color:"var(--text-muted)",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:8 }}>🏷️ Tags</p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {photo.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}
          <div>
            <p style={{ color:"var(--text-muted)",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:8 }}>📝 Note</p>
            {editNote ? (
              <>
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                  className="input" style={{ resize:"vertical" }} placeholder="Note likhein..."/>
                <div style={{ display:"flex",gap:8,marginTop:8 }}>
                  <button className="btn-primary" style={{ flex:1,fontSize:13 }}
                    onClick={()=>{onUpdateNote(photo.id,note);setEditNote(false);}}>Save</button>
                  <button className="btn-ghost" style={{ flex:1,fontSize:13 }} onClick={()=>setEditNote(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <div onClick={()=>setEditNote(true)} style={{
                padding:10,borderRadius:10,background:"var(--bg-card)",cursor:"pointer",
                minHeight:40,color:note?"var(--text-primary)":"var(--text-muted)",
                fontSize:13,border:"1px solid var(--border)",
              }}>{note||"Click karke note add karo..."}</div>
            )}
          </div>
        </div>
      )}

      {/* Hints */}
      <div style={{ position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",
        display:"flex",gap:16,color:"rgba(255,255,255,.3)",fontSize:12 }}>
        <span>← → Navigate</span><span>F Favorite</span><span>I Info</span><span>+/- Zoom</span><span>Esc Close</span>
      </div>
    </div>
  );
}

function Row({label,value}:{label:string;value:string}) {
  return (
    <div>
      <p style={{ color:"var(--text-muted)",fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:4 }}>{label}</p>
      <p style={{ color:"var(--text-primary)",fontSize:13 }}>{value}</p>
    </div>
  );
}
