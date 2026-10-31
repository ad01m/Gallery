"use client";
import { useState } from "react";
import { Album } from "../types";
import { verifyPin } from "../lib/storage";

const COLORS = ["#7c3aed","#a855f7","#ec4899","#f43f5e","#f97316","#eab308","#22c55e","#0ea5e9"];

interface AlbumCardProps {
  album: Album;
  coverUrl?: string;
  onClick: () => void;
  onDelete: () => void;
}

export function AlbumCard({ album, coverUrl, onClick, onDelete }: AlbumCardProps) {
  const [hovered, setHovered] = useState(false);
  const color = album.color || "#7c3aed";

  return (
    <div style={{ position:"relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="album-card" onClick={onClick}>
        <div className="album-cover" style={{ background:`linear-gradient(135deg,${color}33,${color}11)` }}>
          {coverUrl ? (
            <img src={coverUrl} alt={album.name} className="album-cover-img"/>
          ) : (
            <div className="album-cover-empty" style={{ color }}>📁</div>
          )}
          <div className="album-cover-gradient"/>
          {album.pin && <div className="album-lock">🔒</div>}
          <div style={{ position:"absolute",bottom:8,left:10,width:8,height:8,borderRadius:"50%",background:color }}/>
        </div>
        <div className="album-info">
          <div className="album-name">{album.name}</div>
          {album.description && <div style={{ color:"var(--text-muted)",fontSize:12,marginBottom:4 }}>{album.description}</div>}
          <div className="album-count">{album.photoCount} photos</div>
        </div>
      </div>
      {hovered && (
        <button onClick={e=>{e.stopPropagation();onDelete();}}
          style={{ position:"absolute",top:8,left:8,background:"rgba(239,68,68,.8)",border:"none",
            borderRadius:"50%",width:28,height:28,color:"white",cursor:"pointer",
            fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}>✕</button>
      )}
    </div>
  );
}

interface CreateAlbumModalProps {
  onClose: () => void;
  onCreate: (name: string, desc?: string, color?: string, pin?: string) => void;
}

export function CreateAlbumModal({ onClose, onCreate }: CreateAlbumModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (usePin && pin.length !== 4) return;
    onCreate(name.trim(), desc.trim()||undefined, color, usePin?pin:undefined);
    onClose();
  };

  return (
    <div className="modal-backdrop anim-fadeIn" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box anim-scaleUp">
        <h2 className="modal-title">📁 Naya Album</h2>
        <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={lbl}>Album ka naam *</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Goa Trip 2024" autoFocus/>
          </div>
          <div>
            <label style={lbl}>Description</label>
            <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional..."/>
          </div>
          <div>
            <label style={lbl}>Color</label>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginTop:8 }}>
              {COLORS.map(c => (
                <div key={c} onClick={()=>setColor(c)} style={{
                  width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",
                  border:`3px solid ${color===c?"white":"transparent"}`,
                  boxShadow:color===c?`0 0 0 2px ${c}`:undefined,transition:"all .15s",
                }}/>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <input type="checkbox" checked={usePin} onChange={e=>setUsePin(e.target.checked)}
              id="usepin" style={{ width:16,height:16,accentColor:"var(--accent)" }}/>
            <label htmlFor="usepin" style={{ color:"var(--text-secondary)",fontSize:14,cursor:"pointer" }}>🔒 PIN Protection</label>
          </div>
          {usePin && (
            <div>
              <label style={lbl}>4-digit PIN</label>
              <input className="input" type="password" maxLength={4} value={pin}
                onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="••••"/>
            </div>
          )}
          <div style={{ display:"flex",gap:10,marginTop:4 }}>
            <button type="submit" className="btn-primary" style={{ flex:1 }}
              disabled={!name.trim()||(usePin&&pin.length!==4)}>Create Album 🚀</button>
            <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PinModalProps {
  album: Album;
  onSuccess: () => void;
  onClose: () => void;
}

export function PinModal({ album, onSuccess, onClose }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pin, album.pin!)) { setError(false); onSuccess(); }
    else { setError(true); setPin(""); }
  };

  return (
    <div className="modal-backdrop anim-fadeIn" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box anim-scaleUp" style={{ textAlign:"center" }}>
        <div style={{ fontSize:48,marginBottom:12 }}>🔒</div>
        <h2 className="modal-title">{album.name}</h2>
        <p style={{ color:"var(--text-secondary)",fontSize:14,marginBottom:20 }}>PIN enter karo</p>
        <form onSubmit={verify} style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <input className="input" type="password" maxLength={4} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="••••"
            style={{ textAlign:"center",fontSize:24,letterSpacing:8 }} autoFocus/>
          {error && <p style={{ color:"var(--danger)",fontSize:13 }}>❌ Galat PIN hai!</p>}
          <div style={{ display:"flex",gap:10 }}>
            <button type="submit" className="btn-primary" style={{ flex:1 }} disabled={pin.length!==4}>Unlock 🔓</button>
            <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { color:"var(--text-muted)",fontSize:12,fontWeight:600,display:"block",marginBottom:6 };
