"use client";
import { Photo } from "../types";
import { formatSize, getTotalStorageUsed } from "../lib/storage";

interface StatsViewProps {
  photos: Photo[];
  albums: { length: number };
  trash: Photo[];
}

export default function StatsView({ photos, albums, trash }: StatsViewProps) {
  const totalSize = getTotalStorageUsed(photos);
  const favCount  = photos.filter(p => p.favorite).length;
  const noAlbum   = photos.filter(p => !p.albumId).length;
  const allTags   = [...new Set(photos.flatMap(p => p.tags))];

  // Last 7 days uploads
  const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const recentCount  = photos.filter(p => p.createdAt > sevenDaysAgo).length;

  // Largest photos
  const largest = [...photos].sort((a,b) => b.size-a.size).slice(0,5);

  const stats = [
    { icon:"🖼️", value: photos.length,        label:"Total Photos"      },
    { icon:"📁", value: albums.length,          label:"Albums"            },
    { icon:"❤️", value: favCount,               label:"Favorites"         },
    { icon:"📦", value: formatSize(totalSize),  label:"Total Storage"     },
    { icon:"🆕", value: recentCount,            label:"Added This Week"   },
    { icon:"🏷️", value: allTags.length,         label:"Unique Tags"       },
    { icon:"📤", value: noAlbum,                label:"Not in Any Album"  },
    { icon:"🗑️", value: trash.length,           label:"In Trash"          },
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Largest files */}
      {largest.length > 0 && (
        <div style={{ marginTop:28 }}>
          <h3 style={{ color:"var(--text-primary)",fontWeight:700,fontSize:18,marginBottom:14 }}>📦 Largest Photos</h3>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {largest.map((p,i) => (
              <div key={p.id} style={{ display:"flex",alignItems:"center",gap:14,
                padding:"10px 14px",borderRadius:12,background:"var(--bg-card)",border:"1px solid var(--border)" }}>
                <span style={{ color:"var(--text-muted)",fontWeight:700,width:24 }}>#{i+1}</span>
                <img src={p.thumbnailUrl} alt={p.name} style={{ width:44,height:44,objectFit:"cover",borderRadius:8,flexShrink:0 }}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:"var(--text-primary)",fontWeight:500,fontSize:14,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
                  <p style={{ color:"var(--text-muted)",fontSize:12 }}>{p.width}×{p.height}</p>
                </div>
                <span style={{ color:"var(--accent-2)",fontWeight:700,fontSize:14,flexShrink:0 }}>{formatSize(p.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags breakdown */}
      {allTags.length > 0 && (
        <div style={{ marginTop:28 }}>
          <h3 style={{ color:"var(--text-primary)",fontWeight:700,fontSize:18,marginBottom:14 }}>🏷️ All Tags</h3>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {allTags.map(tag => {
              const count = photos.filter(p=>p.tags.includes(tag)).length;
              return (
                <span key={tag} className="tag" style={{ fontSize:13,padding:"5px 12px" }}>
                  {tag} <span style={{ opacity:.6 }}>({count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
