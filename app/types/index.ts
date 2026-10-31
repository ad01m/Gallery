export interface Photo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
  albumId?: string;
  tags: string[];
  favorite: boolean;
  note?: string;
  deletedAt?: string; // set when in trash
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  createdAt: string;
  photoCount: number;
  color?: string;
  pin?: string; // simple 4-digit PIN hash
}

export type ViewMode = "masonry" | "grid" | "list";
export type SortBy = "date" | "name" | "size" | "favorite";
export type FilterBy = "all" | "favorites" | "no-album";
export type NavSection = "gallery" | "favorites" | "albums" | "timeline" | "tags" | "stats" | "trash";

export interface ContextMenuState {
  x: number;
  y: number;
  photoId: string;
}
