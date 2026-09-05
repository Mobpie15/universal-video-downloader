import React from "react";
import {
  DownloadIcon,
  CheckIcon,
  CloseIcon,
  FolderIcon,
  VideoIcon,
  TrashIcon,
} from "./icons/Icons.jsx";
import { shareFile } from "../engine/nativeBridge.js";

export const DownloadQueue = ({ items, onCancelDownload, onClearCompleted }) => {
  if (!items || items.length === 0) return null;

  const activeItems = items.filter((i) => i.status === "downloading");
  const completedItems = items.filter((i) => i.status === "completed" || i.status === "error");

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DownloadIcon size={16} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            Download Manager ({items.length})
          </span>
        </div>

        {completedItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            style={{
              fontSize: "0.78rem",
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

      <div style={{ display: "grid", gap: "12px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "4px",
                  }}
                >
                  {item.title}
                </h4>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  {item.formatLabel || item.resolution} • {item.fileName}
                </div>
              </div>

              {item.status === "downloading" && (
                <button
                  type="button"
                  onClick={() => onCancelDownload(item.id)}
                  style={{
                    padding: "4px",
                    borderRadius: "6px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Cancel download"
                >
                  <CloseIcon size={16} />
                </button>
              )}

              {item.status === "completed" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--accent-green)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <CheckIcon size={16} />
                  <span>Saved</span>
                </div>
              )}

              {item.status === "error" && (
                <span style={{ color: "var(--accent-red)", fontSize: "0.78rem", fontWeight: 600 }}>
                  Failed
                </span>
              )}
            </div>

            {/* Progress Bar for Active Download */}
            {item.status === "downloading" && (
              <div>
                <div
                  style={{
                    height: "6px",
                    background: "var(--bg-card)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${item.percent || 0}%`,
                      background: "linear-gradient(90deg, #EF4444, #06B6D4)",
                      borderRadius: "3px",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span>{item.percent || 0}%</span>
                  <span>{item.speedMBps ? `${item.speedMBps} MB/s` : "Downloading..."}</span>
                  <span>{item.etaSeconds ? `ETA: ${item.etaSeconds}s` : ""}</span>
                </div>
              </div>
            )}

            {/* Completed Footer with Share / Open */}
            {item.status === "completed" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "6px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border)",
                  fontSize: "0.75rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Location: {item.path || "Device Storage"}
                </span>

                <button
                  type="button"
                  onClick={() => shareFile({ title: item.title, text: "Downloaded video", url: item.path })}
                  style={{
                    color: "var(--accent-cyan)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Share Video
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
