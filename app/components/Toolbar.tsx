"use client";

import { ViewMode, SortBy, FilterBy } from "../types";

interface ToolbarProps {
  viewMode: ViewMode;
  sortBy: SortBy;
  filterBy: FilterBy;
  searchQuery: string;
  selectedCount: number;
  totalCount: number;
  onViewMode: (v: ViewMode) => void;
  onSortBy: (s: SortBy) => void;
  onFilterBy: (f: FilterBy) => void;
  onSearch: (q: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onMoveSelected: () => void;
  onUpload: () => void;
  onSlideshow: () => void;
  showAlbums: boolean;
  onToggleAlbums: () => void;
  albumName?: string;
  onBackToAll?: () => void;
}

export default function Toolbar({
  viewMode, sortBy, filterBy, searchQuery, selectedCount, totalCount,
  onViewMode, onSortBy, onFilterBy, onSearch, onSelectAll,
  onClearSelection, onDeleteSelected, onMoveSelected, onUpload,
  onSlideshow, showAlbums, onToggleAlbums, albumName, onBackToAll,
}: ToolbarProps) {

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "12px",
      padding: "16px 0", borderBottom: "1px solid var(--border)",
      marginBottom: "20px",
    }}>
      {/* Row 1: Breadcrumb + Search + Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {albumName && onBackToAll && (
            <>
              <button onClick={onBackToAll} style={linkBtn}>All Photos</button>
              <span style={{ color: "var(--text-muted)" }}>›</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{albumName}</span>
            </>
          )}
          {!albumName && (
            <h1 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "20px" }}>
              {showAlbums ? "📁 Albums" : "🖼️ Gallery"}
            </h1>
          )}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", fontSize: "16px",
          }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search by name, tag..."
            style={{
              width: "100%", background: "var(--bg-secondary)",
              border: "1px solid var(--border)", borderRadius: "100px",
              padding: "9px 16px 9px 38px", color: "var(--text-primary)", fontSize: "14px",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearch("")}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--text-muted)",
                cursor: "pointer", fontSize: "16px",
              }}
            >✕</button>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <button onClick={onToggleAlbums} style={showAlbums ? activeBtn : ghostBtn}>
            {showAlbums ? "🖼️ Photos" : "📁 Albums"}
          </button>
          <button onClick={onSlideshow} style={ghostBtn} title="Slideshow">▶️</button>
          <button onClick={onUpload} style={primaryBtn}>+ Upload</button>
        </div>
      </div>

      {/* Row 2: Filters + View + Sort OR Selection actions */}
      {selectedCount > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: "14px" }}>
            {selectedCount} selected
          </span>
          <button onClick={onSelectAll} style={ghostBtn}>Select All ({totalCount})</button>
          <button onClick={onClearSelection} style={ghostBtn}>Clear</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <button onClick={onMoveSelected} style={ghostBtn}>📁 Move to Album</button>
            <button onClick={onDeleteSelected} style={dangerBtn}>🗑️ Delete</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Filters */}
          {!showAlbums && (
            <>
              {(["all", "favorites", "no-album"] as FilterBy[]).map(f => (
                <button
                  key={f}
                  onClick={() => onFilterBy(f)}
                  style={filterBy === f ? activeFilterBtn : ghostFilterBtn}
                >
                  {f === "all" ? "All" : f === "favorites" ? "❤️ Favorites" : "📤 No Album"}
                </button>
              ))}
              <div style={{ width: "1px", background: "var(--border)", height: "20px", margin: "0 4px" }} />
            </>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => onSortBy(e.target.value as SortBy)}
            style={selectStyle}
          >
            <option value="date">📅 Date</option>
            <option value="name">🔤 Name</option>
            <option value="size">📦 Size</option>
            <option value="favorite">❤️ Favorites first</option>
          </select>

          {/* View mode */}
          {!showAlbums && (
            <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", marginLeft: "auto" }}>
              {(["masonry", "grid", "list"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => onViewMode(v)}
                  style={{
                    ...viewBtn,
                    background: viewMode === v ? "var(--bg-hover)" : "transparent",
                    color: viewMode === v ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                  title={v}
                >
                  {v === "masonry" ? "⊞" : v === "grid" ? "⊟" : "☰"}
                </button>
              ))}
            </div>
          )}

          <span style={{ color: "var(--text-muted)", fontSize: "13px", marginLeft: "8px" }}>
            {totalCount} item{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  background: "var(--bg-secondary)", border: "1px solid var(--border)",
  color: "var(--text-secondary)", borderRadius: "8px", padding: "8px 14px",
  fontSize: "13px", cursor: "pointer", fontWeight: 500,
};
const activeBtn: React.CSSProperties = {
  ...ghostBtn, background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)",
};
const primaryBtn: React.CSSProperties = {
  background: "var(--accent)", border: "none", color: "white",
  borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
  cursor: "pointer", fontWeight: 600,
};
const dangerBtn: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444",
  color: "#ef4444", borderRadius: "8px", padding: "8px 14px",
  fontSize: "13px", cursor: "pointer",
};
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", color: "var(--accent)",
  cursor: "pointer", fontSize: "15px", fontWeight: 600, padding: 0,
};
const activeFilterBtn: React.CSSProperties = {
  background: "var(--accent-light)", border: "1px solid var(--accent)",
  color: "var(--accent)", borderRadius: "100px", padding: "5px 14px",
  fontSize: "13px", cursor: "pointer", fontWeight: 600,
};
const ghostFilterBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid var(--border)",
  color: "var(--text-secondary)", borderRadius: "100px", padding: "5px 14px",
  fontSize: "13px", cursor: "pointer",
};
const viewBtn: React.CSSProperties = {
  border: "none", padding: "7px 12px",
  fontSize: "16px", cursor: "pointer", transition: "all 0.15s",
};
const selectStyle: React.CSSProperties = {
  background: "var(--bg-secondary)", border: "1px solid var(--border)",
  color: "var(--text-secondary)", borderRadius: "8px", padding: "6px 10px",
  fontSize: "13px", cursor: "pointer",
};
