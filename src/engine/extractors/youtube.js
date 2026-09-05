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

        // Map video qualities
        if (pieData.video_qualities && pieData.video_qualities.length > 0) {
          for (const q of pieData.video_qualities) {
            formats.push({
              formatId: `pie-v-${q.height}`,
              resolution: `${q.height}p HD`,
              ext: "mp4",
              url: pieData.direct_stream_url || "",
              requiresServerDownload: !pieData.direct_stream_url,
              qualityValue: String(q.height),
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: q.label || `${q.height}p HD (Universal MP4)`,
            });
          }
        }

        // Map audio qualities
        if (pieData.audio_qualities && pieData.audio_qualities.length > 0) {
          for (const a of pieData.audio_qualities) {
            formats.push({
              formatId: `pie-a-${a.bitrate}`,
              resolution: `${a.bitrate}kbps`,
              ext: "mp3",
              url: pieData.direct_stream_url || "",
              requiresServerDownload: !pieData.direct_stream_url,
              qualityValue: String(a.bitrate),
              hasAudio: true,
              hasVideo: false,
              type: "audio",
              label: a.label || `${a.bitrate} kbps (MP3 Audio)`,
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
      }
    }
  } catch (err) {
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
            formatId: "yt-1080",
            resolution: "1080p HD",
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
            label: "Ultra Studio Audio (320 kbps MP3)",
          },
        ],
      };
    }
  } catch (err) {
    console.warn("oEmbed fallback failed:", err.message);
  }

  throw new Error(
    "Unable to resolve YouTube video. Please ensure the link is public and accessible."
  );
};

