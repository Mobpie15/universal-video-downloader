import { extractYouTube } from "./youtube.js";
import { extractInstagram } from "./instagram.js";
import { extractTikTok } from "./tiktok.js";
import { extractFacebook } from "./facebook.js";
import { extractTwitter } from "./twitter.js";

export const detectPlatform = (url) => {
  if (!url || typeof url !== "string") return "unknown";
  const lower = url.toLowerCase().trim();

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) return "facebook";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mkv")) return "direct";

  return "generic";
};

export const extractMedia = async (url) => {
  // If running in Desktop App, use native high-performance engine for all sites
  if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.extractMedia === "function") {
    try {
      const desktopResult = await window.electronAPI.extractMedia(url);
      if (desktopResult && desktopResult.formats && desktopResult.formats.length > 0) {
        return desktopResult;
      }
    } catch (e) {
      console.warn("Desktop native extraction fallback to web extractors:", e);
    }
  }

  const platform = detectPlatform(url);

  switch (platform) {
    case "youtube":
      return await extractYouTube(url);
    case "instagram":
      return await extractInstagram(url);
    case "tiktok":
      return await extractTikTok(url);
    case "facebook":
      return await extractFacebook(url);
    case "twitter":
      return await extractTwitter(url);
    case "direct": {
      const fileName = url.split("/").pop().split("?")[0] || "video.mp4";
      return {
        platform: "direct",
        id: "direct-" + Date.now(),
        title: fileName,
        author: "Direct Media Link",
        duration: 0,
        thumbnail: "",
        formats: [
          {
            formatId: "direct",
            resolution: "Original Stream",
            ext: fileName.split(".").pop() || "mp4",
            url,
            hasAudio: true,
            hasVideo: true,
            label: `Direct Stream (${fileName.split(".").pop()?.toUpperCase()})`,
          },
        ],
      };
    }
    default:
      // Try generic extractor or attempt YouTube/Instagram parser
      try {
        return await extractYouTube(url);
      } catch {
        throw new Error(
          "Unsupported or invalid URL. Please enter a valid YouTube, Instagram, TikTok, Facebook, or Twitter/X video link."
        );
      }
  }
};
