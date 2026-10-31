"use client";
import { useState, useCallback } from "react";
import { useGallery } from "./hooks/useGallery";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PhotoCard from "./components/PhotoCard";
import { AlbumCard, CreateAlbumModal, PinModal } from "./components/AlbumCard";
import Lightbox from "./components/Lightbox";
import PhotoEditor from "./components/PhotoEditor";
import TimelineView from "./components/TimelineView";
import TrashView from "./components/TrashView";
import StatsView from "./components/StatsView";
import TagManager from "./components/TagManager";
import SelectionBar from "./components/SelectionBar";
import ContextMenu from "./components/ContextMenu";
import UploadModal from "./components/UploadModal";
import Toast from "./components/Toast";
import Slideshow from "./components/Slideshow";
import { Album, ContextMenuState } from "./types";
import { exportAsZip } from "./lib/storage";

export default function Home() {
  const g = useGallery();
  const [showUpload,       setShowUpload]       = useState(false);
  const [showCreateAlbum,  setShowCreateAlbum]  = useState(false);
  const [showMoveModal,    setShowMoveModal]     = useState(false);
  const [showSlideshow,    setShowSlideshow]     = useState(false); // future
  const [ctxMenu,          setCtxMenu]           = useState<ContextMenuState | null>(null);
  const [editingPhoto,     setEditingPhoto]      = useState<string | null>(null);
  const [pinAlbum,         setPinAlbum]          = useState<Album | null>(null);
  const [unlockedAlbums,   setUnlockedAlbums]    = useState<string[]>([]);

  const filteredPhotos = g.getFilteredPhotos();
  const lightboxPhoto  = g.getLightboxPhoto();
  const allTags        = g.getAllTags();
  const activeAlbum    = g.albums.find(a => a.id === g.activeAlbumId);
  const editPhoto      = g.photos.find(p => p.id === editingPhoto) || null;

  const getAlbumCover = useCallback((album: Album) => {
    const first = g.photos.find(p => p.albumId === album.id);
    return first?.thumbnailUrl;
  }, [g.photos]);

  const handleAlbumClick = (album: Album) => {
    if (album.pin && !unlockedAlbums.includes(album.id)) {
      setPinAlbum(album);
    } else {
      g.setActiveAlbumId(album.id);
      g.setNavSection("gallery");
    }
  };

  const handleCtxMenu = (e: React.MouseEvent, photoId: string) => {
    setCtxMenu({ x: e.clientX, y: e.clientY, photoId });
  };

  const ctxPhoto = ctxMenu ? g.photos.find(p => p.id === ctxMenu.photoId) : null;

  const handleDownload = (photoId: string) => {
    const photo = g.photos.find(p => p.id === photoId);
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo.url; a.download = photo.name; a.click();
  };

  const handleExportSelected = async () => {
    const selected = g.photos.filter(p => g.selectedIds.includes(p.id));
    if (!selected.length) return;
    await exportAsZip(selected);
    g.clearSelection();
  };

  const handleFavoriteSelected = () => {
    g.selectedIds.forEach(id => g.toggleFavorite(id));
    g.clearSelection();
  };

  const pageTitle: Record<string, string> = {
    gallery:   "All Photos",
    favorites: "❤️ Favorites",
    albums:    "📁 Albums",
    timeline:  "📅 Timeline",
    tags:      "🏷️ Tag Manager",
    stats:     "📊 Stats",
    trash:     "🗑️ Trash",
  };

  const lightboxIdx = filteredPhotos.findIndex(p => p.id === g.lightboxId);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        navSection={g.navSection}
        onNav={(s) => { g.setNavSection(s); g.setActiveAlbumId(null); g.clearSelection(); }}
        photoCount={g.photos.length}
        albumCount={g.albums.length}
        favCount={g.photos.filter(p => p.favorite).length}
        trashCount={g.trash.length}
        onUpload={() => setShowUpload(true)}
      />

      {/* Main */}
      <div className="main-content">
        {/* TopBar */}
        {(g.navSection === "gallery" || g.navSection === "favorites" || g.navSection === "timeline") && (
          <TopBar
            searchQuery={g.searchQuery}
            onSearch={g.setSearchQuery}
            viewMode={g.viewMode}
            onViewMode={g.setViewMode}
            sortBy={g.sortBy}
            onSortBy={(s) => g.setSortBy(s as never)}
          />
        )}

        {/* Upload progress bar */}
        {g.isUploading && (
          <div style={{ position:"fixed",top:0,left:"var(--sidebar-w)",right:0,height:3,zIndex:9999,background:"var(--bg-active)" }}>
            <div style={{ height:"100%",background:"var(--gradient)",width:`${g.uploadPct}%`,transition:"width .3s" }}/>
          </div>
        )}

        <div className="page">
          {/* Page header */}
          <div className="page-header">
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              {activeAlbum && g.navSection === "gallery" && (
                <>
                  <button className="btn-ghost" style={{ fontSize:13 }}
                    onClick={() => { g.setActiveAlbumId(null); g.setNavSection("albums"); }}>
                    ← Albums
                  </button>
                  <span style={{ color:"var(--text-muted)" }}>›</span>
                </>
              )}
              <h1 className="page-title">
                {activeAlbum && g.navSection === "gallery" ? activeAlbum.name : pageTitle[g.navSection]}
              </h1>
            </div>

            {/* Actions per section */}
            {g.navSection === "gallery" && !activeAlbum && (
              <div className="filter-chips">
                {(["all","favorites","no-album"] as const).map(f => (
                  <button key={f} className={`chip ${g.filterBy===f?"active":""}`} onClick={() => g.setFilterBy(f)}>
                    {f==="all"?"All":f==="favorites"?"❤️ Favorites":"📤 No Album"}
                  </button>
                ))}
              </div>
            )}

            {g.navSection === "albums" && (
              <button className="btn-primary" onClick={() => setShowCreateAlbum(true)}>+ New Album</button>
            )}
            {(g.navSection === "gallery" || g.navSection === "favorites") && filteredPhotos.length > 0 && (
              <button className="btn-ghost" onClick={() => setShowSlideshow(true)}>▶ Slideshow</button>
            )}
          </div>

          {/* ── GALLERY / FAVORITES ─────────────────────────────────────────── */}
          {(g.navSection === "gallery" || g.navSection === "favorites") && (
            <>
              {filteredPhotos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{g.searchQuery ? "🔍" : g.navSection==="favorites" ? "❤️" : "📸"}</div>
                  <h2 className="empty-title">
                    {g.searchQuery ? "Koi result nahi mila" : g.navSection==="favorites" ? "Koi favorites nahi" : "Gallery khali hai!"}
                  </h2>
                  <p className="empty-sub">
                    {g.searchQuery ? `"${g.searchQuery}" ke liye kuch nahi mila` : g.navSection==="favorites" ? "Photos pe ❤️ tap karo favorites mein add karne ke liye" : "Upar Upload button se photos add karo"}
                  </p>
                  {!g.searchQuery && g.navSection==="gallery" && (
                    <button className="btn-primary" style={{ marginTop:8 }} onClick={() => setShowUpload(true)}>
                      📤 Upload Karo
                    </button>
                  )}
                </div>
              ) : g.viewMode === "masonry" ? (
                <div className="masonry">
                  {filteredPhotos.map(p => (
                    <PhotoCard key={p.id} photo={p}
                      isSelected={g.selectedIds.includes(p.id)}
                      selectionMode={g.selectedIds.length > 0}
                      onSelect={g.toggleSelect} onOpen={g.setLightboxId}
                      onFavorite={g.toggleFavorite} onContextMenu={handleCtxMenu}/>
                  ))}
                </div>
              ) : g.viewMode === "grid" ? (
                <div className="grid-view">
                  {filteredPhotos.map(p => (
                    <PhotoCard key={p.id} photo={p} viewMode="grid"
                      isSelected={g.selectedIds.includes(p.id)}
                      selectionMode={g.selectedIds.length > 0}
                      onSelect={g.toggleSelect} onOpen={g.setLightboxId}
                      onFavorite={g.toggleFavorite} onContextMenu={handleCtxMenu}/>
                  ))}
                </div>
              ) : (
                <div>
                  {filteredPhotos.map(p => (
                    <PhotoCard key={p.id} photo={p} viewMode="list"
                      isSelected={g.selectedIds.includes(p.id)}
                      selectionMode={g.selectedIds.length > 0}
                      onSelect={g.toggleSelect} onOpen={g.setLightboxId}
                      onFavorite={g.toggleFavorite} onContextMenu={handleCtxMenu}/>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ALBUMS ──────────────────────────────────────────────────────── */}
          {g.navSection === "albums" && (
            g.albums.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h2 className="empty-title">Koi album nahi</h2>
                <p className="empty-sub">Photos ko organize karne ke liye albums banao</p>
                <button className="btn-primary" style={{ marginTop:8 }} onClick={() => setShowCreateAlbum(true)}>+ New Album</button>
              </div>
            ) : (
              <div className="albums-grid">
                {g.albums.map(album => (
                  <AlbumCard key={album.id} album={album}
                    coverUrl={getAlbumCover(album)}
                    onClick={() => handleAlbumClick(album)}
                    onDelete={() => { if (confirm(`"${album.name}" delete karna chahte ho?`)) g.deleteAlbum(album.id); }}/>
                ))}
              </div>
            )
          )}

          {/* ── TIMELINE ────────────────────────────────────────────────────── */}
          {g.navSection === "timeline" && (
            <TimelineView photos={filteredPhotos} selectedIds={g.selectedIds}
              onSelect={g.toggleSelect} onOpen={g.setLightboxId}
              onFavorite={g.toggleFavorite} onContextMenu={handleCtxMenu}/>
          )}

          {/* ── TAGS ────────────────────────────────────────────────────────── */}
          {g.navSection === "tags" && (
            <TagManager photos={g.photos} allTags={allTags}
              onAddTag={g.addTag} onRemoveTag={g.removeTag}/>
          )}

          {/* ── STATS ───────────────────────────────────────────────────────── */}
          {g.navSection === "stats" && (
            <StatsView photos={g.photos} albums={g.albums} trash={g.trash}/>
          )}

          {/* ── TRASH ───────────────────────────────────────────────────────── */}
          {g.navSection === "trash" && (
            <TrashView trash={g.trash}
              onRestore={g.restoreFromTrash}
              onPermanentDelete={g.permanentDelete}
              onEmptyTrash={g.emptyTrash}/>
          )}
        </div>
      </div>

      {/* ── Selection Bar ────────────────────────────────────────────────── */}
      <SelectionBar
        count={g.selectedIds.length}
        total={filteredPhotos.length}
        onSelectAll={() => g.selectAll(filteredPhotos)}
        onClear={g.clearSelection}
        onDelete={() => g.moveToTrash(g.selectedIds)}
        onMove={() => setShowMoveModal(true)}
        onExport={handleExportSelected}
        onFavorite={handleFavoriteSelected}
      />

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto} total={filteredPhotos.length} current={lightboxIdx}
          onClose={() => g.setLightboxId(null)}
          onPrev={() => g.navigateLightbox("prev")}
          onNext={() => g.navigateLightbox("next")}
          onFavorite={g.toggleFavorite}
          onUpdateNote={(id, note) => g.updatePhoto(id, { note })}
          onEdit={(photo) => { g.setLightboxId(null); setEditingPhoto(photo.id); }}/>
      )}

      {/* ── Photo Editor ─────────────────────────────────────────────────── */}
      {editPhoto && (
        <PhotoEditor
          photo={editPhoto}
          onSave={(url) => { g.updatePhoto(editPhoto.id, { url, thumbnailUrl: url }); setEditingPhoto(null); }}
          onClose={() => setEditingPhoto(null)}/>
      )}

      {/* ── Context Menu ─────────────────────────────────────────────────── */}
      {ctxMenu && ctxPhoto && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          isFavorite={ctxPhoto.favorite}
          onClose={() => setCtxMenu(null)}
          onOpen={() => g.setLightboxId(ctxMenu.photoId)}
          onFavorite={() => g.toggleFavorite(ctxMenu.photoId)}
          onMoveToAlbum={() => { g.toggleSelect(ctxMenu.photoId); setShowMoveModal(true); }}
          onMoveToTrash={() => g.moveToTrash([ctxMenu.photoId])}
          onDownload={() => handleDownload(ctxMenu.photoId)}
          onEdit={() => setEditingPhoto(ctxMenu.photoId)}/>
      )}

      {/* ── Upload Modal ─────────────────────────────────────────────────── */}
      {showUpload && (
        <UploadModal onUpload={g.uploadFiles} onClose={() => setShowUpload(false)} disabled={g.isUploading}/>
      )}

      {/* ── Create Album ─────────────────────────────────────────────────── */}
      {showCreateAlbum && (
        <CreateAlbumModal onClose={() => setShowCreateAlbum(false)} onCreate={g.createAlbum}/>
      )}

      {/* ── Move to Album Modal ───────────────────────────────────────────── */}
      {showMoveModal && (
        <div className="modal-backdrop anim-fadeIn" onClick={e=>e.target===e.currentTarget&&setShowMoveModal(false)}>
          <div className="modal-box anim-scaleUp">
            <h2 className="modal-title">📁 Album mein Move Karo</h2>
            <div style={{ display:"flex",flexDirection:"column",gap:8,maxHeight:300,overflowY:"auto" }}>
              <button onClick={()=>{g.movePhotosToAlbum(g.selectedIds,null);setShowMoveModal(false);}}
                style={moveBtn}>📤 No Album (Remove)</button>
              {g.albums.map(a => (
                <button key={a.id} onClick={()=>{g.movePhotosToAlbum(g.selectedIds,a.id);setShowMoveModal(false);}}
                  style={moveBtn}>📁 {a.name}</button>
              ))}
              {g.albums.length===0 && <p style={{ color:"var(--text-muted)",textAlign:"center",padding:20 }}>Pehle ek album banao!</p>}
            </div>
            <button className="btn-ghost" style={{ width:"100%",marginTop:14 }} onClick={() => setShowMoveModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── PIN Modal ────────────────────────────────────────────────────── */}
      {pinAlbum && (
        <PinModal album={pinAlbum}
          onSuccess={() => {
            setUnlockedAlbums(u => [...u, pinAlbum.id]);
            g.setActiveAlbumId(pinAlbum.id);
            g.setNavSection("gallery");
            setPinAlbum(null);
          }}
          onClose={() => setPinAlbum(null)}/>
      )}

      {/* ── Slideshow ───────────────────────────────────────────────────── */}
      {showSlideshow && <Slideshow photos={filteredPhotos} onClose={() => setShowSlideshow(false)}/>}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {g.toast && <Toast message={g.toast.msg} type={g.toast.type}/>}
    </div>
  );
}

const moveBtn: React.CSSProperties = {
  width:"100%",padding:"11px 14px",background:"var(--bg-card)",
  border:"1px solid var(--border)",borderRadius:10,color:"var(--text-primary)",
  cursor:"pointer",textAlign:"left",fontSize:14,transition:"background .15s",
};
