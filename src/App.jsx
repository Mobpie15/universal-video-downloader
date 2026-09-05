import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.jsx";
import { UrlInput } from "./components/UrlInput.jsx";
import { MediaPreview } from "./components/MediaPreview.jsx";
import { DownloadQueue } from "./components/DownloadQueue.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";
import { extractMedia } from "./engine/extractors/index.js";
import { universalDownloader } from "./engine/downloader.js";
import { showToast, readClipboard } from "./engine/nativeBridge.js";
import { ShieldIcon } from "./components/icons/Icons.jsx";

export default function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [media, setMedia] = useState(null);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-detect URL from clipboard on app launch
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
            await showToast("Link detected from clipboard");
          }
        }
      } catch (err) {
        console.log("Initial clipboard read:", err);
      }
    };
    checkInitialClipboard();
  }, []);

  const handleFetchMedia = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setMedia(null);

    try {
      const extracted = await extractMedia(url.trim());
      setMedia(extracted);
      await showToast(`Found ${extracted.formats?.length || 0} stream formats`);
    } catch (err) {
      console.error("Extraction failed:", err);
      setError(err.message || "Failed to parse video. Please verify the URL and try again.");
      await showToast("Extraction failed");
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

    // Add to download queue
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

    // Kick off download
    universalDownloader.startDownload({
      id: downloadId,
      url: fmt.url,
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
              ? { ...item, status: "completed", percent: 100, path }
              : item
          )
        );
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
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main style={{ flex: 1, maxWidth: "880px", margin: "0 auto", padding: "28px 16px", width: "100%" }}>
        {/* App Hero Introduction */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              background: "rgba(6, 182, 212, 0.12)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              borderRadius: "20px",
              color: "var(--accent-cyan)",
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: "14px",
            }}
          >
            <ShieldIcon size={14} />
            <span>Zero Server Load • 100% Client-Side Device Execution</span>
          </div>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "10px",
            }}
          >
            Universal Video Downloader
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Download HD video and audio directly on your device from YouTube, Instagram Reels, TikTok, Facebook, and Twitter/X with zero watermarks.
          </p>
        </div>

        {/* URL Input & Platform Detection */}
        <UrlInput
          url={url}
          setUrl={setUrl}
          onFetch={handleFetchMedia}
          isLoading={isLoading}
        />

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "var(--accent-red)",
              fontSize: "0.88rem",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Media Details & Quality Format Picker */}
        <MediaPreview
          media={media}
          onDownloadFormat={handleDownloadFormat}
          downloadingFormatId={downloadingFormatId}
        />

        {/* Active & Completed Download Manager */}
        <DownloadQueue
          items={downloadQueue}
          onCancelDownload={handleCancelDownload}
          onClearCompleted={handleClearCompleted}
        />
      </main>

      {/* Settings & Architecture Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Clean Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "20px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          PIETools Universal Downloader • Direct Local Device Engine • Zero Emojis
        </div>
      </footer>
    </div>
  );
}
