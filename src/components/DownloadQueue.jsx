import React from "react";
import {
  DownloadIcon,
  CheckIcon,
  CloseIcon,
  VideoIcon,
  AudioIcon,
  TrashIcon,
  ShareIcon,
  LibraryIcon,
  FolderIcon,
} from "./icons/Icons.jsx";
import { shareFile, showToast } from "../engine/nativeBridge.js";

export const DownloadQueue = ({
  items,
  onCancelDownload,
  onClearCompleted,
  onDeleteItem,
  isFullView = false,
}) => {
  if (!items) return null;

  const activeItems = items.filter((i) => i.status === "downloading");
  const completedItems = items.filter((i) => i.status === "completed" || i.status === "error");

  const isElectron = typeof window !== "undefined" && Boolean(window.electronAPI?.openFolder);

  const handleLocateFile = async (item) => {
    try {
      if (window.electronAPI && typeof window.electronAPI.openFolder === "function") {
        await window.electronAPI.openFolder(item.path);
      } else {
        showToast("File saved to Downloads");
      }
    } catch (e) {
      showToast("Unable to open folder");
    }
  };

  const handleShare = async (item) => {
    try {
      await shareFile({
        title: item.title,
        text: `Watch: ${item.title}`,
        url: item.path || "",
      });
    } catch (e) {
      showToast("Unable to share file");
    }
  };

  // If on home screen (not full view) and no active items and no completed items, don't take up space
  if (!isFullView && activeItems.length === 0 && completedItems.length === 0) {
    return null;
  }

  // If in Full View ("My Files" tab) and completely empty
  if (isFullView && items.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          borderRadius: "22px",
          padding: "54px 24px",
          textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "rgba(56, 189, 248, 0.12)",
            color: "var(--accent-cyan)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px auto",
            boxShadow: "0 8px 24px rgba(56, 189, 248, 0.2)",
          }}
        >
          <LibraryIcon size={32} />
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "8px", letterSpacing: "-0.01em" }}>
          No Downloads Yet
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "300px", margin: "0 auto", lineHeight: 1.5 }}>
          Paste a video or reel link in the Downloader tab to start saving files directly to your device.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", marginBottom: "24px" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "var(--accent-cyan)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DownloadIcon size={14} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#FFFFFF", letterSpacing: "-0.01em" }}>
            {isFullView ? "My Downloaded Files" : "Active & Recent Downloads"}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "var(--accent-cyan)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            {items.length}
          </span>
        </div>

        {completedItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              transition: "all 0.2s ease",
            }}
          >
            <TrashIcon size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Active Downloads Group */}
      {activeItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                border: "1px solid rgba(56, 189, 248, 0.35)",
                borderRadius: "16px",
                padding: "14px 16px",
                boxShadow: "0 8px 24px rgba(2, 132, 199, 0.18)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "75%",
                  }}
                >
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => onCancelDownload(item.id)}
                  style={{ color: "var(--text-muted)", padding: "4px", borderRadius: "6px" }}
                  title="Cancel download"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              {/* Glowing Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "7px",
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(3, item.percent)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #2563EB 0%, #0284C7 50%, #38BDF8 100%)",
                    borderRadius: "8px",
                    boxShadow: "0 0 12px rgba(56, 189, 248, 0.6)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>

              {/* Meta stats */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.74rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.formatLabel || "HD Video"}</span>
                <span>{item.speedMBps ? `${item.speedMBps} MB/s` : "Downloading..."}</span>
                <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Downloads Group */}
      {completedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {completedItems.slice(0, isFullView ? 50 : 3).map((item) => {
            const isAudio = item.fileName?.endsWith(".mp3");
            const isSuccess = item.status === "completed";

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  borderRadius: "16px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  border: isSuccess ? "1px solid rgba(255, 255, 255, 0.07)" : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background: isSuccess
                        ? (isAudio ? "rgba(139, 92, 246, 0.16)" : "rgba(16, 185, 129, 0.16)")
                        : "rgba(239, 68, 68, 0.16)",
                      border: isSuccess
                        ? (isAudio ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)")
                        : "1px solid rgba(239, 68, 68, 0.3)",
                      color: isSuccess
                        ? (isAudio ? "var(--accent-purple)" : "var(--accent-green)")
                        : "var(--accent-red)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isSuccess ? (isAudio ? <AudioIcon size={18} /> : <CheckIcon size={18} />) : <CloseIcon size={18} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.86rem",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {isSuccess ? (
                        <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Saved to Device</span>
                      ) : (
                        <span style={{ color: "var(--accent-red)", fontWeight: 600 }}>Download Failed</span>
                      )}
                      {item.formatLabel ? ` • ${item.formatLabel}` : ""}
                    </div>
                  </div>
                </div>

                {/* File action buttons */}
                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    {isElectron ? (
                      <button
                        type="button"
                        onClick={() => handleLocateFile(item)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          background: "rgba(56, 189, 248, 0.15)",
                          border: "1px solid rgba(56, 189, 248, 0.35)",
                          color: "var(--accent-cyan)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        title="Locate in File Explorer"
                      >
                        <FolderIcon size={14} />
                        <span>File Explorer</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleShare(item)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          background: "rgba(56, 189, 248, 0.12)",
                          border: "1px solid rgba(56, 189, 248, 0.25)",
                          color: "var(--accent-cyan)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                        }}
                        title="Share to WhatsApp / Apps"
                      >
                        <ShareIcon size={13} />
                        <span>Share</span>
                      </button>
                    )}

                    {onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        style={{
                          padding: "8px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.07)",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Delete from list"
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
