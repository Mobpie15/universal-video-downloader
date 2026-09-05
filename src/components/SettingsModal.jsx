import React from "react";
import { CloseIcon, FolderIcon, DevicePhoneIcon, DownloadIcon } from "./icons/Icons.jsx";
import { getPlatformName } from "../engine/nativeBridge.js";

export const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const platform = getPlatformName();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-end", // bottom sheet on mobile
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "20px 20px 32px 20px",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div
          style={{
            width: "38px",
            height: "4px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0 auto 16px auto",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <DownloadIcon size={16} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              App Settings & Info
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.86rem" }}>
          {/* Save Location Tile */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              <FolderIcon size={16} />
              <span>Download Directory</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>
              Files are saved to your device&apos;s default <strong>Downloads</strong> folder and appear instantly in your Gallery / Photos app.
            </p>
          </div>

          {/* Platform Environment */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              <DevicePhoneIcon size={16} />
              <span>Device Environment</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>
              Running on <strong>{platform.toUpperCase()}</strong> with native hardware stream acceleration enabled.
            </p>
          </div>

          {/* App details */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Pie Video Downloader
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.76rem" }}>
              <span>Version</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>1.0.0 (Release)</span>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              background: "var(--bg-hover)",
              color: "var(--text-primary)",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
