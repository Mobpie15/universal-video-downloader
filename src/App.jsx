import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { UrlInput } from "./components/UrlInput.jsx";
import { MediaPreview } from "./components/MediaPreview.jsx";
import { DownloadQueue } from "./components/DownloadQueue.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";
import { ErrorReportModal } from "./components/ErrorReportModal.jsx";
import { UpdatePromptModal } from "./components/UpdatePromptModal.jsx";
import ShortcutsModal from "./components/ShortcutsModal.jsx";
import AppInstructions from "./components/AppInstructions.jsx";
import { extractMedia } from "./engine/extractors/index.js";
import { universalDownloader } from "./engine/downloader.js";
import { showToast, readClipboard } from "./engine/nativeBridge.js";
import { checkForUpdates } from "./engine/updater.js";
import { CloseIcon, DownloadIcon, RefreshIcon } from "./components/icons/Icons.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("downloader"); // "downloader" | "downloads" | "settings"
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [media, setMedia] = useState(null);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
  const [updatePrompt, setUpdatePrompt] = useState(null);
  // NEW: Track download state for clean single-screen UX
  const [isDownloadActive, setIsDownloadActive] = useState(false);
  const [lastDownloadCompleted, setLastDownloadCompleted] = useState(false);

  // Auto-check for updates & detect URL from clipboard on app launch
  useEffect(() => {
    const checkInitialClipboard = async () => {
      try {
        const text = await readClipboard();
        if (text && text.trim().startsWith("http") && !url) {
          const lower = text.toLowerCase();
          if (
            lower.includes("youtube.com") ||
            lower.includes("youtu.be") ||
            lower.includes("instagram.com") ||
            lower.includes("tiktok.com") ||
            lower.includes("facebook.com") ||
            lower.includes("x.com") ||
            lower.includes("twitter.com")
          ) {
            setUrl(text.trim());
          }
        }
      } catch (err) {
        console.log("Initial clipboard read:", err);
      }
    };

    const checkStartupUpdate = async () => {
      try {
        const info = await checkForUpdates();
        if (info && info.hasUpdate) {
          setUpdatePrompt(info);
        }
      } catch (err) {
        console.log("Startup update check:", err);
      }
    };

    checkInitialClipboard();
    checkStartupUpdate();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+V, Ctrl+/, Ctrl+,, Esc, Enter)
  useEffect(() => {
    const handleKeyDown = async (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      // Esc: Close any active modal
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setReportModalData(null);
        setUpdatePrompt(null);
        return;
      }

      // Ctrl + / or ?: Open Shortcuts modal
      if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Ctrl + ,: Open Settings modal
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // Ctrl + K or Ctrl + F: Focus URL input
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "f")) {
        e.preventDefault();
        const inputElem = document.querySelector('input[type="url"], input[placeholder*="Paste"]');
        if (inputElem) {
          inputElem.focus();
          inputElem.select();
        }
        return;
      }

      // Ctrl + V (when NOT typing in an input field): Instant paste and analyze
      if (!isInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        try {
          const text = await readClipboard();
          if (text && text.trim().startsWith("http")) {
            setUrl(text.trim());
            showToast("Pasted & analyzing link...");
            setIsLoading(true);
            setError(null);
            setMedia(null);
            try {
              const extracted = await extractMedia(text.trim());
              setMedia(extracted);
              showToast(`Found ${extracted.formats?.length || 0} qualities`);
            } catch (err) {
              setError(err.message || "Failed to parse video.");
            } finally {
              setIsLoading(false);
            }
          }
        } catch (err) {
          console.warn("Global paste error:", err);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, isShortcutsOpen, reportModalData, updatePrompt, url]);

  const handleFetchMedia = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setMedia(null);
    setIsDownloadActive(false);
    setLastDownloadCompleted(false);

    try {
      const extracted = await extractMedia(url.trim());
      setMedia(extracted);
      await showToast(`Found ${extracted.formats?.length || 0} qualities`);
    } catch (err) {
      console.error("Extraction failed:", err);
      const msg = err.message || "Failed to parse video. Please verify the URL and try again.";
      setError(msg);
      await showToast("Unable to resolve stream");
      setReportModalData({
        errorMessage: msg,
        errorStack: err.stack,
        targetUrl: url.trim(),
        context: "Video Extraction Failure",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFormat = async (fmt, trimOptions = {}) => {
    if (!media || !fmt) return;
    const { startTime, endTime, trimEnabled } = trimOptions;
    const downloadId = `${media.id}-${fmt.formatId}-${Date.now()}`;
    setDownloadingFormatId(fmt.formatId);
    setIsDownloadActive(true);
    setLastDownloadCompleted(false);

    const isImage = Boolean(fmt.isImage || fmt.type === "image" || fmt.ext === "jpg" || fmt.ext === "jpeg" || fmt.ext === "png" || fmt.ext === "webp");
    const isAudio = !isImage && (!fmt.hasVideo || fmt.type === "audio");
    const safeTitle = media.title.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40);
    const trimLabel = trimEnabled && (startTime || endTime) ? `_trim_${(startTime || "0000").replace(":", "")}-${(endTime || "").replace(":", "")}` : "";
    const fileName = `${safeTitle}_${fmt.resolution}${trimLabel}.${fmt.ext || (isImage ? "jpg" : "mp4")}`;

    const queueItem = {
      id: downloadId,
      title: media.title + (trimEnabled ? ` [Clip: ${startTime || "00:00"} - ${endTime}]` : ""),
      fileName,
      formatLabel: (fmt.label || fmt.resolution) + (trimEnabled ? ` (Trimmed ${startTime || "00:00"} - ${endTime})` : ""),
      thumbnail: media.thumbnail || "",
      author: media.author || "",
      duration: media.duration || 0,
      resolution: fmt.resolution,
      ext: fmt.ext || (isImage ? "jpg" : "mp4"),
      isImage,
      isAudio,
      status: "downloading",
      percent: 0,
      speedMBps: "preparing",
      etaSeconds: 0,
      path: "",
    };

    setDownloadQueue((prev) => [queueItem, ...prev]);
    showToast(isImage ? "Saving HD photo..." : trimEnabled ? "Downloading custom video clip..." : "Download started...");

    universalDownloader.startDownload({
      id: downloadId,
      url: fmt.url,
      mediaUrl: url.trim(),
      formatId: fmt.formatId,
      resolution: fmt.resolution,
      ext: fmt.ext || (isImage ? "jpg" : "mp4"),
      isAudio,
      isImage,
      title: media.title,
      fileName,
      totalExpectedBytes: fmt.filesize,
      startTime: trimEnabled ? startTime : null,
      endTime: trimEnabled ? endTime : null,
      onProgress: ({ percent, speedMBps, etaSeconds }) => {
        setDownloadQueue((prev) =>
          prev.map((item) =>
            item.id === downloadId
              ? { ...item, percent, speedMBps, etaSeconds }
              : item
          )
        );
      },
      onComplete: ({ success, path, blobUrl }) => {
        setDownloadingFormatId(null);
        setIsDownloadActive(false);
        setLastDownloadCompleted(true);
        setDownloadQueue((prev) =>
          prev.map((item) =>
            item.id === downloadId
              ? { ...item, status: "completed", percent: 100, path: path || item.path, blobUrl: blobUrl || item.blobUrl }
              : item
          )
        );
        showToast(isImage ? "Photo saved to Downloads!" : "Download complete! Saved with full audio.");
      },
      onError: (err) => {
        setDownloadingFormatId(null);
        setIsDownloadActive(false);
        setLastDownloadCompleted(false);
        setDownloadQueue((prev) =>
          prev.map((item) =>
            item.id === downloadId
              ? { ...item, status: "error", error: err.message }
              : item
          )
        );
        showToast("Download failed: " + err.message);
        setReportModalData({
          errorMessage: err.message,
          errorStack: err.stack,
          targetUrl: url.trim(),
          context: "Media Download & Muxing",
        });
      },
    });
  };

  const handleCancelDownload = (id) => {
    universalDownloader.cancelDownload(id);
    setDownloadQueue((prev) => prev.filter((item) => item.id !== id));
    setIsDownloadActive(false);
    showToast("Download cancelled");
  };

  const handleClearCompleted = () => {
    setDownloadQueue((prev) => prev.filter((item) => item.status === "downloading"));
    showToast("History cleared");
  };

  const handleDeleteItem = (id) => {
    setDownloadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTabSelect = (tab) => {
    if (tab === "settings") {
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Reset to fresh state for new download
  const handleDownloadAnother = () => {
    setUrl("");
    setMedia(null);
    setError(null);
    setIsDownloadActive(false);
    setLastDownloadCompleted(false);
    setDownloadingFormatId(null);
  };

  const hasActiveDownload = downloadQueue.some((i) => i.status === "downloading");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Native App Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        downloadsCount={downloadQueue.length}
      />

      {/* Main Container - Professional Desktop Layout */}
      <main
        style={{
          flex: 1,
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "24px 20px 36px 20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {activeTab === "downloader" ? (
          <>
            {/* Unified Professional Studio Workspace */}
            <UrlInput
              url={url}
              setUrl={setUrl}
              onFetch={handleFetchMedia}
              isLoading={isLoading}
            />

            {/* Error Message Box */}
            {error && (
              <div style={{
                padding: "12px 16px",
                background: "var(--red-muted)",
                border: "1px solid rgba(251, 113, 133, 0.25)",
                borderRadius: "var(--radius-md)",
                color: "var(--red)",
                fontSize: "0.84rem",
                marginBottom: "18px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}>
                <span style={{ flex: 1, minWidth: "160px", color: "var(--text-primary)", fontWeight: 500 }}>{error}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button type="button"
                    onClick={() => setReportModalData({ errorMessage: error, targetUrl: url.trim(), context: "Extraction" })}
                    style={{
                      padding: "5px 12px", borderRadius: "8px",
                      background: "rgba(251, 113, 133, 0.15)", border: "1px solid rgba(251, 113, 133, 0.25)",
                      color: "#FFF", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    Report Bug
                  </button>
                  <button type="button" onClick={() => setError(null)} style={{ color: "var(--red)", padding: "2px" }}>
                    <CloseIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Video Preview with 4K & Trimmer Controls */}
            {media && (
              <MediaPreview
                media={media}
                onDownloadFormat={handleDownloadFormat}
                downloadingFormatId={downloadingFormatId}
              />
            )}

            {/* App Instructions & Feature Guide (fills blank space with helpful guidance) */}
            {!media && !isLoading && (
              <AppInstructions />
            )}

            {/* Live Downloads Dashboard & Transfer Queue */}
            {downloadQueue.length > 0 && (
              <div style={{ marginTop: media ? "28px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Active Downloads &amp; History</span>
                    {hasActiveDownload && (
                      <span style={{ fontSize: "0.7rem", color: "var(--green)", background: "rgba(52, 211, 153, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                        Downloading
                      </span>
                    )}
                  </h3>
                  {media && (
                    <button
                      type="button"
                      onClick={handleDownloadAnother}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      + Download Another Video
                    </button>
                  )}
                </div>

                <DownloadQueue
                  items={downloadQueue}
                  onCancelDownload={handleCancelDownload}
                  onClearCompleted={handleClearCompleted}
                  onDeleteItem={handleDeleteItem}
                  isFullView={false}
                />
              </div>
            )}
          </>
        ) : (
          /* "Media Vault" Full Library Tab */
          <DownloadQueue
            items={downloadQueue}
            onCancelDownload={handleCancelDownload}
            onClearCompleted={handleClearCompleted}
            onDeleteItem={handleDeleteItem}
            isFullView={true}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        downloadsCount={downloadQueue.length}
      />

      {/* Settings Bottom Sheet Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Discord Error Reporting Modal */}
      <ErrorReportModal
        isOpen={Boolean(reportModalData)}
        onClose={() => setReportModalData(null)}
        errorMessage={reportModalData?.errorMessage}
        errorStack={reportModalData?.errorStack}
        targetUrl={reportModalData?.targetUrl}
        context={reportModalData?.context}
      />

      {/* Auto-Update Prompt Modal */}
      <UpdatePromptModal
        isOpen={Boolean(updatePrompt)}
        onClose={() => setUpdatePrompt(null)}
        updateInfo={updatePrompt}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
