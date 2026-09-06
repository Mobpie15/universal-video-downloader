import React, { useState } from "react";
import {
  DownloadIcon,
  CheckIcon,
  CloseIcon,
  VideoIcon,
  AudioIcon,
  TrashIcon,
  LibraryIcon,
  FolderIcon,
  PlayIcon,
} from "./icons/Icons.jsx";
import { showToast } from "../engine/nativeBridge.js";

export const DownloadQueue = ({
  items,
  onCancelDownload,
  onClearCompleted,
  onDeleteItem,
  isFullView = false,
}) => {
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  if (!items) return null;

  const activeItems = items.filter((i) => i.status === "downloading");
  const completedItems = items.filter((i) => i.status === "completed" || i.status === "error");

  const isElectron = typeof window !== "undefined" && Boolean(window.electronAPI?.openFolder);

  const handlePlayMedia = async (item) => {
    try {
      if (window.electronAPI && typeof window.electronAPI.openFile === "function" && item.path) {
        const opened = await window.electronAPI.openFile(item.path);
        if (opened) {
          showToast("Opening in default player");
          return;
        }
      }
    } catch (e) {
      console.warn("Desktop openFile failed:", e);
    }
    if (item.blobUrl || item.path) {
      setActiveMediaModal(item);
    } else {
      showToast("Media source unavailable");
    }
  };

  const handleLocateFile = async (item) => {
    try {
      if (window.electronAPI && typeof window.electronAPI.openFolder === "function") {
        await window.electronAPI.openFolder(item.path);
      } else {
        showToast(`Saved to Downloads: ${item.fileName}`);
      }
    } catch (e) {
      showToast("Unable to open folder");
    }
  };

  if (!isFullView && activeItems.length === 0 && completedItems.length === 0) {
    return null;
  }

  // Empty state for Library tab
  if (isFullView && items.length === 0) {
    return (
      <div style={{
        padding: "60px 24px",
        textAlign: "center",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "var(--accent-muted)",
          color: "var(--accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto",
        }}>
          <LibraryIcon size={26} />
        </div>
        <h3 style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "6px",
        }}>
          No downloads yet
        </h3>
        <p style={{
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          maxWidth: "280px",
          margin: "0 auto",
          lineHeight: 1.5,
        }}>
          Paste a video link to start downloading files to your device.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Media Player Modal */}
      {activeMediaModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(12px)",
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
              maxWidth: "640px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "80%",
              }}>
                {activeMediaModal.title || activeMediaModal.fileName}
              </span>
              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                style={{ color: "var(--text-tertiary)", padding: "4px", borderRadius: "6px" }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Player */}
            <div style={{ background: "#000" }}>
              {activeMediaModal.fileName?.endsWith(".mp3") ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "var(--purple-muted)",
                    color: "var(--purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px auto",
                  }}>
                    <AudioIcon size={24} />
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
                  style={{
                    width: "100%",
                    maxHeight: "65vh",
                    outline: "none",
                    backgroundColor: "#000",
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 16px",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button
                type="button"
                onClick={() => handleLocateFile(activeMediaModal)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FolderIcon size={13} />
                <span>Locate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
        paddingLeft: "2px",
      }}>
        <span style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {isFullView ? "Library" : "Downloads"}
          <span style={{
            marginLeft: "6px",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "var(--text-tertiary)",
            background: "var(--bg-elevated)",
            padding: "1px 7px",
            borderRadius: "10px",
          }}>
            {items.length}
          </span>
        </span>

        {completedItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            style={{
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Active Downloads */}
      {activeItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          {activeItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-active)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "75%",
                }}>
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => onCancelDownload(item.id)}
                  style={{ color: "var(--text-tertiary)", padding: "2px", borderRadius: "4px" }}
                >
                  <CloseIcon size={14} />
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: "100%",
                height: "4px",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "8px",
              }}>
                <div style={{
                  width: `${Math.max(2, item.percent)}%`,
                  height: "100%",
                  background: "var(--accent-gradient)",
                  borderRadius: "4px",
                  transition: "width 0.2s ease",
                }} />
              </div>

              {/* Stats */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "var(--text-tertiary)",
              }}>
                <span style={{ fontWeight: 500 }}>{item.formatLabel || "HD"}</span>
                <span>{item.speedMBps ? `${item.speedMBps} MB/s` : "Starting..."}</span>
                <span style={{ fontWeight: 700, color: "var(--accent-light)" }}>{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Downloads */}
      {completedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {completedItems.slice(0, isFullView ? 50 : 3).map((item) => {
            const isAudio = item.fileName?.endsWith(".mp3");
            const isSuccess = item.status === "completed";

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)",
                  border: `1px solid ${isSuccess ? "var(--border)" : "rgba(248, 113, 113, 0.2)"}`,
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  {/* Status Icon */}
                  <div style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    background: isSuccess
                      ? (isAudio ? "var(--purple-muted)" : "var(--green-muted)")
                      : "var(--red-muted)",
                    color: isSuccess
                      ? (isAudio ? "var(--purple)" : "var(--green)")
                      : "var(--red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isSuccess ? (isAudio ? <AudioIcon size={16} /> : <CheckIcon size={16} />) : <CloseIcon size={16} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "1px" }}>
                      {isSuccess ? (
                        <span style={{ color: "var(--green)", fontWeight: 500 }}>Ready</span>
                      ) : (
                        <span style={{ color: "var(--red)", fontWeight: 500 }}>Failed</span>
                      )}
                      {item.formatLabel ? ` · ${item.formatLabel}` : ""}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handlePlayMedia(item)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--accent-gradient)",
                        color: "#FFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        boxShadow: "var(--accent-glow)",
                      }}
                    >
                      <PlayIcon size={12} />
                      <span>Play</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLocateFile(item)}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.72rem",
                      }}
                      title="Locate file"
                    >
                      <FolderIcon size={13} />
                    </button>

                    {onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-tertiary)",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Remove"
                      >
                        <TrashIcon size={12} />
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
