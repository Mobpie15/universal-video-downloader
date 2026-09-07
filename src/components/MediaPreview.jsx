import React, { useState } from "react";
import { VideoIcon, AudioIcon, DownloadIcon, SparklesIcon, RefreshIcon } from "./icons/Icons.jsx";

export const MediaPreview = ({ media, onDownloadFormat, downloadingFormatId }) => {
  const [filterTab, setFilterTab] = useState("recommended"); // 'recommended' | 'video' | 'audio' | 'all'

  if (!media) return null;

  const formatDuration = (sec) => {
    if (!sec) return null;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formats = media.formats || [];

  // Group and categorize formats
  const videoFormats = formats.filter((f) => f.type !== "audio" && f.hasVideo);
  const audioFormats = formats.filter((f) => f.type === "audio" || !f.hasVideo);

  // Pick top recommended formats (e.g. 1080p, 720p, and top audio)
  const recommendedFormats = [];
  const top1080 = videoFormats.find((f) => f.resolution?.includes("1080"));
  const top720 = videoFormats.find((f) => f.resolution?.includes("720"));
  const top480 = videoFormats.find((f) => f.resolution?.includes("480") || f.resolution?.includes("360"));
  const topAudio = audioFormats[0];

  if (top1080) recommendedFormats.push(top1080);
  if (top720 && top720 !== top1080) recommendedFormats.push(top720);
  if (top480 && recommendedFormats.length < 3) recommendedFormats.push(top480);
  if (topAudio) recommendedFormats.push(topAudio);

  // Selected formats based on active tab
  let displayedFormats = formats;
  if (filterTab === "recommended" && recommendedFormats.length > 0) {
    displayedFormats = recommendedFormats;
  } else if (filterTab === "video") {
    displayedFormats = videoFormats;
  } else if (filterTab === "audio") {
    displayedFormats = audioFormats;
  }

  const getFormatBadgeStyle = (fmt) => {
    const isAudio = fmt.type === "audio" || !fmt.hasVideo;
    const res = (fmt.resolution || "").toLowerCase();

    if (isAudio) {
      return {
        bg: "rgba(192, 132, 252, 0.15)",
        border: "rgba(192, 132, 252, 0.35)",
        color: "#C084FC",
        tag: "Studio MP3",
      };
    }
    if (res.includes("2160") || res.includes("4k")) {
      return {
        bg: "rgba(251, 146, 60, 0.15)",
        border: "rgba(251, 146, 60, 0.35)",
        color: "#FB923C",
        tag: "4K UHD",
      };
    }
    if (res.includes("1080")) {
      return {
        bg: "rgba(244, 114, 182, 0.15)",
        border: "rgba(244, 114, 182, 0.35)",
        color: "#F472B6",
        tag: "Full HD",
      };
    }
    if (res.includes("720")) {
      return {
        bg: "rgba(139, 92, 246, 0.15)",
        border: "rgba(139, 92, 246, 0.35)",
        color: "#A78BFA",
        tag: "High Def",
      };
    }
    return {
      bg: "rgba(96, 165, 250, 0.15)",
      border: "rgba(96, 165, 250, 0.35)",
      color: "#60A5FA",
      tag: "Standard",
    };
  };

  return (
    <div className="animate-slideUp" style={{ marginBottom: "26px" }}>
      {/* ── Cinematic Video Hero Card ── */}
      <div
        className="studio-card"
        style={{
          overflow: "hidden",
          marginBottom: "18px",
          border: "1px solid rgba(255, 255, 255, 0.09)",
        }}
      >
        {media.thumbnail && (
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "48%",
              background: "#08080A",
              overflow: "hidden",
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
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            {/* Cinematic Gradient Overlays */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10,10,14,0.85) 100%)",
              }}
            />

            {/* Duration Tag */}
            {media.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "14px",
                  background: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(10px)",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}

            {/* Platform & Stream Count Pill */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "14px",
                display: "flex",
                gap: "6px",
              }}
            >
              <span
                style={{
                  background: "var(--accent-gradient)",
                  color: "#FFF",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  padding: "4px 11px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(139, 92, 246, 0.5)",
                }}
              >
                {media.platform ? media.platform.toUpperCase() : "STREAM"}
              </span>
              <span
                style={{
                  background: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(8px)",
                  color: "#E2E8F0",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {formats.length} Available Qualities
              </span>
            </div>
          </div>
        )}

        {/* Video Title & Author Metadata */}
        <div style={{ padding: "16px 18px" }}>
          <h2
            style={{
              fontSize: "1.02rem",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.38,
              margin: "0 0 6px 0",
              letterSpacing: "-0.015em",
            }}
          >
            {media.title}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {media.author && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--accent-light)",
                  fontWeight: 600,
                }}
              >
                {media.author}
              </span>
            )}
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>•</span>
            <span style={{ fontSize: "0.76rem", color: "var(--text-tertiary)" }}>
              High-Speed DASH Remuxing Ready
            </span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        {[
          { id: "recommended", label: "Recommended", icon: <SparklesIcon size={13} /> },
          { id: "video", label: `Video (${videoFormats.length})`, icon: <VideoIcon size={13} /> },
          { id: "audio", label: `Audio (${audioFormats.length})`, icon: <AudioIcon size={13} /> },
          { id: "all", label: `All Tracks (${formats.length})`, icon: null },
        ].map((tab) => {
          const isActive = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "0.78rem",
                fontWeight: isActive ? 800 : 600,
                background: isActive
                  ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)"
                  : "rgba(22, 22, 28, 0.7)",
                border: `1px solid ${isActive ? "rgba(139, 92, 246, 0.45)" : "rgba(255, 255, 255, 0.06)"}`,
                color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 4px 14px rgba(139, 92, 246, 0.25)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Modern Quality Cards Matrix Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {displayedFormats.length > 0 ? (
          displayedFormats.map((fmt, idx) => {
            const isDownloading = downloadingFormatId === fmt.formatId;
            const badge = getFormatBadgeStyle(fmt);
            const isAudio = fmt.type === "audio" || !fmt.hasVideo;

            return (
              <div
                key={fmt.formatId || idx}
                className={`quality-card ${isDownloading ? "is-active" : ""}`}
                onClick={() => !isDownloading && onDownloadFormat(fmt)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  border: isDownloading
                    ? "1px solid rgba(139, 92, 246, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.07)",
                }}
              >
                {/* Card Top Row: Quality Title & Badges */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.66rem",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: "6px",
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {badge.tag}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "var(--text-tertiary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {(fmt.ext || (isAudio ? "mp3" : "mp4")).toUpperCase()}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: 0,
                        lineHeight: 1.25,
                      }}
                    >
                      {fmt.resolution || fmt.label}
                    </h4>
                  </div>

                  {/* Icon badge */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: isAudio ? "rgba(192, 132, 252, 0.12)" : "rgba(139, 92, 246, 0.12)",
                      border: `1px solid ${isAudio ? "rgba(192, 132, 252, 0.25)" : "rgba(139, 92, 246, 0.25)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isAudio ? "#C084FC" : "#A78BFA",
                      flexShrink: 0,
                    }}
                  >
                    {isAudio ? <AudioIcon size={16} /> : <VideoIcon size={16} />}
                  </div>
                </div>

                {/* Card Middle Row: Specifications & Size */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.35)",
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    {isAudio ? "Universal Stereo Audio" : "High Quality H.264"}
                  </span>
                  <span style={{ color: "#FFFFFF", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {fmt.filesize ? formatBytes(fmt.filesize) : "Adaptive Size"}
                  </span>
                </div>

                {/* Card Bottom Row: 1-Click Action Button */}
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDownloading) onDownloadFormat(fmt);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isDownloading
                      ? "rgba(139, 92, 246, 0.2)"
                      : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    border: isDownloading
                      ? "1px solid rgba(139, 92, 246, 0.4)"
                      : "none",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    cursor: isDownloading ? "not-allowed" : "pointer",
                    boxShadow: isDownloading
                      ? "none"
                      : "0 4px 16px rgba(139, 92, 246, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <RefreshIcon size={14} className="animate-spin" />
                      <span>Downloading Stream...</span>
                    </>
                  ) : (
                    <>
                      <DownloadIcon size={14} />
                      <span>Download {isAudio ? "MP3 Audio" : `${fmt.resolution || "Video"}`}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "36px 20px",
              textAlign: "center",
              color: "var(--text-tertiary)",
              fontSize: "0.85rem",
              background: "rgba(20, 20, 26, 0.6)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed rgba(255, 255, 255, 0.08)",
            }}
          >
            No formats found for this category. Try selecting 'All Tracks'.
          </div>
        )}
      </div>
    </div>
  );
};
