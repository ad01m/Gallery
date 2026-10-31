"use client";
import { useEffect, useState } from "react";
import { NavSection } from "../types";

interface SidebarProps {
  navSection: NavSection;
  onNav: (s: NavSection) => void;
  photoCount: number;
  albumCount: number;
  favCount: number;
  trashCount: number;
  onUpload: () => void;
}

const navItems: { id: NavSection; icon: string; label: string; badge?: keyof SidebarProps }[] = [
  { id: "gallery",   icon: "🖼️",  label: "All Photos"  },
  { id: "favorites", icon: "❤️",  label: "Favorites"   },
  { id: "albums",    icon: "📁",  label: "Albums"      },
  { id: "timeline",  icon: "📅",  label: "Timeline"    },
  { id: "tags",      icon: "🏷️", label: "Tags"        },
  { id: "stats",     icon: "📊",  label: "Stats"       },
];

export default function Sidebar({ navSection, onNav, photoCount, albumCount, favCount, trashCount, onUpload }: SidebarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("gallery-theme");
    const nextTheme = saved === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("gallery-theme", nextTheme);
  };

  const badges: Partial<Record<NavSection, number>> = {
    gallery:   photoCount,
    favorites: favCount,
    albums:    albumCount,
    trash:     trashCount,
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🖼️</div>
        <span className="sidebar-logo-text">Gallery</span>
      </div>

      {/* Main nav */}
      <p className="sidebar-section-label">Menu</p>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${navSection === item.id ? "active" : ""}`}
          onClick={() => onNav(item.id)}
        >
          <span className="nav-item-icon">{item.icon}</span>
          {item.label}
          {badges[item.id] !== undefined && badges[item.id]! > 0 && (
            <span className="nav-badge">{badges[item.id]}</span>
          )}
        </button>
      ))}

      {/* Trash */}
      <div style={{ marginTop: "8px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
        <button
          className={`nav-item ${navSection === "trash" ? "active" : ""}`}
          onClick={() => onNav("trash")}
        >
          <span className="nav-item-icon">🗑️</span>
          Trash
          {trashCount > 0 && <span className="nav-badge" style={{ background:"var(--danger-light)", color:"var(--danger)" }}>{trashCount}</span>}
        </button>
      </div>

      <button className="theme-toggle" onClick={toggleTheme} type="button">
        <span>{theme === "dark" ? "☀" : "☾"}</span>
        {theme === "dark" ? "Switch to light" : "Switch to dark"}
      </button>

      {/* Upload button */}
      <button className="sidebar-upload-btn" onClick={onUpload}>
        ↑ Upload Photos
      </button>
    </aside>
  );
}
