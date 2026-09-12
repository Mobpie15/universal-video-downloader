/**
 * TikTok Multi-Engine Watermark-Free Extractor
 */

export const extractTikTok = async (url) => {
  if (!url || typeof url !== "string") {
    throw new Error("Please enter a valid TikTok video URL.");
  }
  const cleanUrl = url.trim();

  // Tier 1: Primary TikWM Extractor Engine
  try {
    const directApiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(directApiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(9000),
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.code === 0 && resData.data) {
        const item = resData.data;
        const formats = [];

        // HD No-Watermark Stream
        if (item.hdplay || item.play) {
          formats.push({
            formatId: "tt-nowm-hd",
            resolution: "1080p Full HD (No Watermark)",
            ext: "mp4",
            url: item.hdplay || item.play,
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "TikTok MP4 (HD No Watermark)",
            filesize: item.size || null,
          });
        }

        // Standard Stream (fallback)
        if (item.play && item.hdplay && item.play !== item.hdplay) {
          formats.push({
            formatId: "tt-nowm-sd",
            resolution: "720p Standard",
            ext: "mp4",
            url: item.play,
            hasAudio: true,
            hasVideo: true,
            type: "video",
            label: "TikTok MP4 (Standard Quality)",
            filesize: null,
          });
        }

        // Studio Audio / Music track
        if (item.music || (formats[0] && formats[0].url)) {
          formats.push({
            formatId: "tt-audio",
            resolution: "320kbps",
            ext: "mp3",
            url: item.music || formats[0].url,
            isAudio: true,
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: `Studio MP3 Audio - ${item.music_info?.title || "Original Sound"}`,
          });
        }

        if (formats.length > 0) {
          return {
            platform: "tiktok",
            id: String(item.id || Date.now()),
            title: item.title || "TikTok Video",
            author: item.author?.nickname ? `@${item.author.nickname}` : "TikTok Creator",
            duration: item.duration || 0,
            thumbnail: item.cover || item.origin_cover || "",
            formats,
          };
        }
      }
    }
  } catch (err) {
    console.warn("TikWM API failed, attempting secondary engine:", err.message);
  }

  // Tier 2: Secondary Lovetik Fallback Engine
  try {
    const loveRes = await fetch("https://lovetik.com/api/ajax/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
      body: `query=${encodeURIComponent(cleanUrl)}`,
      signal: AbortSignal.timeout(8000),
    });

    if (loveRes.ok) {
      const data = await loveRes.json();
      if (data && data.links && data.links.length > 0) {
        const formats = [];
        data.links.forEach((link, idx) => {
          if (link.a && link.t && !link.t.includes("Watermark")) {
            const isAudio = link.t.toLowerCase().includes("mp3") || link.t.toLowerCase().includes("audio");
            formats.push({
              formatId: `tt-love-${idx + 1}`,
              resolution: isAudio ? "320kbps" : "HD No Watermark",
              ext: isAudio ? "mp3" : "mp4",
              url: link.a,
              isAudio,
              hasAudio: true,
              hasVideo: !isAudio,
              type: isAudio ? "audio" : "video",
              label: `TikTok ${isAudio ? "Studio MP3 Audio" : "MP4 Video (No Watermark)"}`,
            });
          }
        });

        if (formats.length > 0) {
          return {
            platform: "tiktok",
            id: String(data.vid || Date.now()),
            title: data.desc || "TikTok Video",
            author: data.author ? `@${data.author}` : "TikTok Creator",
            duration: 0,
            thumbnail: data.cover || "",
            formats,
          };
        }
      }
    }
  } catch (e) {
    console.warn("Lovetik fallback failed:", e.message);
  }

  // Clean, user-friendly error message
  throw new Error(
    "This TikTok video is unavailable, deleted, or set to private by the creator. Please check if the video is publicly accessible in a browser."
  );
};
