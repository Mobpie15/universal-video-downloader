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
  PlayIcon,
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
      case "youtube": return <PlatformYouTubeIcon size={16} />;
      case "instagram": return <PlatformInstagramIcon size={16} />;
      case "tiktok": return <PlatformTikTokIcon size={16} />;
      case "facebook": return <PlatformFacebookIcon size={16} />;
      case "twitter": return <PlatformTwitterIcon size={16} />;
      default: return <PlatformGenericIcon size={16} />;
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
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "16px",
        marginBottom: "24px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Mobile Video Metadata Card */}
      <div style={{ marginBottom: "16px" }}>
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "52%", // 16:9 mobile aspect ratio
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: "#0F172A",
              marginBottom: "12px",
            }}
          >
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
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {media.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.85)",
                  color: "#FFFFFF",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "6px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.75)",
                color: "#FFFFFF",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {getPlatformIcon(media.platform)}
              <span>{media.platform}</span>
            </div>
          </div>
        )}

        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.35,
            marginBottom: "4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {media.title}
        </h3>

        {media.author && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
            By <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{media.author}</span>
          </p>
        )}
      </div>

      {/* Format Filter Segmented Control */}
      <div
        style={{
          display: "flex",
          background: "var(--bg-input)",
          borderRadius: "10px",
          padding: "3px",
          marginBottom: "14px",
        }}
      >
        {[
          { id: "all", label: "All Formats" },
          { id: "video", label: "Video Only" },
          { id: "audio", label: "Audio Only" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilterType(t.id)}
            style={{
              flex: 1,
              padding: "7px 4px",
              fontSize: "0.76rem",
              fontWeight: filterType === t.id ? 700 : 500,
              borderRadius: "8px",
              background: filterType === t.id ? "var(--accent-red)" : "transparent",
              color: filterType === t.id ? "#FFFFFF" : "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Quality Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredFormats.length > 0 ? (
          filteredFormats.map((fmt) => {
            const isDownloading = downloadingFormatId === fmt.formatId;
            const isAudioOnly = fmt.type === "audio" || !fmt.hasVideo;

            return (
              <div
                key={fmt.formatId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg-input)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: isAudioOnly ? "rgba(139, 92, 246, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: isAudioOnly ? "var(--accent-purple)" : "var(--accent-red)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAudioOnly ? <AudioIcon size={16} /> : <VideoIcon size={16} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {fmt.label || fmt.resolution}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      <span style={{ textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)" }}>
                        {fmt.ext}
                      </span>
                      {fmt.filesize ? ` • ${formatBytes(fmt.filesize)}` : ""}
                      {isAudioOnly ? " • MP3 Audio" : " • HD Stream"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadFormat(fmt)}
                  disabled={isDownloading}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: isDownloading ? "var(--bg-hover)" : "var(--accent-red)",
                    color: isDownloading ? "var(--text-muted)" : "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    flexShrink: 0,
                  }}
                >
                  <DownloadIcon size={14} />
                  <span>{isDownloading ? "Starting..." : "Download"}</span>
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.84rem" }}>
            No format matches this filter.
          </div>
        )}
      </div>
    </div>
  );
};
