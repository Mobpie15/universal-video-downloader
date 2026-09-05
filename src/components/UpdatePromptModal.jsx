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
        const downloadUrl = updateInfo.downloadUrl || updateInfo.windowsInstallerUrl || updateInfo.windowsPortableUrl;
        await window.electronAPI.startInAppUpdate({ downloadUrl });
        setIsDownloading(false);
        setIsRestarting(true);

        // Give UI 1.5 seconds to show success before triggering restart
        setTimeout(async () => {
          try {
            await window.electronAPI.installAndRestart();
          } catch (restartErr) {
            setError(restartErr.message || "Failed to restart application");
            setIsRestarting(false);
          }
        }, 1500);
      } catch (err) {
        setIsDownloading(false);
        setError(err.message || "Update download failed. Please try again.");
      }
    } else {
      const url = updateInfo.downloadUrl || updateInfo.releasesPage;
      if (url) {
        window.open(url, "_system");
      }
      onClose();
    }
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
      onClick={!isDownloading && !isRestarting ? onClose : undefined}
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
                {isRestarting ? "Restarting App..." : isDownloading ? "Downloading Update..." : "Update Available!"}
              </h3>
              <p style={{ fontSize: "0.74rem", color: "var(--accent-cyan)", margin: 0, fontWeight: 700 }}>
                Version v{updateInfo.latestVersion}
              </p>
            </div>
          </div>
          {!isDownloading && !isRestarting && (
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
          )}
        </div>

        {/* Release Notes or Progress Bar */}
        {isRestarting ? (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--accent-green)", fontWeight: 800, fontSize: "0.92rem", marginBottom: "6px" }}>
              <CheckIcon size={18} />
              <span>Update Ready!</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Applying update and restarting fresh app. Please wait a moment...
            </p>
          </div>
        ) : isDownloading ? (
          <div
            style={{
              background: "rgba(56, 189, 248, 0.06)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>In-App Package Download</span>
              <span style={{ color: "var(--accent-cyan)", fontWeight: 800 }}>{progress.percent}%</span>
            </div>
            {/* Progress bar */}
            <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: "100%",
                  background: "var(--accent-gradient)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span>{progress.transferredMB} MB / {progress.totalMB} MB</span>
              <span>{progress.speedMBps} MB/s</span>
            </div>
          </div>
        ) : (
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
            {updateInfo.releaseNotes || "Performance enhancements, in-app auto updater, and bug fixes."}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "14px",
              fontSize: "0.78rem",
              color: "var(--accent-red)",
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {!isRestarting && (
          <div style={{ display: "flex", gap: "10px" }}>
            {!isDownloading && (
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
            )}
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isDownloading}
              style={{
                flex: isDownloading ? 1 : 1.6,
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
                cursor: isDownloading ? "not-allowed" : "pointer",
              }}
            >
              {isDownloading ? (
                <>
                  <RefreshIcon size={16} className="animate-spin" />
                  <span>Downloading ({progress.percent}%)</span>
                </>
              ) : (
                <>
                  <DownloadIcon size={16} />
                  <span>{isElectron ? "Update App Now" : "Download Update"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
