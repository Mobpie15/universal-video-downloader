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
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "48px 24px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "rgba(239, 68, 68, 0.12)",
            color: "var(--accent-red)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          <LibraryIcon size={30} />
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
          No Downloads Yet
        </h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "280px", margin: "0 auto" }}>
          Paste a video or reel link in the Downloader tab to start saving files.
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
          marginBottom: "12px",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "var(--accent-red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DownloadIcon size={14} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-primary)" }}>
            {isFullView ? "My Downloaded Files" : "Active & Recent Downloads"}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
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
              padding: "4px 8px",
              borderRadius: "6px",
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
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "14px",
                padding: "12px 14px",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
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
                  style={{ color: "var(--text-muted)", padding: "2px" }}
                  title="Cancel download"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "var(--bg-input)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(2, item.percent)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #EF4444, #F43F5E)",
                    borderRadius: "6px",
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
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>{item.formatLabel || "HD Video"}</span>
                <span>{item.speedMBps ? `${item.speedMBps} MB/s` : "Downloading..."}</span>
                <span style={{ fontWeight: 700, color: "var(--accent-red)" }}>{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Downloads Group */}
      {completedItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {completedItems.slice(0, isFullView ? 50 : 3).map((item) => {
            const isAudio = item.fileName?.endsWith(".mp3");
            const isSuccess = item.status === "completed";

            return (
              <div
                key={item.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: isSuccess
                        ? (isAudio ? "rgba(139, 92, 246, 0.15)" : "rgba(16, 185, 129, 0.15)")
                        : "rgba(239, 68, 68, 0.15)",
                      color: isSuccess
                        ? (isAudio ? "var(--accent-purple)" : "var(--accent-green)")
                        : "var(--accent-red)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isSuccess ? (isAudio ? <AudioIcon size={16} /> : <CheckIcon size={16} />) : <CloseIcon size={16} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {isSuccess ? (
                        <span style={{ color: "var(--accent-green)" }}>Saved to Device</span>
                      ) : (
                        <span style={{ color: "var(--accent-red)" }}>Download Failed</span>
                      )}
                      {item.formatLabel ? ` • ${item.formatLabel}` : ""}
                    </div>
                  </div>
                </div>

                {/* File action buttons */}
                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                      title="Share to WhatsApp / Apps"
                    >
                      <ShareIcon size={13} />
                      <span>Share</span>
                    </button>

                    {onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        style={{
                          padding: "7px",
                          borderRadius: "8px",
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
