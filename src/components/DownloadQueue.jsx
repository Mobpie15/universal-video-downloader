import React, { useState } from "react";
import {
  DownloadIcon, CheckIcon, CloseIcon, AudioIcon, VideoIcon,
  TrashIcon, LibraryIcon, FolderIcon, PlayIcon, SparklesIcon
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
        if (opened) { showToast("Opening in default player"); return; }
      }
    } catch (e) {}
    if (item.blobUrl || item.path) setActiveMediaModal(item);
    else showToast("Media stream unavailable");
  };

  const handleLocateFile = async (item) => {
    try {
      if (window.electronAPI?.openFolder) await window.electronAPI.openFolder(item.path);
      else showToast(`Saved to Downloads: ${item.fileName}`);
    } catch (e) { showToast("Unable to open folder"); }
  };

  if (!isFullView && activeItems.length === 0 && completedItems.length === 0) return null;

  // Empty library state
  if (isFullView && items.length === 0) {
    return (
      <div style={{ padding: "70px 24px", textAlign: "center" }} className="animate-fadeUp">
        <div style={{
          width: "68px", height: "68px", borderRadius: "22px",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)",
          color: "var(--accent-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px auto",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 0 30px rgba(139, 92, 246, 0.25)",
        }}>
          <LibraryIcon size={32} />
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
          Library is Empty
        </h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", maxWidth: "280px", margin: "0 auto", lineHeight: 1.6 }}>
          Paste any YouTube, Instagram, or TikTok link to download high-definition media directly.
        </p>
      </div>
    );
  }

  // Dynamic telemetry status helper
  const getSpeedTelemetry = (speedMBps, percent) => {
    if (speedMBps === "preparing") return { label: "Initializing Engine & Buffers...", isLive: false };
    if (speedMBps === "connecting") return { label: "Connecting to High-Def Stream...", isLive: false };
    if (speedMBps === "bypassing") return { label: "Resolving Signature & Media Key...", isLive: false };
    if (speedMBps === "buffering") return { label: "Buffering Adaptive Streams...", isLive: false };
    if (speedMBps === "extracting") return { label: "Parsing High-Def Tracks...", isLive: false };
    if (!speedMBps || speedMBps === "0.0") return { label: "Establishing Stream Link...", isLive: false };
    return { label: `${speedMBps} MB/s`, isLive: true };
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Media Player Modal */}
      {activeMediaModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(5, 5, 7, 0.94)",
            backdropFilter: "blur(20px)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
          }}
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            style={{
              width: "100%", maxWidth: "660px",
              background: "var(--bg-secondary)", border: "1px solid var(--border-active)",
              borderRadius: "var(--radius-xl)", overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139, 92, 246, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                {activeMediaModal.title || activeMediaModal.fileName}
              </span>
              <button type="button" onClick={() => setActiveMediaModal(null)} style={{ color: "var(--text-tertiary)", padding: "4px" }}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div style={{ background: "#000" }}>
              {activeMediaModal.fileName?.endsWith(".mp3") ? (
                <div style={{ padding: "36px 20px", textAlign: "center" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "18px",
                    background: "var(--purple-muted)", color: "var(--purple)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px auto",
                    boxShadow: "0 0 24px rgba(192, 132, 252, 0.3)",
                  }}>
                    <AudioIcon size={26} />
                  </div>
                  <audio src={activeMediaModal.blobUrl || activeMediaModal.path} controls autoPlay style={{ width: "100%", outline: "none" }} />
                </div>
              ) : (
                <video src={activeMediaModal.blobUrl || activeMediaModal.path} controls autoPlay playsInline
                  style={{ width: "100%", maxHeight: "65vh", backgroundColor: "#000", outline: "none" }} />
              )}
            </div>
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => handleLocateFile(activeMediaModal)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "6px",
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

      {/* ── Active Downloads (Creative Studio Card) ── */}
      {activeItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#34D399", boxShadow: "0 0 10px #34D399",
                display: "inline-block",
              }} className="animate-pulse" />
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Active Studio Download
              </span>
            </div>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-light)",
              padding: "2px 8px", borderRadius: "12px", background: "var(--accent-muted)",
            }}>
              {activeItems.length} in progress
            </span>
          </div>

          {activeItems.map((item) => {
            const telemetry = getSpeedTelemetry(item.speedMBps, item.percent);
            const isConnecting = item.percent <= 2;

            return (
              <div key={item.id}
                className="animate-slideUp"
                style={{
                  background: "linear-gradient(180deg, rgba(25, 25, 29, 0.95) 0%, rgba(17, 17, 20, 0.98) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.35)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 35px rgba(139, 92, 246, 0.15)",
                }}
              >
                {/* Background glowing gradient pulse */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, bottom: 0,
                  width: `${Math.max(2, item.percent)}%`,
                  background: "linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.15) 100%)",
                  transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: "none",
                }} />

                {/* Top media artwork row if thumbnail exists */}
                {item.thumbnail ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 16px 12px 16px",
                    position: "relative",
                    zIndex: 1,
                  }}>
                    {/* Thumbnail preview with duration */}
                    <div style={{
                      width: "110px",
                      height: "68px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                      background: "#000",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                    }}>
                      <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)",
                      }} />
                      <span style={{
                        position: "absolute", bottom: "4px", right: "5px",
                        fontSize: "0.62rem", fontWeight: 700, color: "#FFF",
                        background: "rgba(0,0,0,0.7)", padding: "1px 5px", borderRadius: "4px",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {item.formatLabel || "HD"}
                      </span>
                    </div>

                    {/* Metadata & Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 800,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "2px 7px", borderRadius: "6px",
                          background: "var(--accent-gradient)", color: "#FFF",
                        }}>
                          {item.resolution || "HD Stream"}
                        </span>
                        {item.author && (
                          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.author}
                          </span>
                        )}
                      </div>

                      <h4 style={{
                        fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)",
                        lineHeight: 1.3, margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {item.title}
                      </h4>
                    </div>

                    {/* Cancel button */}
                    <button type="button" onClick={() => onCancelDownload(item.id)}
                      style={{
                        width: "32px", height: "32px", borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "var(--text-tertiary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, cursor: "pointer",
                      }}
                      title="Cancel Download"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                ) : (
                  /* Fallback Header if no thumbnail */
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 16px 10px 16px", position: "relative", zIndex: 1,
                  }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: "10px" }}>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase",
                        padding: "2px 7px", borderRadius: "6px", background: "var(--accent-gradient)", color: "#FFF",
                        display: "inline-block", marginBottom: "4px",
                      }}>
                        {item.formatLabel || "HD Stream"}
                      </span>
                      <h4 style={{
                        fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.title}
                      </h4>
                    </div>
                    <button type="button" onClick={() => onCancelDownload(item.id)}
                      style={{
                        width: "30px", height: "30px", borderRadius: "8px",
                        background: "var(--bg-elevated)", color: "var(--text-tertiary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                )}

                {/* Telemetry & Progress Dashboard */}
                <div style={{ padding: "0 16px 16px 16px", position: "relative", zIndex: 1 }}>
                  {/* Glowing Progress bar */}
                  <div style={{
                    width: "100%", height: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    borderRadius: "4px", overflow: "hidden",
                    marginBottom: "10px", position: "relative",
                  }}>
                    <div style={{
                      width: `${Math.max(3, item.percent)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #8B5CF6 0%, #6366F1 50%, #38BDF8 100%)",
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                      boxShadow: "0 0 16px rgba(139, 92, 246, 0.6)",
                      position: "relative",
                    }}>
                      {/* Animated shine line */}
                      <div style={{
                        position: "absolute", top: 0, right: 0, bottom: 0, width: "20px",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                        animation: "shimmer 1.5s infinite",
                      }} />
                    </div>
                  </div>

                  {/* Telemetry Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Status badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {telemetry.isLive ? (
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#34D399", boxShadow: "0 0 6px #34D399",
                        }} />
                      ) : (
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#8B5CF6", boxShadow: "0 0 6px #8B5CF6",
                        }} className="animate-pulse" />
                      )}
                      <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {telemetry.label}
                      </span>
                    </div>

                    {/* Big Percent */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{
                        fontSize: "1.15rem",
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        background: "linear-gradient(135deg, #FFF 0%, #A78BFA 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "var(--font-sans)",
                      }}>
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

      {/* ── Completed / Library Downloads ── */}
      {completedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px", padding: "0 2px" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isFullView ? "Completed Files" : "Recent Downloads"}
            </span>
            {completedItems.length > 0 && (
              <button type="button" onClick={onClearCompleted}
                style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", padding: "2px 8px", borderRadius: "6px", cursor: "pointer" }}
              >
                Clear All
              </button>
            )}
          </div>

          {completedItems.slice(0, isFullView ? 50 : 4).map((item) => {
            const isAudio = item.fileName?.endsWith(".mp3");
            const isSuccess = item.status === "completed";

            return (
              <div key={item.id}
                className="animate-fadeUp"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: "var(--radius-lg)",
                  background: "var(--bg-secondary)",
                  border: `1px solid ${isSuccess ? "var(--border)" : "rgba(251, 113, 133, 0.2)"}`,
                  gap: "12px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  {/* Thumbnail or Icon */}
                  {item.thumbnail ? (
                    <div style={{
                      width: "48px", height: "34px", borderRadius: "8px",
                      overflow: "hidden", flexShrink: 0, background: "#000",
                      position: "relative",
                    }}>
                      <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: isSuccess
                        ? (isAudio ? "var(--purple-muted)" : "var(--green-muted)")
                        : "var(--red-muted)",
                      color: isSuccess ? (isAudio ? "var(--purple)" : "var(--green)") : "var(--red)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {isSuccess ? (isAudio ? <AudioIcon size={18} /> : <CheckIcon size={18} />) : <CloseIcon size={18} />}
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                      {isSuccess ? (
                        <span style={{ color: "var(--green)", fontWeight: 700 }}>Ready</span>
                      ) : (
                        <span style={{ color: "var(--red)", fontWeight: 700 }}>Failed</span>
                      )}
                      <span>·</span>
                      <span>{item.formatLabel || (isAudio ? "MP3 Audio" : "MP4 Video")}</span>
                    </div>
                  </div>
                </div>

                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button type="button" onClick={() => handlePlayMedia(item)}
                      style={{
                        padding: "7px 14px", borderRadius: "20px",
                        background: "var(--accent-gradient)", color: "#FFF",
                        display: "flex", alignItems: "center", gap: "5px",
                        fontSize: "0.74rem", fontWeight: 700,
                        boxShadow: "var(--accent-glow)", cursor: "pointer",
                      }}
                    >
                      <PlayIcon size={12} />
                      <span>Play</span>
                    </button>
                    <button type="button" onClick={() => handleLocateFile(item)}
                      style={{
                        padding: "7px 9px", borderRadius: "9px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", display: "flex", alignItems: "center",
                        cursor: "pointer",
                      }}
                      title="Locate file"
                    >
                      <FolderIcon size={13} />
                    </button>
                    {onDeleteItem && (
                      <button type="button" onClick={() => onDeleteItem(item.id)}
                        style={{
                          padding: "7px 9px", borderRadius: "9px",
                          background: "var(--bg-elevated)", border: "1px solid var(--border)",
                          color: "var(--text-tertiary)", display: "flex", alignItems: "center",
                          cursor: "pointer",
                        }}
                        title="Remove from list"
                      >
                        <TrashIcon size={13} />
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
