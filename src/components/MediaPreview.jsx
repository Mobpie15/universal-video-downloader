import React, { useState } from "react";
import {
  VideoIcon,
  AudioIcon,
  DownloadIcon,
} from "./icons/Icons.jsx";

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

  return (
    <div className="animate-slideUp" style={{ marginBottom: "20px" }}>
      {/* Video Info Header */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        marginBottom: "12px",
      }}>
        {/* Thumbnail — full width 16:9 */}
        {media.thumbnail && (
          <div style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%", /* 16:9 */
            background: "#000",
            overflow: "hidden",
          }}>
            <img
              src={media.thumbnail}
              alt={media.title}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {media.duration > 0 && (
              <span style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                background: "rgba(0, 0, 0, 0.75)",
                color: "#FFF",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.02em",
              }}>
                {formatDuration(media.duration)}
              </span>
            )}
          </div>
        )}

        {/* Title & Author */}
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
            <p style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              margin: 0,
              fontWeight: 500,
            }}>
              {media.author}
            </p>
          )}
        </div>
      </div>

      {/* Format Filter — only show if both types exist */}
      {hasVideo && hasAudio && (
        <div style={{
          display: "flex",
          gap: "6px",
          marginBottom: "10px",
        }}>
          {[
            { id: "all", label: "All" },
            { id: "video", label: "Video" },
            { id: "audio", label: "Audio" },
          ].map((t) => {
            const isActive = filterType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.76rem",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--accent-muted)" : "var(--bg-elevated)",
                  color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid var(--border)",
                  transition: "all 0.15s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Format List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {filteredFormats.length > 0 ? (
          filteredFormats.map((fmt) => {
            const isDownloading = downloadingFormatId === fmt.formatId;
            const isAudioOnly = fmt.type === "audio" || !fmt.hasVideo;

            return (
              <button
                key={fmt.formatId}
                type="button"
                onClick={() => !isDownloading && onDownloadFormat(fmt)}
                disabled={isDownloading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: isDownloading ? "var(--accent-muted)" : "var(--bg-secondary)",
                  cursor: isDownloading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: isAudioOnly ? "var(--purple-muted)" : "var(--accent-muted)",
                    color: isAudioOnly ? "var(--purple)" : "var(--accent-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isAudioOnly ? <AudioIcon size={15} /> : <VideoIcon size={15} />}
                  </div>

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
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "1px" }}>
                      <span style={{
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: isAudioOnly ? "var(--purple)" : "var(--accent-light)",
                        letterSpacing: "0.03em",
                      }}>
                        {fmt.ext}
                      </span>
                      {fmt.filesize ? ` · ${formatBytes(fmt.filesize)}` : ""}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: isDownloading ? "transparent" : "var(--accent-gradient)",
                  color: isDownloading ? "var(--accent-light)" : "#FFF",
                  fontWeight: 600,
                  fontSize: "0.74rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                  boxShadow: isDownloading ? "none" : "var(--accent-glow)",
                }}>
                  <DownloadIcon size={12} />
                  <span>{isDownloading ? "..." : "Get"}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: "0.8rem",
          }}>
            No formats match this filter.
          </div>
        )}
      </div>
    </div>
  );
};
