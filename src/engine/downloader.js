import { saveFileToDevice } from "./nativeBridge.js";

/**
 * Universal Stream Downloader with Live Progress, Speed Calculation, and Device Storage Write
 */
export class Downloader {
  constructor() {
    this.activeDownloads = new Map();
  }

  async startDownload({
    id,
    url,
    mediaUrl,
    formatId,
    resolution,
    ext,
    isAudio,
    title,
    fileName,
    totalExpectedBytes,
    onProgress, // ({ percent, speedMBps, etaSeconds, downloadedBytes, totalBytes })
    onComplete, // ({ success, path })
    onError,    // (error)
  }) {
    // 1. Electron Desktop Native Downloader Engine (yt-dlp + ffmpeg muxing)
    if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.downloadMedia === "function") {
      let cleanupProgress = null;
      if (window.electronAPI.onDownloadProgress) {
        cleanupProgress = window.electronAPI.onDownloadProgress(id, (prog) => {
          if (onProgress) {
            onProgress({
              percent: prog.percent || 0,
              speedMBps: prog.speedMBps || "0.0",
              etaSeconds: prog.etaSeconds || 0,
              downloadedBytes: 0,
              totalBytes: 0,
            });
          }
        });
      }

      this.activeDownloads.set(id, {
        isElectron: true,
        cancel: () => {
          if (window.electronAPI.cancelDownload) window.electronAPI.cancelDownload(id);
          if (cleanupProgress) cleanupProgress();
        },
      });

      try {
        const result = await window.electronAPI.downloadMedia({
          id,
          url: mediaUrl || url,
          formatId,
          resolution,
          ext,
          isAudio,
          title,
          fileName,
        });

        if (cleanupProgress) cleanupProgress();
        this.activeDownloads.delete(id);

        if (onComplete) {
          onComplete({
            success: true,
            fileName: result.fileName || fileName,
            path: result.path || "",
          });
        }
        return;
      } catch (err) {
        if (cleanupProgress) cleanupProgress();
        this.activeDownloads.delete(id);
        if (onError) onError(err);
        return;
      }
    }

    // 2. Mobile / Web Direct Stream Downloader
    const controller = new AbortController();
    this.activeDownloads.set(id, { controller, status: "downloading" });

    let downloadTargetUrl = url;

    // Check if the stream requires server-side generation
    if (!downloadTargetUrl || downloadTargetUrl.includes("/api/download-file?id=")) {
      try {
        if (onProgress) {
          onProgress({
            percent: 5,
            speedMBps: "Preparing...",
            etaSeconds: 0,
            downloadedBytes: 0,
            totalBytes: 0,
          });
        }

        const prepRes = await fetch("https://www.pietools.online/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: mediaUrl || url,
            mode: isAudio ? "audio" : "video",
            quality: resolution ? resolution.replace(/[^0-9]/g, "") || "720" : "720",
            audioFormat: "mp3",
            audioBitrate: "320",
          }),
          signal: controller.signal,
        });

        const prepData = await prepRes.json();
        if (!prepData.success || !prepData.downloadUrl) {
          throw new Error(
            prepData.error ||
              "YouTube is temporarily rate-limiting server processing. Please try another quality or use Desktop."
          );
        }
        downloadTargetUrl = `https://www.pietools.online${prepData.downloadUrl}`;
      } catch (prepErr) {
        if (prepErr.name === "AbortError") return;
        this.activeDownloads.delete(id);
        if (onError) onError(prepErr);
        return;
      }
    }

    const startTime = Date.now();
    let downloadedBytes = 0;
    let lastTime = startTime;
    let lastBytes = 0;
    let currentSpeedMBps = 0;

    try {
      const response = await fetch(downloadTargetUrl, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Media stream returned HTTP ${response.status}`);
      }

      const contentLength = response.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : totalExpectedBytes || 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloadedBytes += value.length;

        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000;

        // Update speed calculation every 300ms
        if (timeDiff >= 0.3) {
          const bytesDiff = downloadedBytes - lastBytes;
          currentSpeedMBps = (bytesDiff / (1024 * 1024)) / timeDiff;
          lastTime = now;
          lastBytes = downloadedBytes;
        }

        let percent = 0;
        let etaSeconds = 0;

        if (totalBytes > 0) {
          percent = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
          const remainingBytes = totalBytes - downloadedBytes;
          const speedBytesPerSec = currentSpeedMBps * 1024 * 1024;
          if (speedBytesPerSec > 0) {
            etaSeconds = Math.round(remainingBytes / speedBytesPerSec);
          }
        }

        if (onProgress) {
          onProgress({
            percent,
            speedMBps: currentSpeedMBps.toFixed(1),
            etaSeconds,
            downloadedBytes,
            totalBytes,
          });
        }
      }

      // Concatenate received chunks into Blob with proper MIME type
      const mimeType = isAudio ? "audio/mpeg" : "video/mp4";
      const blob = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const cleanFileName = fileName.replace(/[\\/*?:"<>|]/g, "_");

      // Save to device storage (Android Downloads / PC file system)
      const saveResult = await saveFileToDevice({
        fileName: cleanFileName,
        blob,
      });

      this.activeDownloads.delete(id);

      if (onComplete) {
        onComplete({
          success: true,
          fileName: cleanFileName,
          size: downloadedBytes,
          path: saveResult.path,
          blobUrl,
        });
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log(`Download ${id} was paused/cancelled by user`);
        this.activeDownloads.delete(id);
      } else {
        console.error("Download failure:", err);
        this.activeDownloads.delete(id);
        if (onError) onError(err);
      }
    }
  }

  cancelDownload(id) {
    const item = this.activeDownloads.get(id);
    if (item) {
      if (item.isElectron && typeof item.cancel === "function") {
        item.cancel();
      } else if (item.controller) {
        item.controller.abort();
      }
      this.activeDownloads.delete(id);
      return true;
    }
    return false;
  }
}

export const universalDownloader = new Downloader();
