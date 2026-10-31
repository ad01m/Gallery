"use client";
import { useState, useEffect, useRef } from "react";
import { Photo } from "../types";

interface PhotoEditorProps {
  photo: Photo;
  onSave: (editedUrl: string) => void;
  onClose: () => void;
}

export default function PhotoEditor({ photo, onSave, onClose }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast,   setContrast]   = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation,   setRotation]   = useState(0);
  const [flipH,      setFlipH]      = useState(false);
  const [flipV,      setFlipV]      = useState(false);
  const [saving,     setSaving]     = useState(false);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const isRotated = rotation === 90 || rotation === 270;
      canvas.width  = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width  : img.height;
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, -img.width/2, -img.height/2);
      ctx.restore();
    };
    img.src = photo.url;
  };

  useEffect(() => { draw(); }, [brightness, contrast, saturation, rotation, flipH, flipV]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const url = canvasRef.current?.toDataURL("image/jpeg", 0.92) || photo.url;
      onSave(url);
      setSaving(false);
    }, 100);
  };

  const reset = () => { setBrightness(100); setContrast(100); setSaturation(100); setRotation(0); setFlipH(false); setFlipV(false); };

  return (
    <div className="anim-fadeIn" style={{
      position:"fixed",inset:0,zIndex:1500,
      background:"var(--bg-base)",display:"flex",flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",
        borderBottom:"1px solid var(--border)",background:"var(--bg-sidebar)" }}>
        <button onClick={onClose} className="btn-ghost">✕ Close</button>
        <h2 style={{ color:"var(--text-primary)",fontWeight:700,flex:1,fontSize:16 }}>✏️ Edit: {photo.name}</h2>
        <button onClick={reset} className="btn-ghost">↺ Reset</button>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "💾 Save"}
        </button>
      </div>

      {/* Content */}
      <div style={{ display:"flex",flex:1,overflow:"hidden" }}>
        {/* Canvas preview */}
        <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
          background:"#000",overflow:"hidden",padding:20 }}>
          <canvas ref={canvasRef} style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:8 }} />
        </div>

        {/* Controls */}
        <div className="editor-controls">
          <h3 style={{ color:"var(--text-primary)",fontWeight:700,marginBottom:4 }}>Adjustments</h3>

          <Slider label="☀️ Brightness" value={brightness} min={0} max={200} onChange={setBrightness}/>
          <Slider label="◑ Contrast"   value={contrast}   min={0} max={200} onChange={setContrast}/>
          <Slider label="🎨 Saturation" value={saturation} min={0} max={200} onChange={setSaturation}/>

          <div style={{ borderTop:"1px solid var(--border)",paddingTop:14,marginTop:4 }}>
            <h3 style={{ color:"var(--text-primary)",fontWeight:700,marginBottom:12 }}>Transform</h3>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <button className="btn-ghost" style={{ flex:1,fontSize:12 }} onClick={()=>setRotation(r=>(r-90+360)%360)}>↺ Rotate L</button>
              <button className="btn-ghost" style={{ flex:1,fontSize:12 }} onClick={()=>setRotation(r=>(r+90)%360)}>↻ Rotate R</button>
              <button className={`btn-ghost ${flipH?"btn-icon active":""}`} style={{ flex:1,fontSize:12 }} onClick={()=>setFlipH(f=>!f)}>⇔ Flip H</button>
              <button className={`btn-ghost ${flipV?"btn-icon active":""}`} style={{ flex:1,fontSize:12 }} onClick={()=>setFlipV(f=>!f)}>⇕ Flip V</button>
            </div>
            <div style={{ marginTop:12,padding:"10px 12px",background:"var(--bg-card)",borderRadius:10,fontSize:12,color:"var(--text-muted)" }}>
              Rotation: {rotation}° {flipH?"| H-Flipped":""} {flipV?"| V-Flipped":""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label:string; value:number; min:number; max:number; onChange:(v:number)=>void }) {
  return (
    <div>
      <div className="slider-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}
