import { Photo, Album } from "../types";

const PHOTOS_KEY  = "gal_photos";
const ALBUMS_KEY  = "gal_albums";
const TRASH_KEY   = "gal_trash";

// ── Photos ────────────────────────────────────────────
export function getPhotos(): Photo[] {
  try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "[]"); } catch { return []; }
}
export function savePhotos(p: Photo[]) {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(p));
}

// ── Albums ────────────────────────────────────────────
export function getAlbums(): Album[] {
  try { return JSON.parse(localStorage.getItem(ALBUMS_KEY) || "[]"); } catch { return []; }
}
export function saveAlbums(a: Album[]) {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(a));
}

// ── Trash ─────────────────────────────────────────────
export function getTrash(): Photo[] {
  try { return JSON.parse(localStorage.getItem(TRASH_KEY) || "[]"); } catch { return []; }
}
export function saveTrash(t: Photo[]) {
  localStorage.setItem(TRASH_KEY, JSON.stringify(t));
}

// ── Helpers ───────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

export function formatMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month:"long", year:"numeric" });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target?.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise(res => {
    const img = new Image();
    img.onload  = () => res({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => res({ width: 0, height: 0 });
    img.src = url;
  });
}

export function autoTagPhoto(name: string): string[] {
  const lower = name.toLowerCase();
  const map: Record<string, string[]> = {
    selfie: ["selfie","portrait"],
    sunset: ["sunset","sky","nature"],
    beach:  ["beach","ocean","travel"],
    mountain:["mountain","nature","travel"],
    food:   ["food"],
    birthday:["birthday","celebration"],
    wedding:["wedding","celebration"],
    family: ["family","people"],
    dog:    ["dog","pet"],
    cat:    ["cat","pet"],
    travel: ["travel"],
    screenshot:["screenshot"],
    night:  ["night","dark"],
    snow:   ["snow","winter"],
    flower: ["flower","nature"],
  };
  const tags: string[] = [];
  for (const [k, v] of Object.entries(map)) if (lower.includes(k)) tags.push(...v);
  return [...new Set(tags)];
}

export function getTotalStorageUsed(photos: Photo[]): number {
  return photos.reduce((acc, p) => acc + p.size, 0);
}

export function hashPin(pin: string): string {
  // Simple encode - not cryptographically secure but functional
  return btoa(pin + "_gallery_pin");
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

export async function exportAsZip(photos: Photo[]): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folder = zip.folder("gallery-export")!;
  for (const photo of photos) {
    try {
      // Extract base64 from data URL
      const base64 = photo.url.split(",")[1];
      const ext = photo.url.split(";")[0].split("/")[1] || "jpg";
      folder.file(`${photo.name}.${ext}`, base64, { base64: true });
    } catch { /* skip */ }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `gallery-${Date.now()}.zip`; a.click();
  URL.revokeObjectURL(url);
}
