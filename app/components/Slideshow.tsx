"use client";

import { useEffect, useState } from "react";
import { Photo } from "../types";

interface SlideshowProps {
  photos: Photo[];
  onClose: () => void;
}

export default function Slideshow({ photos, onClose }: SlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || photos.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrent(index => (index + 1) % photos.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPlaying, photos.length]);

  useEffect(() => {
    setCurrent(index => Math.min(index, Math.max(photos.length - 1, 0)));
  }, [photos.length]);

  if (!photos.length) return null;
  const photo = photos[current];

  const next = () => setCurrent(index => (index + 1) % photos.length);
  const prev = () => setCurrent(index => (index - 1 + photos.length) % photos.length);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "black", zIndex: 2000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <button onClick={onClose} aria-label="Close slideshow" style={{ ...ssBtn, position:"absolute",top:20,right:20 }}>✕</button>
      <img
        key={photo.id}
        src={photo.url}
        alt={photo.name}
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
      />

      <div style={{ position: "absolute", bottom: "40px", display: "flex", gap: "16px", alignItems: "center" }}>
        <button onClick={prev} style={ssBtn} aria-label="Previous photo">‹</button>
        <button onClick={() => setIsPlaying(playing => !playing)} style={ssBtn} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}>{isPlaying ? "⏸" : "▶"}</button>
        <button onClick={next} style={ssBtn} aria-label="Next photo">›</button>
      </div>

      <div style={{
        position: "absolute", top: "20px", color: "rgba(255,255,255,0.5)",
        fontSize: "14px",
      }}>
        {current + 1} / {photos.length} — {photo.name}
      </div>

      <div style={{ position: "absolute", bottom: "16px", display: "flex", gap: "6px" }}>
        {photos.map((item, i) => (
          <button key={item.id} type="button" aria-label={`Show photo ${i + 1}`} onClick={() => setCurrent(i)} style={{
            width: i === current ? "20px" : "6px",
            height: "6px", border:0, padding:0, borderRadius: "3px",
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
