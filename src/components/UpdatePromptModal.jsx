import React from "react";
import { DownloadIcon, CloseIcon, SparklesIcon } from "./icons/Icons.jsx";

export const UpdatePromptModal = ({ isOpen, onClose, updateInfo }) => {
  if (!isOpen || !updateInfo) return null;

  const handleDownload = () => {
    const url = updateInfo.downloadUrl || updateInfo.releasesPage;
    if (url) {
      window.open(url, "_system");
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 105,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "22px",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          padding: "24px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7), 0 0 28px rgba(56, 189, 248, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
              }}
            >
              <SparklesIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Update Available!
              </h3>
              <p style={{ fontSize: "0.74rem", color: "var(--accent-cyan)", margin: 0, fontWeight: 700 }}>
                Version v{updateInfo.latestVersion}
              </p>
            </div>
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

        {/* Release Notes */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "18px",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {updateInfo.releaseNotes || "Performance enhancements, 1080p download fix, and stability updates."}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.86rem",
              cursor: "pointer",
            }}
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              flex: 1.6,
              padding: "12px",
              borderRadius: "12px",
              background: "var(--accent-gradient)",
              boxShadow: "0 4px 18px rgba(56, 189, 248, 0.4)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.86rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              cursor: "pointer",
            }}
          >
            <DownloadIcon size={16} />
            <span>Download Update</span>
          </button>
        </div>
      </div>
    </div>
  );
};
