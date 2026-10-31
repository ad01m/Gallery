"use client";
import { useState } from "react";
import { Photo } from "../types";

interface TagManagerProps {
  photos: Photo[];
  allTags: { tag: string; count: number }[];
  onAddTag: (photoId: string, tag: string) => void;
  onRemoveTag: (photoId: string, tag: string) => void;
}

export default function TagManager({ photos, allTags, onAddTag, onRemoveTag }: TagManagerProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

  const taggedPhotos = selectedTag ? photos.filter(p => p.tags.includes(selectedTag)) : [];

  return (
    <div style={{ display:"flex",gap:24,minHeight:400 }}>
      {/* Tag list */}
      <div style={{ width:220,flexShrink:0 }}>
        <h3 style={{ color:"var(--text-primary)",fontWeight:700,marginBottom:14,fontSize:16 }}>All Tags</h3>
        {allTags.length === 0 ? (
          <p style={{ color:"var(--text-muted)",fontSize:13 }}>Abhi koi tags nahi hain</p>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
            {allTags.map(({tag,count}) => (
              <button key={tag}
                className={`nav-item ${selectedTag===tag?"active":""}`}
                onClick={() => setSelectedTag(t => t===tag ? null : tag)}
                style={{ justifyContent:"space-between" }}
              >
                <span>🏷️ {tag}</span>
                <span className="nav-badge">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag photos */}
      <div style={{ flex:1 }}>
        {selectedTag ? (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap" }}>
              <span className="tag" style={{ fontSize:14,padding:"6px 14px" }}>#{selectedTag}</span>
              <span style={{ color:"var(--text-muted)",fontSize:13 }}>{taggedPhotos.length} photos</span>
            </div>
            <form onSubmit={e=>{e.preventDefault();const tag=newTag.trim().toLowerCase().replace(/^#/,"");if(!tag)return;taggedPhotos.forEach(photo=>onAddTag(photo.id,tag));setNewTag("");}} style={{ display:"flex",gap:8,marginBottom:16,maxWidth:440 }}>
              <input className="input" value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="New tag for these photos..."/>
              <button className="btn-primary" type="submit" disabled={!newTag.trim()}>Add Tag</button>
            </form>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10 }}>
              {taggedPhotos.map(photo => (
                <div key={photo.id} style={{ borderRadius:12,overflow:"hidden",background:"var(--bg-card)",
                  border:"1px solid var(--border)",position:"relative" }}>
                  <img src={photo.thumbnailUrl} alt={photo.name} style={{ width:"100%",height:110,objectFit:"cover",display:"block" }}/>
                  <div style={{ padding:"8px 10px" }}>
                    <p style={{ color:"var(--text-primary)",fontSize:12,fontWeight:500,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{photo.name}</p>
                    <button onClick={() => onRemoveTag(photo.id, selectedTag)}
                      style={{ marginTop:6,background:"var(--danger-light)",border:"1px solid var(--danger)",
                        color:"var(--danger)",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,width:"100%" }}>
                      Remove Tag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <h2 className="empty-title">Tag select karo</h2>
            <p className="empty-sub">Left mein tag click karo to us tag wale photos dekho</p>
          </div>
        )}
      </div>
    </div>
  );
}
