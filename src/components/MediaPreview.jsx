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
      className="glass-panel"
      style={{
        borderRadius: "22px",
        padding: "20px",
        marginBottom: "28px",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45), 0 0 24px rgba(56, 189, 248, 0.12)",
      }}
    >
      {/* Video Metadata Card */}
      <div style={{ marginBottom: "20px" }}>
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "54%", // 16:9 mobile aspect ratio
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#0B0F19",
              marginBottom: "14px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
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
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(6, 9, 15, 0.88)",
                  backdropFilter: "blur(8px)",
                  color: "#FFFFFF",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "8px",
                background: "rgba(6, 9, 15, 0.85)",
                backdropFilter: "blur(8px)",
                color: "#FFFFFF",
                fontSize: "0.74rem",
                fontWeight: 700,
                textTransform: "capitalize",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {getPlatformIcon(media.platform)}
              <span>{media.platform}</span>
            </div>
          </div>
        )}

        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.4,
            marginBottom: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {media.title}
        </h3>

        {media.author && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
            Creator: <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{media.author}</span>
          </p>
        )}
      </div>

      {/* Format Filter Segmented Control */}
      <div
        style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "14px",
          padding: "4px",
          marginBottom: "16px",
          gap: "4px",
        }}
      >
        {[
          { id: "all", label: "All Qualities" },
          { id: "video", label: "Video Only (MP4)" },
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
                padding: "8px 6px",
                fontSize: "0.8rem",
                fontWeight: isActive ? 800 : 600,
                borderRadius: "10px",
                background: isActive ? "var(--accent-gradient)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--text-muted)",
                boxShadow: isActive ? "0 2px 10px rgba(56, 189, 248, 0.3)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Quality Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  borderRadius: "14px",
                  padding: "12px 14px",
                  gap: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "11px",
                      background: isAudioOnly
                        ? "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)"
                        : "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(56, 189, 248, 0.2) 100%)",
                      color: isAudioOnly ? "#C084FC" : "var(--accent-cyan)",
                      border: `1px solid ${isAudioOnly ? "rgba(168, 85, 247, 0.3)" : "rgba(56, 189, 248, 0.3)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAudioOnly ? <AudioIcon size={18} /> : <VideoIcon size={18} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {fmt.label || fmt.resolution}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "2px" }}>
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
                      {isAudioOnly ? " • Studio Audio" : " • Universal Stream"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadFormat(fmt)}
                  disabled={isDownloading}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "11px",
                    background: isDownloading
                      ? "rgba(255, 255, 255, 0.08)"
                      : "var(--accent-gradient)",
                    color: isDownloading ? "var(--text-muted)" : "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.86rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    boxShadow: isDownloading
                      ? "none"
                      : "0 4px 14px rgba(37, 99, 235, 0.35)",
                    flexShrink: 0,
                  }}
                >
                  <DownloadIcon size={15} />
                  <span>{isDownloading ? "Starting..." : "Download"}</span>
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            No format matches this filter.
          </div>
        )}
      </div>
    </div>
  );
};
