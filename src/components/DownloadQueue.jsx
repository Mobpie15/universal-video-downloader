import React, { useState } from "react";
import {
  DownloadIcon, CheckIcon, CloseIcon, AudioIcon, VideoIcon,
  TrashIcon, LibraryIcon, FolderIcon, PlayIcon, SparklesIcon, RefreshIcon
} from "./icons/Icons.jsx";
import { showToast } from "../engine/nativeBridge.js";

export const DownloadQueue = ({ items, onCancelDownload, onClearCompleted, onDeleteItem, isFullView = false }) => {
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  if (!items) return null;

  const activeItems = items.filter((i) => i.status === "downloading");
  const completedItems = items.filter((i) => i.status === "completed" || i.status === "error");
  const isElectron = typeof window !== "undefined" && Boolean(window.electronAPI?.openFolder);

  const handlePlayMedia = async (item) => {
    try {
      if (window.electronAPI?.openFile && item.path) {
        const opened = await window.electronAPI.openFile(item.path);
        if (opened) {
          showToast("Playing in default media player");
          return;
        }
      }
    } catch (e) {}
    if (item.blobUrl || item.path) {
      setActiveMediaModal(item);
    } else {
      showToast("Media file stream unavailable");
    }
  };

  const handleLocateFile = async (item) => {
    try {
      if (window.electronAPI?.openFolder) {
        await window.electronAPI.openFolder(item.path);
      } else {
        showToast(`Saved to Downloads: ${item.fileName}`);
      }
    } catch (e) {
      showToast("Unable to open folder");
    }
  };

  if (!isFullView && activeItems.length === 0 && completedItems.length === 0) return null;

  // Empty library state
  if (isFullView && items.length === 0) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }} className="animate-fadeUp">
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)",
            color: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            boxShadow: "0 0 35px rgba(139, 92, 246, 0.3)",
          }}
        >
          <LibraryIcon size={34} />
        </div>
        <h3
          style={{
            fontSize: "1.28rem",
            fontWeight: 900,
            color: "#FFFFFF",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Your Media Vault is Empty
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            maxWidth: "320px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Paste any YouTube, Instagram, or TikTok link to download high-definition media directly to your device.
        </p>
      </div>
    );
  }

  // Telemetry status helper
  const getSpeedTelemetry = (speedMBps, percent) => {
    if (speedMBps === "remuxing") {
      return { label: "Remuxing Video & Audio Streams...", isLive: false, stage: "Stage 3: Remuxing MP4" };
    }
    if (speedMBps === "preparing") {
      return { label: "Resolving Media Stream...", isLive: false, stage: "Stage 1: Handshake" };
    }
    if (speedMBps === "connecting") {
      return { label: "Connecting to High-Speed CDN...", isLive: false, stage: "Stage 1: Handshake" };
    }
    if (speedMBps === "bypassing") {
      return { label: "Solving Stream Verification...", isLive: false, stage: "Stage 1: Handshake" };
    }
    if (speedMBps === "buffering") {
      return { label: "Buffering Stream Chunks...", isLive: false, stage: "Stage 2: Downloading" };
    }
    if (speedMBps === "streaming") {
      return { label: "High-Speed Direct Stream", isLive: true, stage: "Stage 2: Downloading" };
    }
    if (!speedMBps || speedMBps === "0.0") {
      return { label: "Establishing Stream Link...", isLive: false, stage: "Stage 1: Handshake" };
    }
    return { label: `${speedMBps} MB/s`, isLive: true, stage: "Stage 2: Downloading" };
  };

  return (
    <div style={{ width: "100%" }}>
      {/* ── Built-in Media Player Modal ── */}
      {activeMediaModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 5, 8, 0.95)",
            backdropFilter: "blur(24px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "rgba(18, 18, 24, 0.98)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 50px rgba(139, 92, 246, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "80%",
                }}
              >
                {activeMediaModal.title || activeMediaModal.fileName}
              </span>
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                style={{ color: "var(--text-tertiary)", padding: "4px", cursor: "pointer" }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ background: "#000000" }}>
              {activeMediaModal.fileName?.endsWith(".mp3") ? (
                <div style={{ padding: "40px 24px", textAlign: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "20px",
                      background: "rgba(192, 132, 252, 0.15)",
                      color: "#C084FC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 18px auto",
                      boxShadow: "0 0 30px rgba(192, 132, 252, 0.35)",
                    }}
                  >
                    <AudioIcon size={30} />
                  </div>
                  <audio
                    src={activeMediaModal.blobUrl || activeMediaModal.path}
                    controls
                    autoPlay
                    style={{ width: "100%", outline: "none" }}
                  />
                </div>
              ) : (
                <video
                  src={activeMediaModal.blobUrl || activeMediaModal.path}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: "100%", maxHeight: "65vh", backgroundColor: "#000", outline: "none" }}
                />
              )}
            </div>

            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                justifyContent: "flex-end",
                background: "rgba(14, 14, 18, 0.95)",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <button
                type="button"
                onClick={() => handleLocateFile(activeMediaModal)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#E2E8F0",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                }}
              >
                <FolderIcon size={14} />
                <span>Show in Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Studio Download Dashboard ── */}
      {activeItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#34D399",
                  boxShadow: "0 0 12px #34D399",
                }}
                className="animate-pulse"
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                }}
              >
                Active Studio Download
              </span>
            </div>

            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#C4B5FD",
                padding: "3px 10px",
                borderRadius: "12px",
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              {activeItems.length} in progress
            </span>
          </div>

          {activeItems.map((item) => {
            const telemetry = getSpeedTelemetry(item.speedMBps, item.percent);

            return (
              <div
                key={item.id}
                className="studio-card animate-slideUp"
                style={{
                  border: "1px solid rgba(139, 92, 246, 0.45)",
                  boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.8), 0 0 45px rgba(139, 92, 246, 0.2)",
                  overflow: "hidden",
                }}
              >
                {/* Media Top Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "18px 20px 14px 20px",
                  }}
                >
                  {/* Thumbnail Artwork */}
                  {item.thumbnail ? (
                    <div
                      style={{
                        width: "120px",
                        height: "72px",
                        borderRadius: "14px",
                        overflow: "hidden",
                        position: "relative",
                        flexShrink: 0,
                        background: "#050508",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <img
                        src={item.thumbnail}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "6px",
                          fontSize: "0.64rem",
                          fontWeight: 800,
                          color: "#FFF",
                          background: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(6px)",
                          padding: "2px 6px",
                          borderRadius: "5px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.resolution || "HD"}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "rgba(139, 92, 246, 0.15)",
                        color: "#C4B5FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <VideoIcon size={22} />
                    </div>
                  )}

                  {/* Metadata and Title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.66rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "var(--accent-gradient)",
                          color: "#FFF",
                          boxShadow: "0 0 12px rgba(139, 92, 246, 0.4)",
                        }}
                      >
                        {item.formatLabel || item.resolution || "Universal MP4"}
                      </span>
                      {item.author && (
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                          }}
                        >
                          {item.author}
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        lineHeight: 1.3,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.title}
                    </h4>
                  </div>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => onCancelDownload(item.id)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--text-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                    title="Cancel Download"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>

                {/* Progress Bar & Telemetry Dashboard */}
                <div style={{ padding: "0 20px 20px 20px" }}>
                  {/* Laser Progress Bar */}
                  <div className="laser-progress-bar" style={{ marginBottom: "14px" }}>
                    <div
                      className="laser-progress-fill"
                      style={{ width: `${Math.max(3, Math.min(100, item.percent))}%` }}
                    />
                  </div>

                  {/* 4-Box Telemetry HUD */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {/* Stat 1: Speed */}
                    <div className="hud-stat-box">
                      <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
                        Stream Speed
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {telemetry.isLive ? (
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: "#34D399",
                              boxShadow: "0 0 8px #34D399",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: "#A78BFA",
                              boxShadow: "0 0 8px #A78BFA",
                            }}
                            className="animate-pulse"
                          />
                        )}
                        <span
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            color: telemetry.isLive ? "#34D399" : "var(--accent-light)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {telemetry.label}
                        </span>
                      </div>
                    </div>

                    {/* Stat 2: Time Remaining */}
                    <div className="hud-stat-box">
                      <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
                        Estimated Time
                      </span>
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.etaSeconds ? `${item.etaSeconds}s` : "Calculating..."}
                      </span>
                    </div>

                    {/* Stat 3: Pipeline Stage */}
                    <div className="hud-stat-box">
                      <span style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
                        Pipeline Stage
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#C4B5FD",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {telemetry.stage}
                      </span>
                    </div>

                    {/* Stat 4: Percentage */}
                    <div className="hud-stat-box" style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--accent-light)", fontWeight: 800, textTransform: "uppercase" }}>
                        Downloaded
                      </span>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 900,
                          color: "#FFFFFF",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Completed / Media Vault Downloads ── */}
      {completedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
              padding: "0 4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {isFullView ? "Media Vault Files" : "Recent Saved Downloads"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "1px 7px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                }}
              >
                {completedItems.length}
              </span>
            </div>

            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCompleted}
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-tertiary)",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.03)",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {completedItems.slice(0, isFullView ? 50 : 5).map((item) => {
            const isAudio = item.fileName?.endsWith(".mp3");
            const isSuccess = item.status === "completed";

            return (
              <div
                key={item.id}
                className="quality-card animate-fadeUp"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  gap: "14px",
                  border: `1px solid ${isSuccess ? "rgba(255, 255, 255, 0.08)" : "rgba(251, 113, 133, 0.3)"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0, flex: 1 }}>
                  {/* Thumbnail / Status Icon */}
                  {item.thumbnail ? (
                    <div
                      style={{
                        width: "60px",
                        height: "40px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#000",
                        position: "relative",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <img
                        src={item.thumbnail}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: isSuccess
                          ? isAudio
                            ? "rgba(192, 132, 252, 0.12)"
                            : "rgba(52, 211, 153, 0.12)"
                          : "rgba(251, 113, 133, 0.12)",
                        color: isSuccess
                          ? isAudio
                            ? "#C084FC"
                            : "#34D399"
                          : "#FB7185",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSuccess ? (isAudio ? <AudioIcon size={18} /> : <CheckIcon size={18} />) : <CloseIcon size={18} />}
                    </div>
                  )}

                  {/* Title & Specs */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "#FFFFFF",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title || item.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-tertiary)",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isSuccess ? (
                        <span style={{ color: "#34D399", fontWeight: 800 }}>Ready</span>
                      ) : (
                        <span style={{ color: "#FB7185", fontWeight: 800 }}>Failed</span>
                      )}
                      <span>•</span>
                      <span>{item.formatLabel || (isAudio ? "MP3 Audio" : "Universal MP4")}</span>
                      {item.path && (
                        <>
                          <span>•</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>Saved to device</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handlePlayMedia(item)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        boxShadow: "0 2px 12px rgba(139, 92, 246, 0.4)",
                        cursor: "pointer",
                      }}
                    >
                      <PlayIcon size={13} />
                      <span>Play</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLocateFile(item)}
                      style={{
                        padding: "8px 11px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title="Show in Explorer"
                    >
                      <FolderIcon size={14} />
                    </button>

                    {onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        style={{
                          padding: "8px 11px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "var(--text-tertiary)",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        title="Remove from history"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
