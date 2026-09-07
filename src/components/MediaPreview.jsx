import React, { useState } from "react";
import { VideoIcon, AudioIcon, DownloadIcon } from "./icons/Icons.jsx";

export const MediaPreview = ({ media, onDownloadFormat, downloadingFormatId }) => {
  const [filterType, setFilterType] = useState("all");
  if (!media) return null;

  const formatDuration = (sec) => {
    if (!sec) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formats = media.formats || [];
  const filteredFormats = formats.filter((fmt) => {
    const isAudioOnly = fmt.type === "audio" || !fmt.hasVideo;
    if (filterType === "video") return !isAudioOnly;
    if (filterType === "audio") return isAudioOnly;
    return true;
  });

  const hasVideo = formats.some(f => f.type !== "audio" && f.hasVideo);
  const hasAudio = formats.some(f => f.type === "audio" || !f.hasVideo);

  // Color based on resolution
  const getQualityColor = (label) => {
    if (!label) return "var(--accent-light)";
    const l = label.toLowerCase();
    if (l.includes("2160") || l.includes("4k")) return "#FB923C";
    if (l.includes("1440") || l.includes("1080")) return "#F472B6";
    if (l.includes("720")) return "#8B5CF6";
    if (l.includes("480") || l.includes("360")) return "#60A5FA";
    return "var(--accent-light)";
  };

  return (
    <div className="animate-slideUp" style={{ marginBottom: "20px" }}>
      {/* Video Card */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        marginBottom: "14px",
      }}>
        {/* Thumbnail */}
        {media.thumbnail && (
          <div style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            background: "#000",
            overflow: "hidden",
          }}>
            <img
              src={media.thumbnail}
              alt={media.title}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {/* Gradient overlay at bottom */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "50%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            }} />
            {/* Duration badge */}
            {media.duration > 0 && (
              <span style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(8px)",
                color: "#FFF",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "8px",
                fontFamily: "var(--font-mono)",
              }}>
                {formatDuration(media.duration)}
              </span>
            )}
            {/* Format count badge */}
            <span style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "var(--accent-gradient)",
              color: "#FFF",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "8px",
              boxShadow: "var(--accent-glow)",
            }}>
              {formats.length} formats
            </span>
          </div>
        )}

        {/* Title */}
        <div style={{ padding: "14px 16px" }}>
          <h3 style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.35,
            margin: "0 0 4px 0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {media.title}
          </h3>
          {media.author && (
            <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>
              {media.author}
            </p>
          )}
        </div>
      </div>

      {/* Filter pills */}
      {hasVideo && hasAudio && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
          {[
            { id: "all", label: "All", icon: "📦" },
            { id: "video", label: "Video", icon: "🎬" },
            { id: "audio", label: "Audio", icon: "🎵" },
          ].map((t) => {
            const isActive = filterType === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setFilterType(t.id)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "20px",
                  background: isActive ? "var(--accent-muted)" : "var(--bg-secondary)",
                  color: isActive ? "var(--accent-light)" : "var(--text-tertiary)",
                  border: `1px solid ${isActive ? "rgba(139, 92, 246, 0.3)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "0.72rem" }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Format List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filteredFormats.length > 0 ? (
          filteredFormats.map((fmt, i) => {
            const isDownloading = downloadingFormatId === fmt.formatId;
            const isAudioOnly = fmt.type === "audio" || !fmt.hasVideo;
            const qualityColor = isAudioOnly ? "var(--purple)" : getQualityColor(fmt.label || fmt.resolution);

            return (
              <button
                key={fmt.formatId}
                type="button"
                onClick={() => !isDownloading && onDownloadFormat(fmt)}
                disabled={isDownloading}
                className="animate-fadeUp"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isDownloading ? "var(--border-active)" : "var(--border)"}`,
                  background: isDownloading ? "var(--accent-muted)" : "var(--bg-secondary)",
                  cursor: isDownloading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  animationDelay: `${i * 50}ms`,
                  opacity: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  {/* Quality color bar */}
                  <div style={{
                    width: "3px",
                    height: "28px",
                    borderRadius: "3px",
                    background: qualityColor,
                    boxShadow: `0 0 8px ${qualityColor}`,
                    flexShrink: 0,
                  }} />

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {fmt.label || fmt.resolution}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", marginTop: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: qualityColor,
                        letterSpacing: "0.04em",
                        fontSize: "0.62rem",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        background: `${qualityColor}15`,
                      }}>
                        {fmt.ext}
                      </span>
                      {fmt.filesize && <span>{formatBytes(fmt.filesize)}</span>}
                    </div>
                  </div>
                </div>

                {/* Download pill */}
                <div style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: isDownloading ? "transparent" : "var(--accent-gradient)",
                  color: isDownloading ? "var(--accent-light)" : "#FFF",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                  boxShadow: isDownloading ? "none" : "var(--accent-glow)",
                  letterSpacing: "0.02em",
                }}>
                  <DownloadIcon size={12} />
                  {isDownloading ? "..." : "GET"}
                </div>
              </button>
            );
          })
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
            No formats match this filter.
          </div>
        )}
      </div>
    </div>
  );
};
