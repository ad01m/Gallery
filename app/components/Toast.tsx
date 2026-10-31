"use client";

interface ToastProps { message: string; type: "success"|"error"|"info"; }

export default function Toast({ message, type }: ToastProps) {
  const cfg = {
    success: { bg:"rgba(34,197,94,.12)",  border:"#22c55e", icon:"✅" },
    error:   { bg:"rgba(239,68,68,.12)", border:"#ef4444", icon:"❌" },
    info:    { bg:"rgba(124,58,237,.12)",border:"#7c3aed", icon:"💡" },
  }[type];
  return (
    <div className="anim-slideR" style={{
      position:"fixed",bottom:24,right:24,zIndex:9999,
      background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:14,
      padding:"12px 18px",display:"flex",alignItems:"center",gap:10,
      backdropFilter:"blur(12px)",maxWidth:320,
      boxShadow:"0 8px 32px rgba(0,0,0,.4)",
    }}>
      <span style={{ fontSize:16 }}>{cfg.icon}</span>
      <p style={{ color:"var(--text-primary)",fontSize:14,fontWeight:500 }}>{message}</p>
    </div>
  );
}
