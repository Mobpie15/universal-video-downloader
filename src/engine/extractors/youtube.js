/**
 * YouTube Multi-Tier Extractor
 * Tier 1: Desktop Native Engine (yt-dlp via Electron IPC bridge)
 * Tier 2: Official PieTools Media API (https://www.pietools.online/api/info)
 * Tier 3: OEmbed Metadata Resolver Fallback
 */

export const extractYouTube = async (url) => {
  // Extract Video ID
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/;
  const match = url.match(regExp);
  if (!match || !match[1]) {
    throw new Error("Invalid YouTube video or Shorts link. Please enter a valid URL.");
  }
  const videoId = match[1];

  // Tier 1: If running inside Electron Desktop App, use Native Desktop Extractor
  if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.extractMedia === "function") {
    try {
      const desktopResult = await window.electronAPI.extractMedia(url);
      if (desktopResult && desktopResult.formats && desktopResult.formats.length > 0) {
        return desktopResult;
      }
    } catch (desktopErr) {
      const errMsg = desktopErr.message || "";
      const lower = errMsg.toLowerCase();
      // If the error is an explicit playability failure, fail fast with an accurate explanation
      if (
        lower.includes("unavailable") ||
        lower.includes("private") ||
        lower.includes("deleted") ||
        lower.includes("age-restricted") ||
        lower.includes("blocked")
      ) {
        throw desktopErr;
      }
      console.warn("Desktop native extraction fell back to cloud API:", desktopErr.message);
    }
  }

  // Tier 2: Official PieTools Media API
  try {
    const pieRes = await fetch("https://www.pietools.online/api/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(8000),
    });

    if (pieRes.ok) {
      const pieData = await pieRes.json();
      if (pieData.success) {
        const formats = [];

        // Map video qualities - Enforce server-side muxing so video and audio are always combined
        if (pieData.video_qualities && pieData.video_qualities.length > 0) {
          for (const q of pieData.video_qualities) {
            const h = parseInt(q.height, 10) || 1080;
            const is4K = h >= 2160;
            const is2K = h >= 1440 && h < 2160;
            const resLabel = is4K ? "4K Ultra HD (2160p)" : is2K ? "2K Quad HD (1440p)" : `${h}p HD`;
            formats.push({
              formatId: `pie-v-${h}`,
              resolution: resLabel,
              ext: "mp4",
              url: "",
              requiresServerDownload: true,
              qualityValue: String(h),
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: q.label || `${resLabel} (Universal MP4)`,
            });
          }
        }

        // Map audio qualities - Enforce server-side conversion to clean MP3
        if (pieData.audio_qualities && pieData.audio_qualities.length > 0) {
          for (const a of pieData.audio_qualities) {
            formats.push({
              formatId: `pie-a-${a.bitrate}`,
              resolution: `${a.bitrate}kbps`,
              ext: "mp3",
              url: "",
              requiresServerDownload: true,
              qualityValue: String(a.bitrate),
              hasAudio: true,
              hasVideo: false,
              type: "audio",
              label: a.label || `Studio MP3 Audio (${a.bitrate} kbps)`,
            });
          }
        }

        if (formats.length > 0) {
          return {
            platform: "youtube",
            id: videoId,
            title: pieData.title || "YouTube Video",
            author: pieData.uploader || "YouTube Creator",
            duration: pieData.duration || 0,
            thumbnail: pieData.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            formats,
          };
        }
      } else if (pieData.error) {
        const lower = pieData.error.toLowerCase();
        if (lower.includes("unavailable") || lower.includes("private") || lower.includes("deleted")) {
          throw new Error(pieData.error);
        }
      }
    }
  } catch (err) {
    if (err.message && (err.message.includes("unavailable") || err.message.includes("private"))) {
      throw err;
    }
    console.warn("PieTools cloud API attempt timed out or failed:", err.message);
  }

  // Tier 3: Direct YouTube oEmbed Metadata Resolver Fallback
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembedRes = await fetch(oembedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (oembedRes.ok) {
      const data = await oembedRes.json();
      const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        platform: "youtube",
        id: videoId,
        title: data.title || "YouTube Video",
        author: data.author_name || "YouTube Creator",
        duration: 0,
        thumbnail: thumb,
        formats: [
          {
            formatId: "yt-2160",
            resolution: "4K Ultra HD (2160p)",
            ext: "mp4",
            url: "",
            requiresServerDownload: true,
            qualityValue: "2160",
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "4K Ultra HD (2160p Universal MP4)",
          },
          {
            formatId: "yt-1080",
            resolution: "1080p Full HD",
            ext: "mp4",
            url: "",
            requiresServerDownload: true,
            qualityValue: "1080",
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "1080p Full HD (Universal MP4)",
          },
          {
            formatId: "yt-720",
            resolution: "720p HD",
            ext: "mp4",
            url: "",
            requiresServerDownload: true,
            qualityValue: "720",
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "720p HD (Universal MP4)",
          },
          {
            formatId: "yt-360",
            resolution: "360p Data Saver",
            ext: "mp4",
            url: "",
            requiresServerDownload: true,
            qualityValue: "360",
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "360p Data Saver (MP4)",
          },
          {
            formatId: "yt-audio-320",
            resolution: "320kbps",
            ext: "mp3",
            url: "",
            requiresServerDownload: true,
            qualityValue: "320",
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: "Studio MP3 Audio (320 kbps)",
          },
        ],
      };
    }
  } catch (err) {
    console.warn("oEmbed fallback failed:", err.message);
  }

  throw new Error(
    "This YouTube video is unavailable, private, or has been removed from YouTube. Please verify the URL or try an active video link."
  );
};


