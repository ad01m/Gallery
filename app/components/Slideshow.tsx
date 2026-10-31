"use client";

import { useState } from "react";
import { Photo } from "../types";

interface SlideshowProps {
  photos: Photo[];
  onClose: () => void;
}

export default function Slideshow({ photos, onClose }: SlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [interval, setIntervalState] = useState<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent(c => (c + 1) % photos.length);
  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length);

  const togglePlay = () => {
    if (isPlaying) {
      if (interval) clearInterval(interval);
      setIntervalState(null);
    } else {
      const iv = setInterval(() => setCurrent(c => (c + 1) % photos.length), 3000);
      setIntervalState(iv);
    }
    setIsPlaying(!isPlaying);
  };

  useState(() => {
    const iv = setInterval(next, 3000);
    setIntervalState(iv);
    return () => clearInterval(iv);
  });

  if (!photos.length) return null;
  const photo = photos[current];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "black", zIndex: 2000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <img
        key={photo.id}
        src={photo.url}
        alt={photo.name}
        className="animate-scaleIn"
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
      />

      <div style={{ position: "absolute", bottom: "40px", display: "flex", gap: "16px", alignItems: "center" }}>
        <button onClick={prev} style={ssBtn}>‹</button>
        <button onClick={togglePlay} style={ssBtn}>{isPlaying ? "⏸" : "▶"}</button>
        <button onClick={next} style={ssBtn}>›</button>
        <button onClick={onClose} style={{ ...ssBtn, marginLeft: "20px" }}>✕ Exit</button>
      </div>

      <div style={{
        position: "absolute", top: "20px", color: "rgba(255,255,255,0.5)",
        fontSize: "14px",
      }}>
        {current + 1} / {photos.length} — {photo.name}
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: "16px", display: "flex", gap: "6px" }}>
        {photos.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? "20px" : "6px",
            height: "6px", borderRadius: "3px",
            background: i === current ? "white" : "rgba(255,255,255,0.3)",
            cursor: "pointer", transition: "all 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

const ssBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
  color: "white", borderRadius: "10px", padding: "10px 20px",
  fontSize: "18px", cursor: "pointer", backdropFilter: "blur(10px)",
};
