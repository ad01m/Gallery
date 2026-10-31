"use client";

interface TopBarProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  viewMode: "masonry" | "grid" | "list";
  onViewMode: (v: "masonry" | "grid" | "list") => void;
  sortBy: string;
  onSortBy: (s: string) => void;
  rightSlot?: React.ReactNode;
}

export default function TopBar({ searchQuery, onSearch, viewMode, onViewMode, sortBy, onSortBy, rightSlot }: TopBarProps) {
  return (
    <div className="topbar">
      {/* Search */}
      <div className="search-box" style={{ flex: 1, maxWidth: 440 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 16 }}>🔍</span>
        <input
          type="text" value={searchQuery} onChange={e => onSearch(e.target.value)}
          placeholder="Search photos, tags..."
        />
        {searchQuery && (
          <button onClick={() => onSearch("")}
            style={{ background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:16 }}>✕</button>
        )}
      </div>

      {/* Sort */}
      <select value={sortBy} onChange={e => onSortBy(e.target.value)}
        style={{
          background:"var(--bg-card)",border:"1px solid var(--border-strong)",
          color:"var(--text-secondary)",borderRadius:10,padding:"8px 12px",
          fontSize:13,cursor:"pointer",outline:"none",
        }}>
        <option value="date">📅 Date</option>
        <option value="name">🔤 Name</option>
        <option value="size">📦 Size</option>
        <option value="favorite">❤️ Favorites</option>
      </select>

      {/* View toggle */}
      <div className="view-toggle">
        {(["masonry","grid","list"] as const).map(v => (
          <button key={v} className={`view-btn ${viewMode===v?"active":""}`} onClick={() => onViewMode(v)}
            title={v}>
            {v==="masonry" ? "⊞" : v==="grid" ? "⊟" : "☰"}
          </button>
        ))}
      </div>

      {rightSlot}
    </div>
  );
}
