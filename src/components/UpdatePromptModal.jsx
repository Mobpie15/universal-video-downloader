import React, { useState, useEffect } from "react";
import { DownloadIcon, CloseIcon, SparklesIcon, RefreshIcon, CheckIcon } from "./icons/Icons.jsx";

export const UpdatePromptModal = ({ isOpen, onClose, updateInfo }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, speedMBps: "0.0", transferredMB: "0", totalMB: "0" });
  const [isRestarting, setIsRestarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false);
      setIsRestarting(false);
      setProgress({ percent: 0, speedMBps: "0.0", transferredMB: "0", totalMB: "0" });
      setError(null);
      return;
    }

    if (window.electronAPI?.onUpdateProgress) {
      const unsub = window.electronAPI.onUpdateProgress((data) => {
        setProgress(data);
      });
      return unsub;
    }
  }, [isOpen]);

  if (!isOpen || !updateInfo) return null;

  const isElectron = Boolean(window.electronAPI?.isElectron && window.electronAPI?.startInAppUpdate);

  const handleUpdate = async () => {
    if (isElectron) {
      setIsDownloading(true);
      setError(null);
      try {
        const downloadUrl = updateInfo.downloadUrl;
        await window.electronAPI.startInAppUpdate({ downloadUrl });
        setIsDownloading(false);
        setIsRestarting(true);
        setTimeout(async () => {
          try {
            await window.electronAPI.installAndRestart();
          } catch (restartErr) {
            setError(restartErr.message || "Failed to restart");
            setIsRestarting(false);
          }
        }, 1500);
      } catch (err) {
        setIsDownloading(false);
        setError(err.message || "Download failed. Try again.");
      }
    } else {
      const url = updateInfo.downloadUrl || updateInfo.releasesPage;
      if (url) window.open(url, "_system");
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 105,
        padding: "16px",
      }}
      onClick={!isDownloading && !isRestarting ? onClose : undefined}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
            }}>
              <SparklesIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                {isRestarting ? "Restarting..." : isDownloading ? "Downloading..." : "Update Available"}
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--accent-light)", margin: 0, fontWeight: 600 }}>
                v{updateInfo.latestVersion}
              </p>
            </div>
          </div>
          {!isDownloading && !isRestarting && (
            <button type="button" onClick={onClose} style={{ color: "var(--text-tertiary)", padding: "4px" }}>
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        {isRestarting ? (
          <div style={{
            background: "var(--green-muted)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: "16px",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--green)", fontWeight: 700, fontSize: "0.88rem", marginBottom: "4px" }}>
              <CheckIcon size={16} />
              <span>Update Ready</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Applying update and restarting...
            </p>
          </div>
        ) : isDownloading ? (
          <div style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            marginBottom: "16px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.76rem" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Downloading update</span>
              <span style={{ color: "var(--accent-light)", fontWeight: 700 }}>{progress.percent}%</span>
            </div>
            <div style={{ width: "100%", height: "4px", background: "var(--bg-surface)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{
                width: `${progress.percent}%`,
                height: "100%",
                background: "var(--accent-gradient)",
                transition: "width 0.2s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-tertiary)" }}>
              <span>{progress.transferredMB} / {progress.totalMB} MB</span>
              <span>{progress.speedMBps} MB/s</span>
            </div>
          </div>
        ) : (
          <div style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}>
            {updateInfo.releaseNotes || "Performance improvements and bug fixes."}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--red-muted)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            marginBottom: "12px",
            fontSize: "0.76rem",
            color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        {!isRestarting && (
          <div style={{ display: "flex", gap: "8px" }}>
            {!isDownloading && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "0.84rem",
                }}
              >
                Later
              </button>
            )}
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isDownloading}
              style={{
                flex: isDownloading ? 1 : 1.5,
                padding: "11px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-gradient)",
                boxShadow: "var(--accent-glow)",
                color: "#FFF",
                fontWeight: 700,
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: isDownloading ? "not-allowed" : "pointer",
              }}
            >
              {isDownloading ? (
                <>
                  <RefreshIcon size={14} className="animate-spin" />
                  <span>{progress.percent}%</span>
                </>
              ) : (
                <>
                  <DownloadIcon size={14} />
                  <span>{isElectron ? "Update Now" : "Download"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
