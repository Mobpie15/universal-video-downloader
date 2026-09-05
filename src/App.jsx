import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { UrlInput } from "./components/UrlInput.jsx";
import { MediaPreview } from "./components/MediaPreview.jsx";
import { DownloadQueue } from "./components/DownloadQueue.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";
import { ErrorReportModal } from "./components/ErrorReportModal.jsx";
import { UpdatePromptModal } from "./components/UpdatePromptModal.jsx";
import { extractMedia } from "./engine/extractors/index.js";
import { universalDownloader } from "./engine/downloader.js";
import { showToast, readClipboard } from "./engine/nativeBridge.js";
import { checkForUpdates } from "./engine/updater.js";
import { CloseIcon } from "./components/icons/Icons.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("downloader"); // "downloader" | "downloads" | "settings"
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [media, setMedia] = useState(null);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
  const [updatePrompt, setUpdatePrompt] = useState(null);

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

  const handleFetchMedia = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setMedia(null);

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

  const handleDownloadFormat = async (fmt) => {
    if (!media || !fmt) return;
    const downloadId = `${media.id}-${fmt.formatId}-${Date.now()}`;
    setDownloadingFormatId(fmt.formatId);

    const safeTitle = media.title.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40);
    const fileName = `${safeTitle}_${fmt.resolution}.${fmt.ext}`;

    const queueItem = {
      id: downloadId,
      title: media.title,
      fileName,
      formatLabel: fmt.label || fmt.resolution,
      status: "downloading",
      percent: 0,
      speedMBps: "0.0",
      etaSeconds: 0,
      path: "",
    };

    setDownloadQueue((prev) => [queueItem, ...prev]);

    // Switch to downloader or notify
    showToast("Download started...");

    universalDownloader.startDownload({
      id: downloadId,
      url: fmt.url,
      mediaUrl: url.trim(),
      formatId: fmt.formatId,
      resolution: fmt.resolution,
      ext: fmt.ext,
      isAudio: !fmt.hasVideo || fmt.type === "audio",
      title: media.title,
      fileName,
      totalExpectedBytes: fmt.filesize,
      onProgress: ({ percent, speedMBps, etaSeconds }) => {
        setDownloadQueue((prev) =>
          prev.map((item) =>
            item.id === downloadId
              ? { ...item, percent, speedMBps, etaSeconds }
              : item
          )
        );
      },
      onComplete: ({ success, path }) => {
        setDownloadingFormatId(null);
        setDownloadQueue((prev) =>
          prev.map((item) =>
            item.id === downloadId
              ? { ...item, status: "completed", percent: 100, path: path || item.path }
              : item
          )
        );
        showToast("Download complete! Saved to device.");
      },
      onError: (err) => {
        setDownloadingFormatId(null);
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Native App Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDownloads={() => setActiveTab("downloads")}
        downloadsCount={downloadQueue.length}
      />

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: "920px",
          margin: "0 auto",
          padding: "20px 18px 32px 18px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {activeTab === "downloader" ? (
          <>
            {/* Search Input & Platform Shortcuts */}
            <UrlInput
              url={url}
              setUrl={setUrl}
              onFetch={handleFetchMedia}
              isLoading={isLoading}
            />

            {/* Error Message Box */}
            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "14px",
                  color: "#FCA5A5",
                  fontSize: "0.84rem",
                  marginBottom: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span style={{ flex: 1, minWidth: "180px" }}>{error}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setReportModalData({
                        errorMessage: error,
                        targetUrl: url.trim(),
                        context: "Media Extraction Failure",
                      })
                    }
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#FFFFFF",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Facing issue? Report to Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    style={{ color: "var(--accent-red)", padding: "2px" }}
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Video Preview & Format Selection */}
            <MediaPreview
              media={media}
              onDownloadFormat={handleDownloadFormat}
              downloadingFormatId={downloadingFormatId}
            />

            {/* Active Downloads & Recent 3 Downloads */}
            <DownloadQueue
              items={downloadQueue}
              onCancelDownload={handleCancelDownload}
              onClearCompleted={handleClearCompleted}
              onDeleteItem={handleDeleteItem}
              isFullView={false}
            />
          </>
        ) : (
          /* "My Files" Library Tab */
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
    </div>
  );
}
