"use client";
import { useState } from "react";
import { Photo } from "../types";

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFavorite: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  viewMode?: "masonry" | "grid" | "list";
}

export default function PhotoCard({ photo, isSelected, selectionMode, onSelect, onOpen, onFavorite, onContextMenu, viewMode="masonry" }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);

  if (viewMode === "list") {
    return (
      <div className="list-row anim-fadeUp"
        onClick={() => selectionMode ? onSelect(photo.id) : onOpen(photo.id)}
        onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, photo.id); }}
      >
        <input type="checkbox" checked={isSelected} onChange={() => onSelect(photo.id)}
          onClick={e => e.stopPropagation()}
          style={{ width:16,height:16,accentColor:"var(--accent)",flexShrink:0 }} />
        <img src={photo.thumbnailUrl} alt={photo.name} onLoad={() => setLoaded(true)}
          style={{ opacity: loaded?1:0, transition:"opacity .3s" }} />
        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ color:"var(--text-primary)",fontWeight:500,fontSize:14,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{photo.name}</p>
          <p style={{ color:"var(--text-muted)",fontSize:12 }}>
            {photo.tags.slice(0,3).map(t => `#${t}`).join(" ")}
          </p>
        </div>
        <span style={{ color:"var(--text-muted)",fontSize:12,flexShrink:0 }}>
          {new Date(photo.createdAt).toLocaleDateString("en-IN")}
        </span>
        <button onClick={e=>{e.stopPropagation();onFavorite(photo.id);}}
          style={{ background:"none",border:"none",cursor:"pointer",fontSize:18,flexShrink:0 }}>
          {photo.favorite?"❤️":"🤍"}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`photo-card anim-fadeUp ${isSelected?"selected":""} ${viewMode==="masonry"?"masonry-item":""}`}
      onClick={() => selectionMode ? onSelect(photo.id) : onOpen(photo.id)}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, photo.id); }}
    >
      {/* Checkbox */}
      {(selectionMode || isSelected) && (
        <div className={`photo-cb ${isSelected?"checked":""}`}
          onClick={e=>{e.stopPropagation();onSelect(photo.id);}}>
          {isSelected && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 5l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
        </div>
      )}
      {/* Fav */}
      {photo.favorite && <div className="photo-fav">❤️</div>}
      {/* Image */}
      {!loaded && <div className="skeleton" style={{ width:"100%",height:150 }} />}
      <img src={photo.thumbnailUrl} alt={photo.name}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded?1:0, transition:"opacity .3s", display:"block", width:"100%" }} />
      {/* Overlay */}
      <div className="photo-card-overlay">
        <p style={{ color:"white",fontSize:12,fontWeight:500,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{photo.name}</p>
        {photo.tags.length>0 && <p style={{ color:"rgba(255,255,255,.6)",fontSize:11 }}>#{photo.tags[0]}</p>}
        <button onClick={e=>{e.stopPropagation();onFavorite(photo.id);}}
          style={{ position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.4)",
            border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:13 }}>
          {photo.favorite?"❤️":"🤍"}
        </button>
      </div>
    </div>
  );
}
