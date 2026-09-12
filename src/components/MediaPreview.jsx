import React, { useState, useEffect } from "react";
import { VideoIcon, AudioIcon, DownloadIcon, SparklesIcon, RefreshIcon, ScissorsIcon, PhotoIcon, CheckIcon, StarIcon } from "./icons/Icons.jsx";

export const MediaPreview = ({ media, onDownloadFormat, downloadingFormatId }) => {
  const [filterTab, setFilterTab] = useState("recommended"); // 'recommended' | '4k' | 'video' | 'audio' | 'all'
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");

  if (!media) return null;

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return "00:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const parseTimeToSeconds = (tStr) => {
    if (!tStr) return 0;
    const parts = tStr.split(":").map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parseInt(tStr, 10) || 0;
  };

  // Auto-init trim end time when media changes
  useEffect(() => {
    if (media && media.duration > 0) {
      const dur = Math.round(media.duration);
      const defaultEnd = dur > 60 ? "01:00" : formatDuration(dur);
      setEndTime(defaultEnd);
      setStartTime("00:00");
    }
  }, [media?.id]);

  const startSec = parseTimeToSeconds(startTime);
  const endSec = parseTimeToSeconds(endTime);
  const clipLengthSec = Math.max(0, endSec - startSec);

  const formatBytes = (bytes) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formats = media.formats || [];

  const isImageFmt = (f) => f.type === "image" || f.isImage || f.ext === "jpg" || f.ext === "jpeg" || f.ext === "png";
  const isAudioFmt = (f) => (f.type === "audio" || !f.hasVideo) && !isImageFmt(f);
  const isVideoFmt = (f) => f.hasVideo && !isImageFmt(f);

  // Categorize formats
  const videoFormats = formats.filter(isVideoFmt);
  const audioFormats = formats.filter(isAudioFmt);
  const imageFormats = formats.filter(isImageFmt);

  // 4K & High-Res Formats
  const uhdFormats = videoFormats.filter((f) => {
    const res = (f.resolution || "").toLowerCase();
    return res.includes("2160") || res.includes("4k") || res.includes("1440") || res.includes("2k");
  });

  // Recommended formats (4K, 1080p, 720p, top audio, top image)
  const recommendedFormats = [];
  const top4k = videoFormats.find((f) => f.resolution?.includes("2160") || f.resolution?.includes("4K"));
  const top2k = videoFormats.find((f) => f.resolution?.includes("1440") || f.resolution?.includes("2K"));
  const top1080 = videoFormats.find((f) => f.resolution?.includes("1080"));
  const top720 = videoFormats.find((f) => f.resolution?.includes("720"));
  const topAudio = audioFormats[0];
  const topImg = imageFormats[0];

  if (topImg) recommendedFormats.push(topImg);
  if (top4k) recommendedFormats.push(top4k);
  else if (top2k) recommendedFormats.push(top2k);

  if (top1080 && !recommendedFormats.includes(top1080)) recommendedFormats.push(top1080);
  if (top720 && !recommendedFormats.includes(top720)) recommendedFormats.push(top720);
  if (topAudio) recommendedFormats.push(topAudio);

  // Filtered list
  let displayedFormats = formats;
  if (filterTab === "recommended" && recommendedFormats.length > 0) {
    displayedFormats = recommendedFormats;
  } else if (filterTab === "4k") {
    displayedFormats = uhdFormats.length > 0 ? uhdFormats : videoFormats;
  } else if (filterTab === "video") {
    displayedFormats = videoFormats;
  } else if (filterTab === "audio") {
    displayedFormats = audioFormats;
  } else if (filterTab === "photos") {
    displayedFormats = imageFormats;
  }

  const getFormatBadgeStyle = (fmt) => {
    if (isImageFmt(fmt)) {
      return {
        bg: "rgba(225, 48, 108, 0.18)",
        border: "rgba(225, 48, 108, 0.45)",
        color: "#FF5C8A",
        tag: "Full HD Photo",
      };
    }

    const isAudio = isAudioFmt(fmt);
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
        bg: "rgba(245, 158, 11, 0.2)",
        border: "rgba(245, 158, 11, 0.5)",
        color: "#FBBF24",
        tag: "4K ULTRA HD",
      };
    }
    if (res.includes("1440") || res.includes("2k")) {
      return {
        bg: "rgba(6, 182, 212, 0.2)",
        border: "rgba(6, 182, 212, 0.45)",
        color: "#22D3EE",
        tag: "2K QUAD HD",
      };
    }
    if (res.includes("1080")) {
      return {
        bg: "rgba(139, 92, 246, 0.18)",
        border: "rgba(139, 92, 246, 0.4)",
        color: "#C4B5FD",
        tag: "1080p FULL HD",
      };
    }
    if (res.includes("720")) {
      return {
        bg: "rgba(59, 130, 246, 0.15)",
        border: "rgba(59, 130, 246, 0.35)",
        color: "#93C5FD",
        tag: "720p HD",
      };
    }
    return {
      bg: "rgba(148, 163, 184, 0.12)",
      border: "rgba(148, 163, 184, 0.25)",
      color: "#CBD5E1",
      tag: "STANDARD",
    };
  };

  const handleTriggerDownload = (fmt) => {
    const isImg = isImageFmt(fmt);
    onDownloadFormat({ ...fmt, isImage: isImg }, {
      startTime: trimEnabled && !isImg ? startTime : null,
      endTime: trimEnabled && !isImg ? endTime : null,
      trimEnabled: trimEnabled && !isImg,
    });
  };

  // ── Instagram Profile DP Studio View ──
  if (media.subType === "dp") {
    const dpFormat = formats.find((f) => f.formatId.includes("dp")) || formats[0];
    const photoFormats = formats.filter((f) => f !== dpFormat);

    return (
      <div className="animate-slideUp" style={{ marginBottom: "26px" }}>
        <div
          className="studio-card"
          style={{
            padding: "26px",
            border: "1px solid rgba(225, 48, 108, 0.35)",
            background: "linear-gradient(135deg, rgba(225, 48, 108, 0.08) 0%, rgba(10, 10, 14, 0.95) 100%)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(225, 48, 108, 0.15)",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {/* Circular DP Avatar */}
            <div
              style={{
                position: "relative",
                width: "128px",
                height: "128px",
                borderRadius: "50%",
                padding: "4px",
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                boxShadow: "0 8px 24px rgba(225, 48, 108, 0.4)",
                flexShrink: 0,
              }}
            >
              <img
                src={media.thumbnail}
                alt={media.author}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#111",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  background: "#1877F2",
                  color: "#FFF",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                  border: "2px solid #0A0E17",
                }}
              >
                <CheckIcon size={12} />
              </span>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: "6px",
                    background: "rgba(225, 48, 108, 0.2)",
                    color: "#FF5C8A",
                    border: "1px solid rgba(225, 48, 108, 0.4)",
                    textTransform: "uppercase",
                  }}
                >
                  Instagram Profile DP
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-tertiary)" }}>
                  Full HD 1080x1080 Available
                </span>
              </div>

              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 4px 0" }}>
                {media.author}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                {media.description || media.title}
              </p>

              {/* 1-Click DP Download Button */}
              {dpFormat && (
                <button
                  type="button"
                  onClick={() => onDownloadFormat(dpFormat, {})}
                  disabled={downloadingFormatId === dpFormat.formatId}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    borderRadius: "12px",
                    background: "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)",
                    color: "#FFF",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 18px rgba(225, 48, 108, 0.4)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <DownloadIcon size={16} />
                  <span>Download Full HD Profile Picture</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Photos Grid */}
          {photoFormats.length > 0 && (
            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFF", marginBottom: "12px" }}>
                Recent Public Photos ({photoFormats.length})
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                {photoFormats.map((fmt, idx) => (
                  <div
                    key={fmt.formatId || idx}
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      aspectRatio: "1",
                      background: "#111",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <img
                      src={fmt.url}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => onDownloadFormat(fmt, {})}
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(6px)",
                        color: "#FFF",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slideUp" style={{ marginBottom: "26px" }}>
      {/* ── Dual Column Desktop Hero / Video Preview Card ── */}
      <div
        className="studio-card"
        style={{
          overflow: "hidden",
          marginBottom: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0px" }}>
          {/* Video Thumbnail Hero */}
          <div
            style={{
              position: "relative",
              minHeight: "220px",
              background: "#08080A",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {media.thumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.title}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "340px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>No Preview Available</div>
            )}

            {/* Overlays */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10,10,14,0.7) 100%)",
              }}
            />

            {/* Duration Tag */}
            {media.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "14px",
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(10px)",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                {formatDuration(media.duration)}
              </span>
            )}

            {/* Platform Badge */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "14px",
                display: "flex",
                gap: "6px",
              }}
            >
              <span
                style={{
                  background: "var(--accent-gradient)",
                  color: "#FFF",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  padding: "4px 11px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(139, 92, 246, 0.5)",
                  textTransform: "uppercase",
                }}
              >
                {media.platform || "STREAM"}
              </span>
            </div>
          </div>

          {/* Video Metadata & Overview */}
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--green)",
                    background: "rgba(52, 211, 153, 0.1)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(52, 211, 153, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckIcon size={12} /> Universal AAC Audio Synchronized
                </span>
                {uhdFormats.length > 0 && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#FBBF24",
                      background: "rgba(245, 158, 11, 0.15)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <StarIcon size={12} /> 4K UHD Available
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  lineHeight: 1.4,
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.015em",
                }}
              >
                {media.title}
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                {media.author && (
                  <span style={{ color: "var(--accent-light)", fontWeight: 700 }}>
                    {media.author}
                  </span>
                )}
                <span>•</span>
                <span>{formats.length} Qualities ready</span>
                <span>•</span>
                <span>Fast Multi-Thread Muxing</span>
              </div>
            </div>

            {/* Quick action bar */}
            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                MP4 containers formatted with AAC 44.1kHz for universal TV, mobile &amp; PC compatibility.
              </span>
            </div>
          </div>
        </div>

        {/* ── VIDEO TRIMMER STUDIO CONTROLS (NEW FEATURE) ── */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "16px 22px",
            background: trimEnabled
              ? "linear-gradient(180deg, rgba(139, 92, 246, 0.06) 0%, rgba(10, 10, 14, 0.8) 100%)"
              : "rgba(10, 10, 14, 0.5)",
            transition: "all 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: trimEnabled ? "14px" : "0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: trimEnabled ? "var(--accent-gradient)" : "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFF",
                  fontSize: "0.9rem",
                  boxShadow: trimEnabled ? "0 0 12px rgba(139, 92, 246, 0.4)" : "none",
                }}
              >
                <ScissorsIcon size={16} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                    Video Trimmer / Custom Clip
                  </span>
                  {trimEnabled && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "2px 7px",
                        borderRadius: "6px",
                        background: "rgba(52, 211, 153, 0.15)",
                        color: "var(--green)",
                        border: "1px solid rgba(52, 211, 153, 0.3)",
                      }}
                    >
                      ACTIVE ({formatDuration(clipLengthSec)})
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-tertiary)" }}>
                  Cut &amp; download only the exact timestamp range you want at high speed
                </p>
              </div>
            </div>

            {/* Toggle switch button */}
            <button
              type="button"
              onClick={() => setTrimEnabled(!trimEnabled)}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 700,
                background: trimEnabled ? "var(--accent-gradient)" : "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
                border: trimEnabled ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: trimEnabled ? "0 2px 10px rgba(139, 92, 246, 0.3)" : "none",
              }}
            >
              <span>{trimEnabled ? "Trimmer ON" : "Enable Trimmer"}</span>
            </button>
          </div>

          {/* Expanded Trimmer Controls */}
          {trimEnabled && (
            <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {/* Start Time Input */}
                <div style={{ flex: "1 1 140px" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Start Timestamp
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="00:00"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(139, 92, 246, 0.35)",
                      color: "#FFF",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Arrow Divider */}
                <div style={{ color: "var(--text-tertiary)", fontSize: "1rem", paddingTop: "18px" }}>
                  →
                </div>

                {/* End Time Input */}
                <div style={{ flex: "1 1 140px" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    End Timestamp
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="00:30"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(139, 92, 246, 0.35)",
                      color: "#FFF",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Preset Chips */}
                <div style={{ flex: "2 1 240px", paddingTop: "18px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { label: "Full Video", s: "00:00", e: media.duration ? formatDuration(media.duration) : "10:00" },
                    { label: "First 30s", s: "00:00", e: "00:30" },
                    { label: "First 60s", s: "00:00", e: "01:00" },
                    { label: "1m to 2m", s: "01:00", e: "02:00" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setStartTime(preset.s);
                        setEndTime(preset.e);
                      }}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Trimming Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  fontSize: "0.74rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>
                  Clip Range: <strong style={{ color: "#FFF" }}>{startTime}</strong> to <strong style={{ color: "#FFF" }}>{endTime}</strong>
                </span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>
                  Estimated length: {formatDuration(clipLengthSec)} (Downloads in seconds)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Filter Tabs (With dedicated Photos and 4K Tabs) ── */}
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
          ...(imageFormats.length > 0
            ? [{ id: "photos", label: `Photos (${imageFormats.length})`, icon: <PhotoIcon size={13} /> }]
            : []),
          { id: "4k", label: `4K / 2K Ultra HD (${uhdFormats.length})`, icon: null, badge: "UHD" },
          { id: "video", label: `All Video (${videoFormats.length})`, icon: <VideoIcon size={13} /> },
          { id: "audio", label: `Audio MP3 (${audioFormats.length})`, icon: <AudioIcon size={13} /> },
          { id: "all", label: `All Formats (${formats.length})`, icon: null },
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
              {tab.badge && (
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#FBBF24",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
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
            const isImg = isImageFmt(fmt);
            const isAudio = isAudioFmt(fmt);

            return (
              <div
                key={fmt.formatId || idx}
                className={`quality-card ${isDownloading ? "is-active" : ""}`}
                onClick={() => !isDownloading && handleTriggerDownload(fmt)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  border: isDownloading
                    ? "1px solid rgba(139, 92, 246, 0.6)"
                    : `1px solid ${badge.border || "rgba(255, 255, 255, 0.07)"}`,
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
                        {(fmt.ext || (isImg ? "jpg" : isAudio ? "mp3" : "mp4")).toUpperCase()}
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
                      background: isImg
                        ? "rgba(225, 48, 108, 0.15)"
                        : isAudio
                        ? "rgba(192, 132, 252, 0.12)"
                        : "rgba(139, 92, 246, 0.12)",
                      border: `1px solid ${
                        isImg
                          ? "rgba(225, 48, 108, 0.3)"
                          : isAudio
                          ? "rgba(192, 132, 252, 0.25)"
                          : "rgba(139, 92, 246, 0.25)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isImg ? "#FF5C8A" : isAudio ? "#C084FC" : "#A78BFA",
                      flexShrink: 0,
                    }}
                  >
                    {isImg ? <PhotoIcon size={16} /> : isAudio ? <AudioIcon size={16} /> : <VideoIcon size={16} />}
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
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "var(--green)", fontWeight: 700 }}>
                      {isImg ? "Full HD JPG Photo" : isAudio ? "320kbps MP3 Audio" : "+ AAC Audio"}
                    </span>
                  </span>
                  <span style={{ color: "#FFFFFF", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {fmt.filesize ? formatBytes(fmt.filesize) : isImg ? "Full Resolution" : "Adaptive Size"}
                  </span>
                </div>

                {/* Card Bottom Row: 1-Click Action Button */}
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDownloading) handleTriggerDownload(fmt);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isDownloading
                      ? "rgba(139, 92, 246, 0.2)"
                      : isImg
                      ? "linear-gradient(135deg, #E1306C 0%, #C13584 100%)"
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
                      : isImg
                      ? "0 4px 16px rgba(225, 48, 108, 0.35)"
                      : "0 4px 16px rgba(139, 92, 246, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <RefreshIcon size={14} className="animate-spin" />
                      <span>Processing Media...</span>
                    </>
                  ) : (
                    <>
                      <DownloadIcon size={14} />
                      <span>
                        {trimEnabled && !isImg
                          ? `Download Clip (${formatDuration(clipLengthSec)})`
                          : isImg
                          ? "Download Full HD Photo"
                          : `Download ${isAudio ? "MP3" : (fmt.resolution || "Video")}`}
                      </span>
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
            No formats found for this category. Try selecting 'All Formats'.
          </div>
        )}
      </div>
    </div>
  );
};
