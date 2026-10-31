"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getPhotos, savePhotos, getAlbums, saveAlbums, getTrash, saveTrash,
  generateId, fileToDataUrl, getImageDimensions, autoTagPhoto, hashPin, requestPersistentStorage
} from "../lib/storage";
import { Photo, Album, ViewMode, SortBy, FilterBy, NavSection } from "../types";

export function useGallery() {
  const [photos,      setPhotos]      = useState<Photo[]>([]);
  const [albums,      setAlbums]      = useState<Album[]>([]);
  const [trash,       setTrash]       = useState<Photo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode,    setViewMode]    = useState<ViewMode>("masonry");
  const [sortBy,      setSortBy]      = useState<SortBy>("date");
  const [filterBy,    setFilterBy]    = useState<FilterBy>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [lightboxId,  setLightboxId]  = useState<string | null>(null);
  const [navSection,  setNavSection]  = useState<NavSection>("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error"|"info" }|null>(null);
  const init = useRef(false);

  useEffect(() => {
    if (init.current) return;
    init.current = true;
    let cancelled = false;
    void requestPersistentStorage(); // Ask the browser to protect this site's local data from automatic eviction.
    Promise.all([getPhotos(), getAlbums(), getTrash()]).then(([savedPhotos, savedAlbums, savedTrash]) => {
      if (cancelled) return;
      setPhotos(savedPhotos);
      setAlbums(savedAlbums);
      setTrash(savedTrash);
    }).catch(error => {
      console.error("Could not load the local gallery:", error);
    });
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((msg: string, type: "success"|"error"|"info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Upload ──────────────────────────────────────────
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) { showToast("Koi image nahi mili!", "error"); return; }
    setIsUploading(true); setUploadPct(0);
    const newPhotos: Photo[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        const url  = await fileToDataUrl(arr[i]);
        const dims = await getImageDimensions(url);
        newPhotos.push({
          id: generateId(), name: arr[i].name.replace(/\.[^/.]+$/, ""),
          url, thumbnailUrl: url, size: arr[i].size,
          width: dims.width, height: dims.height,
          createdAt: new Date().toISOString(),
          albumId: activeAlbumId || undefined,
          tags: autoTagPhoto(arr[i].name), favorite: false,
        });
        setUploadPct(Math.round(((i + 1) / arr.length) * 100));
      } catch { /* skip */ }
    }
    setPhotos(prev => { const u = [...newPhotos, ...prev]; savePhotos(u); return u; });
    if (activeAlbumId) {
      setAlbums(prev => {
        const u = prev.map(a => a.id === activeAlbumId ? { ...a, photoCount: a.photoCount + newPhotos.length } : a);
        saveAlbums(u); return u;
      });
    }
    setIsUploading(false);
    showToast(`${newPhotos.length} photo${newPhotos.length>1?"s":""} upload ho gaye! 🎉`);
  }, [activeAlbumId, showToast]);

  // ── Trash / Delete ──────────────────────────────────
  const moveToTrash = useCallback((ids: string[]) => {
    const now = new Date().toISOString();
    const removedFromAlbums = new Map<string, number>();
    photos.filter(photo => ids.includes(photo.id) && photo.albumId).forEach(photo => {
      const albumId = photo.albumId!;
      removedFromAlbums.set(albumId, (removedFromAlbums.get(albumId) || 0) + 1);
    });
    setPhotos(prev => {
      const trashItems = prev.filter(p => ids.includes(p.id)).map(p => ({ ...p, deletedAt: now }));
      const remaining  = prev.filter(p => !ids.includes(p.id));
      setTrash(t => { const u = [...trashItems, ...t]; saveTrash(u); return u; });
      savePhotos(remaining); return remaining;
    });
    if (removedFromAlbums.size) {
      setAlbums(prev => { const u = prev.map(album => removedFromAlbums.has(album.id) ? { ...album, photoCount: Math.max(0, album.photoCount - (removedFromAlbums.get(album.id) || 0)) } : album); saveAlbums(u); return u; });
    }
    setSelectedIds([]);
    showToast(`${ids.length} photo${ids.length>1?"s":""} Trash mein gaye 🗑️`, "info");
  }, [photos, showToast]);

  const restoreFromTrash = useCallback((ids: string[]) => {
    const restoredToAlbums = new Map<string, number>();
    trash.filter(photo => ids.includes(photo.id) && photo.albumId).forEach(photo => {
      const albumId = photo.albumId!;
      restoredToAlbums.set(albumId, (restoredToAlbums.get(albumId) || 0) + 1);
    });
    setTrash(prev => {
      const restore = prev.filter(p => ids.includes(p.id)).map(p => { const r={...p}; delete r.deletedAt; return r; });
      const remaining = prev.filter(p => !ids.includes(p.id));
      setPhotos(pp => { const u = [...restore, ...pp]; savePhotos(u); return u; });
      saveTrash(remaining); return remaining;
    });
    if (restoredToAlbums.size) {
      setAlbums(prev => { const u = prev.map(album => restoredToAlbums.has(album.id) ? { ...album, photoCount: album.photoCount + (restoredToAlbums.get(album.id) || 0) } : album); saveAlbums(u); return u; });
    }
    showToast(`${ids.length} photo${ids.length>1?"s":""} restore ho gaye ✅`);
  }, [trash, showToast]);

  const permanentDelete = useCallback((ids: string[]) => {
    setTrash(prev => { const u = prev.filter(p => !ids.includes(p.id)); saveTrash(u); return u; });
    showToast("Hamesha ke liye delete ho gaya!", "info");
  }, [showToast]);

  const emptyTrash = useCallback(() => {
    setTrash([]); saveTrash([]);
    showToast("Trash khali ho gayi!", "info");
  }, [showToast]);

  // ── Favorites ────────────────────────────────────────
  const toggleFavorite = useCallback((id: string) => {
    setPhotos(prev => { const u = prev.map(p => p.id===id ? {...p,favorite:!p.favorite} : p); savePhotos(u); return u; });
  }, []);

  // ── Update ───────────────────────────────────────────
  const updatePhoto = useCallback((id: string, updates: Partial<Photo>) => {
    setPhotos(prev => { const u = prev.map(p => p.id===id ? {...p,...updates} : p); savePhotos(u); return u; });
  }, []);

  // ── Albums ───────────────────────────────────────────
  const createAlbum = useCallback((name: string, description?: string, color?: string, pin?: string) => {
    const album: Album = {
      id: generateId(), name, description, color,
      createdAt: new Date().toISOString(), photoCount: 0,
      pin: pin ? hashPin(pin) : undefined,
    };
    setAlbums(prev => { const u = [album,...prev]; saveAlbums(u); return u; });
    showToast(`Album "${name}" bana diya! 📁`);
    return album;
  }, [showToast]);

  const deleteAlbum = useCallback((id: string) => {
    setAlbums(prev => { const u = prev.filter(a => a.id!==id); saveAlbums(u); return u; });
    setPhotos(prev => { const u = prev.map(p => p.albumId===id ? {...p,albumId:undefined} : p); savePhotos(u); return u; });
    if (activeAlbumId === id) { setActiveAlbumId(null); setNavSection("gallery"); }
    showToast("Album delete ho gaya!", "info");
  }, [activeAlbumId, showToast]);

  const updateAlbum = useCallback((id: string, updates: Partial<Album>) => {
    setAlbums(prev => { const u = prev.map(a => a.id===id ? {...a,...updates} : a); saveAlbums(u); return u; });
  }, []);

  const movePhotosToAlbum = useCallback((photoIds: string[], albumId: string | null) => {
    const moving = photos.filter(photo => photoIds.includes(photo.id));
    setPhotos(prev => { const u = prev.map(p => photoIds.includes(p.id) ? {...p, albumId: albumId || undefined} : p); savePhotos(u); return u; });
    const countChanges = new Map<string, number>();
    moving.forEach(photo => {
      if (photo.albumId && photo.albumId !== albumId) countChanges.set(photo.albumId, (countChanges.get(photo.albumId) || 0) - 1);
      if (albumId && photo.albumId !== albumId) countChanges.set(albumId, (countChanges.get(albumId) || 0) + 1);
    });
    if (countChanges.size) {
      setAlbums(prev => { const u = prev.map(album => countChanges.has(album.id) ? { ...album, photoCount: Math.max(0, album.photoCount + (countChanges.get(album.id) || 0)) } : album); saveAlbums(u); return u; });
    }
    setSelectedIds([]);
    showToast(`${moving.length} photo${moving.length>1?"s":""} move ho gaye!`);
  }, [photos, showToast]);

  // ── Selection ────────────────────────────────────────
  const toggleSelect  = useCallback((id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]), []);
  const clearSelection= useCallback(() => setSelectedIds([]), []);
  const selectAll     = useCallback((filtered: { id: string }[]) => setSelectedIds(filtered.map(p=>p.id)), []);

  // ── Filtered photos ──────────────────────────────────
  const getFilteredPhotos = useCallback(() => {
    let res = [...photos];
    if (navSection === "favorites") res = res.filter(p => p.favorite);
    else if (activeAlbumId) res = res.filter(p => p.albumId === activeAlbumId);
    else if (filterBy === "favorites") res = res.filter(p => p.favorite);
    else if (filterBy === "no-album")  res = res.filter(p => !p.albumId);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t=>t.includes(q)) || p.note?.toLowerCase().includes(q));
    }
    res.sort((a,b) => {
      if (sortBy==="name")     return a.name.localeCompare(b.name);
      if (sortBy==="size")     return b.size - a.size;
      if (sortBy==="favorite") return (b.favorite?1:0) - (a.favorite?1:0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return res;
  }, [photos, navSection, activeAlbumId, filterBy, searchQuery, sortBy]);

  // ── Lightbox nav ─────────────────────────────────────
  const navigateLightbox = useCallback((dir: "prev"|"next") => {
    const fp = getFilteredPhotos();
    const i  = fp.findIndex(p => p.id === lightboxId);
    if (i === -1) return;
    const ni = dir==="prev" ? (i-1+fp.length)%fp.length : (i+1)%fp.length;
    setLightboxId(fp[ni].id);
  }, [lightboxId, getFilteredPhotos]);

  // ── Tags ─────────────────────────────────────────────
  const getAllTags = useCallback((): {tag:string; count:number}[] => {
    const map = new Map<string,number>();
    photos.forEach(p => p.tags.forEach(t => map.set(t,(map.get(t)||0)+1)));
    return [...map.entries()].map(([tag,count]) => ({tag,count})).sort((a,b) => b.count-a.count);
  }, [photos]);

  const addTag = useCallback((photoId: string, tag: string) => {
    setPhotos(prev => {
      const u = prev.map(p => p.id===photoId && !p.tags.includes(tag) ? {...p,tags:[...p.tags,tag]} : p);
      savePhotos(u); return u;
    });
  }, []);

  const removeTag = useCallback((photoId: string, tag: string) => {
    setPhotos(prev => {
      const u = prev.map(p => p.id===photoId ? {...p,tags:p.tags.filter(t=>t!==tag)} : p);
      savePhotos(u); return u;
    });
  }, []);

  return {
    photos, albums, trash, selectedIds, viewMode, sortBy, filterBy,
    searchQuery, activeAlbumId, lightboxId, navSection, isUploading, uploadPct, toast,
    setViewMode, setSortBy, setFilterBy, setSearchQuery, setActiveAlbumId,
    setLightboxId, setNavSection, setSelectedIds, uploadFiles, moveToTrash, restoreFromTrash,
    permanentDelete, emptyTrash, toggleFavorite, updatePhoto, createAlbum,
    deleteAlbum, updateAlbum, movePhotosToAlbum, toggleSelect, clearSelection,
    selectAll, getFilteredPhotos, navigateLightbox, getAllTags, addTag, removeTag,
    getLightboxPhoto: () => photos.find(p => p.id === lightboxId) || null,
  };
}
