import React, { useState } from "react";
import {
  CloseIcon,
  FolderIcon,
  DevicePhoneIcon,
  DownloadIcon,
  RefreshIcon,
  CheckIcon,
  ExternalLinkIcon,
  SparklesIcon,
  GlobeIcon,
  CameraIcon,
} from "./icons/Icons.jsx";
import { getPlatformName, showToast } from "../engine/nativeBridge.js";
import { checkForUpdates, CURRENT_VERSION } from "../engine/updater.js";

export const SettingsModal = ({ isOpen, onClose }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState({ percent: 0, speedMBps: "0.0", transferredMB: "0", totalMB: "0" });
  const [isRestarting, setIsRestarting] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [igConnected, setIgConnected] = useState(false);
  const [isConnectingIg, setIsConnectingIg] = useState(false);

  React.useEffect(() => {
    if (window.electronAPI?.getInstagramSession) {
      window.electronAPI.getInstagramSession().then((res) => {
        setIgConnected(Boolean(res?.connected));
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleConnectInstagram = async () => {
    if (window.electronAPI?.openInstagramLogin) {
      setIsConnectingIg(true);
      try {
        const res = await window.electronAPI.openInstagramLogin();
        if (res && res.success) {
          setIgConnected(true);
          showToast("Instagram connected successfully!");
        }
      } catch (e) {
        showToast("Login dismissed");
      } finally {
        setIsConnectingIg(false);
      }
    }
  };

  const handleDisconnectInstagram = async () => {
    if (window.electronAPI?.logoutInstagram) {
      try {
        await window.electronAPI.logoutInstagram();
        setIgConnected(false);
        showToast("Instagram disconnected");
      } catch (e) {}
    }
  };

  React.useEffect(() => {
    if (window.electronAPI?.onUpdateProgress) {
      const unsub = window.electronAPI.onUpdateProgress((data) => {
        setUpdateProgress(data);
      });
      return unsub;
    }
  }, []);

  if (!isOpen) return null;

  const platform = getPlatformName();
  const isElectron = Boolean(window.electronAPI?.isElectron && window.electronAPI?.startInAppUpdate);

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    setUpdateInfo(null);
    setUpdateError(null);
    try {
      const result = await checkForUpdates();
      setUpdateInfo(result);
      if (result.hasUpdate) {
        showToast(`New update v${result.latestVersion} available!`);
      } else if (result.success) {
        showToast("App is up to date!");
      } else {
        showToast("Could not check updates");
      }
    } catch (e) {
      setUpdateInfo({ success: false, error: e.message });
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartUpdate = async () => {
    if (isElectron) {
      setIsDownloading(true);
      setUpdateError(null);
      try {
        const downloadUrl = updateInfo.downloadUrl;
        await window.electronAPI.startInAppUpdate({ downloadUrl });
        setIsDownloading(false);
        setIsRestarting(true);

        setTimeout(async () => {
          try {
            await window.electronAPI.installAndRestart();
          } catch (err) {
            setUpdateError(err.message || "Failed to restart application");
            setIsRestarting(false);
          }
        }, 1500);
      } catch (err) {
        setIsDownloading(false);
        setUpdateError(err.message || "Update download failed");
      }
    } else {
      const url = updateInfo?.downloadUrl || updateInfo?.releasesPage;
      if (url) {
        window.open(url, "_system");
      }
    }
  };

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
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.35)",
              }}
            >
              <DownloadIcon size={16} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Settings &amp; Updates
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
          {/* IN-APP UPDATER CARD */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "14px",
              padding: "14px",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SparklesIcon size={16} style={{ color: "var(--accent-cyan)" }} />
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>App Updates</span>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  fontWeight: 700,
                }}
              >
                v{CURRENT_VERSION}
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "0 0 10px 0" }}>
              Check for new releases and install updates directly without visiting app stores.
            </p>

            {/* Check for updates action */}
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={isChecking}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "var(--accent-cyan)",
                fontWeight: 700,
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: isChecking ? "not-allowed" : "pointer",
              }}
            >
              {isChecking ? (
                <>
                  <RefreshIcon size={15} className="animate-spin" />
                  <span>Checking GitHub Releases...</span>
                </>
              ) : (
                <>
                  <RefreshIcon size={15} />
                  <span>Check for Updates Now</span>
                </>
              )}
            </button>

            {/* Update Result Feedback */}
            {updateInfo && (
              <div style={{ marginTop: "12px" }}>
                {updateInfo.hasUpdate ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-green)", fontWeight: 700, fontSize: "0.84rem", marginBottom: "4px" }}>
                      <CheckIcon size={16} />
                      <span>New Version v{updateInfo.latestVersion} Available!</span>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                      {updateInfo.releaseNotes}
                    </p>

                    {isRestarting ? (
                      <div style={{ textAlign: "center", padding: "8px 0", color: "var(--accent-green)", fontSize: "0.8rem", fontWeight: 700 }}>
                        Applying update and restarting app...
                      </div>
                    ) : isDownloading ? (
                      <div style={{ marginTop: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", marginBottom: "4px", color: "var(--text-primary)" }}>
                          <span>Downloading package...</span>
                          <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>{updateProgress.percent}%</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                          <div style={{ width: `${updateProgress.percent}%`, height: "100%", background: "var(--accent-gradient)", transition: "width 0.2s" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          <span>{updateProgress.transferredMB} MB / {updateProgress.totalMB} MB</span>
                          <span>{updateProgress.speedMBps} MB/s</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartUpdate}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "9px",
                          background: "var(--accent-green)",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <DownloadIcon size={14} />
                        <span>{isElectron ? "Update App Now (Seamless)" : "Download Update (.apk)"}</span>
                      </button>
                    )}

                    {updateError && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ color: "var(--accent-red)", fontSize: "0.72rem", marginBottom: "6px" }}>
                          {updateError}
                        </div>
                        {updateInfo?.releasesPage && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.electronAPI?.openExternal) {
                                window.electronAPI.openExternal(updateInfo.releasesPage);
                              } else {
                                window.open(updateInfo.releasesPage, "_system");
                              }
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "7px",
                              background: "rgba(255, 255, 255, 0.08)",
                              color: "#FFFFFF",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <GlobeIcon size={13} />
                            <span>Open GitHub Releases Page</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : updateInfo.success ? (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                    }}
                  >
                    <CheckIcon size={15} style={{ color: "var(--accent-green)" }} />
                    <span>You are on the latest version (v{CURRENT_VERSION})!</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      borderRadius: "10px",
                      padding: "10px",
                      color: "var(--accent-red)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {updateInfo.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INSTAGRAM ACCOUNT INTEGRATION TILE */}
          {isElectron && (
            <div
              style={{
                background: "var(--bg-input)",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid rgba(225, 48, 108, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CameraIcon size={18} style={{ color: "#E1306C" }} />
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Instagram Session</span>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: igConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)",
                    color: igConnected ? "var(--accent-green)" : "var(--text-tertiary)",
                    border: `1px solid ${igConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                    fontWeight: 700,
                  }}
                >
                  {igConnected ? "Connected" : "Not Connected"}
                </span>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                Connect your Instagram account to download private stories, close friends' reels, and user highlights safely without third-party servers.
              </p>

              {igConnected ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <span style={{ fontSize: "0.74rem", color: "var(--accent-green)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <CheckIcon size={13} /> Session Active (Stories &amp; Highlights Unlocked)
                  </span>
                  <button
                    type="button"
                    onClick={handleDisconnectInstagram}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "var(--accent-red)",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectInstagram}
                  disabled={isConnectingIg}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    background: "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)",
                    color: "#FFF",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isConnectingIg ? "not-allowed" : "pointer",
                    border: "none",
                    boxShadow: "0 3px 12px rgba(225, 48, 108, 0.3)",
                  }}
                >
                  <span>{isConnectingIg ? "Opening Login Window..." : "Connect Instagram (In-App Login)"}</span>
                </button>
              )}
            </div>
          )}

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
              Files are saved directly to your device&apos;s <strong>Downloads</strong> folder and appear instantly in your Gallery / Photos app.
            </p>
          </div>

          {/* Device Environment */}
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
              Platform: <strong style={{ color: "var(--text-primary)" }}>{platform.toUpperCase()}</strong> with native hardware acceleration enabled.
            </p>
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
