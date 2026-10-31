import { Photo, Album } from "../types";

const DB_NAME = "gallery-private-db";
const DB_VERSION = 1;
const STORE_NAME = "gallery-data";
const LEGACY_KEYS = { photos: "gal_photos", albums: "gal_albums", trash: "gal_trash" } as const;

type Collection = keyof typeof LEGACY_KEYS;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local photo storage."));
  });
}

async function readCollection<T>(key: Collection): Promise<T> {
  try {
    const db = await openDatabase();
    const value = await new Promise<T | undefined>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (value !== undefined) return value;

    // One-time migration from the older localStorage-based version.
    const legacy = typeof localStorage !== "undefined" ? localStorage.getItem(LEGACY_KEYS[key]) : null;
    const migrated = legacy ? JSON.parse(legacy) as T : [] as T;
    if (legacy) {
      await writeCollection(key, migrated);
      localStorage.removeItem(LEGACY_KEYS[key]);
    }
    return migrated;
  } catch (error) {
    console.error("Gallery local storage read failed:", error);
    try {
      return (JSON.parse(localStorage.getItem(LEGACY_KEYS[key]) || "[]") as T);
    } catch {
      return [] as T;
    }
  }
}

async function writeCollectionStrict<T>(key: Collection, value: T): Promise<void> {
  let db: IDBDatabase | undefined;
  try {
    db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Storage transaction aborted."));
    });
    if (typeof localStorage !== "undefined") localStorage.removeItem(LEGACY_KEYS[key]);
  } catch (error) {
    console.error("Gallery could not save data locally:", error);
    try {
      if (typeof localStorage === "undefined") throw error;
      localStorage.setItem(LEGACY_KEYS[key], JSON.stringify(value));
    } catch {
      throw new Error("Photo storage is full or unavailable. Try fewer/smaller photos, or free browser storage space.");
    }
  } finally {
    db?.close();
  }
}

async function writeCollection<T>(key: Collection, value: T): Promise<void> {
  try { await writeCollectionStrict(key, value); }
  catch (error) { console.error("Gallery could not save data locally:", error); }
}

export const getPhotos = () => readCollection<Photo[]>("photos");
export const savePhotos = (photos: Photo[]) => writeCollection("photos", photos);
export const savePhotosStrict = (photos: Photo[]) => writeCollectionStrict("photos", photos);
export const getAlbums = () => readCollection<Album[]>("albums");
export const saveAlbums = (albums: Album[]) => writeCollection("albums", albums);
export const getTrash = () => readCollection<Photo[]>("trash");
export const saveTrash = (trash: Photo[]) => writeCollection("trash", trash);

export async function getLocalStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    if (!navigator.storage?.estimate) return null;
    const estimate = await navigator.storage.estimate();
    return { usage: estimate.usage || 0, quota: estimate.quota || 0 };
  } catch {
    return null;
  }
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

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
    selfie: ["selfie","portrait"], sunset: ["sunset","sky","nature"],
    beach: ["beach","ocean","travel"], mountain:["mountain","nature","travel"],
    food:["food"], birthday:["birthday","celebration"], wedding:["wedding","celebration"],
    family:["family","people"], dog:["dog","pet"], cat:["cat","pet"], travel:["travel"],
    screenshot:["screenshot"], night:["night","dark"], snow:["snow","winter"],
    flower:["flower","nature"],
  };
  const tags: string[] = [];
  for (const [k, v] of Object.entries(map)) if (lower.includes(k)) tags.push(...v);
  return [...new Set(tags)];
}

export function getTotalStorageUsed(photos: Photo[]): number {
  return photos.reduce((acc, p) => acc + p.size, 0);
}

export function hashPin(pin: string): string {
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
