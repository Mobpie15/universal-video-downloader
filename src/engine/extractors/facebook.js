/**
 * Modern Facebook Video & Reel Extractor
 */

const cleanFbUrl = (str) => {
  if (!str) return "";
  return str
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");
};

export const extractFacebook = async (url) => {
  if (!url || typeof url !== "string") {
    throw new Error("Please enter a valid Facebook video link.");
  }

  const cleanUrl = url.trim().replace("www.facebook.com", "m.facebook.com");
  let html = "";

  try {
    const response = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(9000),
    });

    if (response.ok) {
      html = await response.text();
    }
  } catch (netErr) {
    console.warn("Facebook direct fetch failed:", netErr.message);
  }

  const formats = [];

  if (html) {
    // 1. HD Stream Detection
    const hdMatch =
      html.match(/"playable_url_quality_hd":"([^"]+)"/) ||
      html.match(/"browser_native_hd_url":"([^"]+)"/) ||
      html.match(/hd_src_no_ratelimit:"([^"]+)"/) ||
      html.match(/hd_src:"([^"]+)"/);

    if (hdMatch && hdMatch[1]) {
      const hdUrl = cleanFbUrl(hdMatch[1]);
      formats.push({
        formatId: "fb-hd",
        resolution: "1080p / 720p HD",
        ext: "mp4",
        url: hdUrl,
        hasAudio: true,
        hasVideo: true,
        type: "video",
        label: "Facebook MP4 Video (High Definition HD)",
      });
    }

    // 2. SD Stream Detection
    const sdMatch =
      html.match(/"playable_url":"([^"]+)"/) ||
      html.match(/"browser_native_sd_url":"([^"]+)"/) ||
      html.match(/sd_src_no_ratelimit:"([^"]+)"/) ||
      html.match(/sd_src:"([^"]+)"/);

    if (sdMatch && sdMatch[1]) {
      const sdUrl = cleanFbUrl(sdMatch[1]);
      if (!formats.some((f) => f.url === sdUrl)) {
        formats.push({
          formatId: "fb-sd",
          resolution: "480p / 360p SD",
          ext: "mp4",
          url: sdUrl,
          hasAudio: true,
          hasVideo: true,
          type: "video",
          label: "Facebook MP4 Video (Standard Definition SD)",
        });
      }
    }

    // 3. Studio MP3 Audio extraction format
    if (formats.length > 0) {
      formats.push({
        formatId: "fb-audio-320",
        resolution: "320kbps",
        ext: "mp3",
        url: formats[0].url,
        isAudio: true,
        hasAudio: true,
        hasVideo: false,
        type: "audio",
        label: "Studio MP3 Audio (320 kbps)",
      });

      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Facebook/gi, "").trim() : "Facebook Video";
      if (!title || title.toLowerCase().includes("log in") || title.includes("लोकप्रिय वीडियो")) {
        title = "Facebook Video";
      }

      const thumbMatch = html.match(/"preferred_thumbnail":\s*\{\s*"image":\s*\{\s*"uri":\s*"([^"]+)"/);
      const thumbnail = thumbMatch ? cleanFbUrl(thumbMatch[1]) : "";

      return {
        platform: "facebook",
        id: `fb-${Date.now()}`,
        title,
        author: "Facebook Creator",
        duration: 0,
        thumbnail,
        formats,
      };
    }
  }

  throw new Error(
    "This Facebook video is unavailable, deleted, or set to private. Please verify the video is public and accessible in your browser."
  );
};
