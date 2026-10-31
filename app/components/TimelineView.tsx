"use client";
import { Photo } from "../types";
import { formatMonthYear } from "../lib/storage";
import PhotoCard from "./PhotoCard";

interface TimelineViewProps {
  photos: Photo[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFavorite: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
}

export default function TimelineView({ photos, selectedIds, onSelect, onOpen, onFavorite, onContextMenu }: TimelineViewProps) {
  // Group by month-year
  const groups: Record<string, Photo[]> = {};
  photos.forEach(p => {
    const key = formatMonthYear(p.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  if (Object.keys(groups).length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <h2 className="empty-title">Koi photos nahi</h2>
        <p className="empty-sub">Upload karo to timeline dikhegi</p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groups).map(([month, groupPhotos]) => (
        <div key={month} className="timeline-group">
          <div className="timeline-header">
            <h2 className="timeline-label">{month}</h2>
            <span className="timeline-count">{groupPhotos.length} photos</span>
          </div>
          <div className="masonry">
            {groupPhotos.map(photo => (
              <PhotoCard
                key={photo.id} photo={photo}
                isSelected={selectedIds.includes(photo.id)}
                selectionMode={selectedIds.length > 0}
                onSelect={onSelect} onOpen={onOpen} onFavorite={onFavorite}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
