import React, { useState } from "react";
import {
  VideoIcon,
  AudioIcon,
  DownloadIcon,
  PlatformYouTubeIcon,
  PlatformInstagramIcon,
  PlatformTikTokIcon,
  PlatformFacebookIcon,
  PlatformTwitterIcon,
  PlatformGenericIcon,
} from "./icons/Icons.jsx";

export const MediaPreview = ({ media, onDownloadFormat, downloadingFormatId }) => {
  const [filterType, setFilterType] = useState("all"); // "all" | "video" | "audio"

  if (!media) return null;

  const formatDuration = (sec) => {
    if (!sec) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case "youtube": return <PlatformYouTubeIcon size={13} />;
      case "instagram": return <PlatformInstagramIcon size={13} />;
      case "tiktok": return <PlatformTikTokIcon size={13} />;
      case "facebook": return <PlatformFacebookIcon size={13} />;
      case "twitter": return <PlatformTwitterIcon size={13} />;
      default: return <PlatformGenericIcon size={13} />;
    }
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

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: "16px",
        padding: "14px",
        marginBottom: "16px",
        border: "1px solid rgba(56, 189, 248, 0.22)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Compact Video Metadata Header (Horizontal Split) */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "116px",
              height: "65px",
              flexShrink: 0,
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#0B0F19",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <img
              src={media.thumbnail}
              alt={media.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {media.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  background: "rgba(6, 9, 15, 0.88)",
                  backdropFilter: "blur(6px)",
                  color: "#FFFFFF",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "5px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "2px 6px",
                borderRadius: "5px",
                background: "rgba(6, 9, 15, 0.85)",
                color: "#FFFFFF",
                fontSize: "0.64rem",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {getPlatformIcon(media.platform)}
            </div>
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.3,
              margin: "0 0 4px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={media.title}
          >
            {media.title}
          </h3>

          {media.author && (
            <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
              By <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{media.author}</span>
            </p>
          )}
        </div>
      </div>

      {/* Compact Format Filter Tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "10px",
          padding: "3px",
          marginBottom: "10px",
          gap: "3px",
        }}
      >
        {[
          { id: "all", label: "All Formats" },
          { id: "video", label: "Video (MP4)" },
          { id: "audio", label: "Audio (MP3)" },
        ].map((t) => {
          const isActive = filterType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterType(t.id)}
              style={{
                flex: 1,
                padding: "5px 4px",
                fontSize: "0.74rem",
                fontWeight: isActive ? 800 : 600,
                borderRadius: "7px",
                background: isActive ? "var(--accent-gradient)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-muted)",
                boxShadow: isActive ? "0 2px 8px rgba(56, 189, 248, 0.25)" : "none",
                transition: "all 0.15s ease",
                cursor: "pointer",
                border: "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Streamlined Quality Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filteredFormats.length > 0 ? (
          filteredFormats.map((fmt) => {
            const isDownloading = downloadingFormatId === fmt.formatId;
            const isAudioOnly = fmt.type === "audio" || !fmt.hasVideo;

            return (
              <div
                key={fmt.formatId}
                className="glass-panel glass-panel-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "10px",
                  padding: "7px 10px",
                  gap: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "rgba(255, 255, 255, 0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      background: isAudioOnly
                        ? "rgba(168, 85, 247, 0.18)"
                        : "rgba(56, 189, 248, 0.18)",
                      color: isAudioOnly ? "#C084FC" : "var(--accent-cyan)",
                      border: `1px solid ${isAudioOnly ? "rgba(168, 85, 247, 0.25)" : "rgba(56, 189, 248, 0.25)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAudioOnly ? <AudioIcon size={14} /> : <VideoIcon size={14} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {fmt.label || fmt.resolution}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "1px" }}>
                      <span
                        style={{
                          textTransform: "uppercase",
                          fontWeight: 800,
                          color: isAudioOnly ? "#C084FC" : "var(--accent-cyan)",
                        }}
                      >
                        {fmt.ext}
                      </span>
                      {fmt.filesize ? ` • ${formatBytes(fmt.filesize)}` : ""}
                      {isAudioOnly ? " • Full Audio" : " • MP4 Video"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadFormat(fmt)}
                  disabled={isDownloading}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    background: isDownloading
                      ? "rgba(255, 255, 255, 0.08)"
                      : "var(--accent-gradient)",
                    color: isDownloading ? "var(--text-muted)" : "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.76rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    border: "none",
                    boxShadow: isDownloading ? "none" : "0 2px 8px rgba(37, 99, 235, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <DownloadIcon size={13} />
                  <span>{isDownloading ? "..." : "Download"}</span>
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            No format matches this filter.
          </div>
        )}
      </div>
    </div>
  );
};
