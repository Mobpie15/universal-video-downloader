import React from "react";
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

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      {/* Video Header / Metadata Row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Thumbnail preview */}
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "160px",
              height: "90px",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#000000",
              flexShrink: 0,
            }}
          >
            <img
              src={media.thumbnail}
              alt={media.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {media.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  background: "rgba(0,0,0,0.8)",
                  color: "#FFFFFF",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}
          </div>
        )}

        {/* Title and details */}
        <div style={{ flex: 1, minWidth: "220px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ display: "flex", alignItems: "center" }}>
              {getPlatformIcon(media.platform)}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {media.platform}
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.35,
              marginBottom: "6px",
            }}
          >
            {media.title}
          </h3>

          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
            Creator: <span style={{ color: "var(--text-secondary)" }}>{media.author}</span>
          </p>
        </div>
      </div>

      {/* Available Stream Formats Section */}
      <div>
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <VideoIcon size={14} />
          <span>Available Download Qualities</span>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          {media.formats && media.formats.length > 0 ? (
            media.formats.map((fmt) => {
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
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isAudioOnly ? "rgba(139, 92, 246, 0.15)" : "rgba(6, 182, 212, 0.15)",
                        color: isAudioOnly ? "var(--accent-purple)" : "var(--accent-cyan)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isAudioOnly ? <AudioIcon size={16} /> : <VideoIcon size={16} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                        {fmt.label || fmt.resolution}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Format: <span style={{ textTransform: "uppercase", color: "var(--text-secondary)" }}>{fmt.ext}</span>
                        {fmt.filesize ? ` • ${formatBytes(fmt.filesize)}` : ""}
                        {fmt.hasAudio && fmt.hasVideo ? " • Video + Audio" : ""}
                        {isAudioOnly ? " • Audio Track" : ""}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDownloadFormat(fmt)}
                    disabled={isDownloading}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      background: isDownloading ? "var(--bg-hover)" : "var(--accent-red)",
                      color: isDownloading ? "var(--text-muted)" : "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.84rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: isDownloading ? "not-allowed" : "pointer",
                    }}
                  >
                    <DownloadIcon size={15} />
                    <span>{isDownloading ? "Starting..." : "Download"}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No stream formats could be resolved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
