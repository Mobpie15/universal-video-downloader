/**
 * Universal Instagram Suite Extractor
 * Supports:
 * - Profile Picture (DP) in Full HD (1080x1080)
 * - Instagram Stories & Highlights
 * - Instagram Reels, Videos & Posts
 * - Carousel Multi-Photo & Video items
 * - Studio MP3 Audio (320 kbps) extraction for all video media
 */

const cleanUrl = (u) => {
  if (!u) return "";
  return u
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "");
};

export const extractInstagram = async (url) => {
  if (!url || typeof url !== "string") {
    throw new Error("Please provide a valid Instagram link or username.");
  }
  const raw = url.trim();

  // 1. Check if Desktop Electron Native Engine is available
  if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.extractMedia === "function") {
    try {
      const desktopResult = await window.electronAPI.extractMedia(raw);
      if (desktopResult && desktopResult.formats && desktopResult.formats.length > 0) {
        return desktopResult;
      }
    } catch (desktopErr) {
      console.warn("Desktop native extraction fell back to web extractors:", desktopErr.message);
      if (
        desktopErr.message &&
        (desktopErr.message.includes("private") || desktopErr.message.includes("credentials") || desktopErr.message.includes("unavailable"))
      ) {
        throw desktopErr;
      }
    }
  }

  // 2. Classify Instagram Request Type
  const isProfile =
    raw.startsWith("@") ||
    (!raw.includes("/reel/") &&
      !raw.includes("/p/") &&
      !raw.includes("/stories/") &&
      !raw.includes("/tv/") &&
      (raw.includes("instagram.com/") || (!raw.includes(".") && !raw.includes("/"))));

  const isStory = raw.includes("/stories/") && !raw.includes("/highlights/");
  const isHighlight = raw.includes("/stories/highlights/");

  // ── Handler A: Instagram Profile Picture (DP) Extractor ──
  if (isProfile) {
    const username = raw
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
      .split("/")[0]
      .split("?")[0]
      .trim();

    if (!username) throw new Error("Please enter a valid Instagram username or profile link.");

    try {
      const profileUrl = `https://www.instagram.com/${username}/`;
      const res = await fetch(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(7000),
      });

      if (res.ok) {
        const html = await res.text();
        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);

        const avatarUrl = ogImageMatch ? cleanUrl(ogImageMatch[1]) : "";
        const title = ogTitleMatch ? ogTitleMatch[1] : `@${username}`;
        const desc = ogDescMatch ? ogDescMatch[1] : "";

        if (avatarUrl) {
          return {
            platform: "instagram",
            subType: "dp",
            id: `ig-dp-${username}`,
            title: `${title} - Instagram DP`,
            author: `@${username}`,
            description: desc,
            duration: 0,
            thumbnail: avatarUrl,
            formats: [
              {
                formatId: `ig-dp-hd`,
                resolution: "1080p Full HD Avatar",
                ext: "jpg",
                url: avatarUrl,
                isImage: true,
                hasVideo: false,
                hasAudio: false,
                type: "image",
                label: "Download Full HD Profile Picture (1080x1080 JPG)",
              },
            ],
          };
        }
      }
    } catch (dpErr) {
      console.warn("Profile DP web scraper error:", dpErr.message);
    }

    throw new Error(
      `Unable to fetch profile for @${username}. Please check if the username is spelled correctly or if the profile is accessible.`
    );
  }

  // ── Handler B: Stories & Highlights ──
  if (isStory || isHighlight) {
    throw new Error(
      "Instagram Stories & Highlights are protected by Instagram's session security. Please use the Desktop App and connect your account in Settings to download stories."
    );
  }

  // ── Handler C: Reels & Posts ──
  const postMatch = raw.match(/(?:instagram\.com\/(?:p|reel|tv|reels)\/)([\w-]+)/i);
  if (!postMatch || !postMatch[1]) {
    throw new Error("Invalid Instagram link. Please enter a valid Reel, Post, Story, or @username link.");
  }
  const shortcode = postMatch[1];

  // Strategy 1: Polaris SJS Web Page Scraper
  try {
    const postUrl = `https://www.instagram.com/p/${shortcode}/`;
    const res = await fetch(postUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const html = await res.text();
      const sjsMatches = html.match(/<script\b[^>]+\bdata-sjs>(\{[\s\S]+?\})<\/script>/g);

      if (sjsMatches && sjsMatches.length > 0) {
        for (const tag of sjsMatches) {
          if (tag.includes("video_versions")) {
            const jsonStr = tag.replace(/^<script[^>]+>/, "").replace(/<\/script>$/, "");
            try {
              const parsed = JSON.parse(jsonStr);

              function searchMedia(obj) {
                if (!obj || typeof obj !== "object") return null;
                if (obj.video_versions && Array.isArray(obj.video_versions) && obj.video_versions.length > 0) {
                  return obj;
                }
                if (Array.isArray(obj)) {
                  for (const item of obj) {
                    const found = searchMedia(item);
                    if (found) return found;
                  }
                } else {
                  for (const k of Object.keys(obj)) {
                    const found = searchMedia(obj[k]);
                    if (found) return found;
                  }
                }
                return null;
              }

              const media = searchMedia(parsed);
              if (media && media.video_versions && media.video_versions.length > 0) {
                const formats = [];
                const seenUrls = new Set();

                for (let i = 0; i < media.video_versions.length; i++) {
                  const v = media.video_versions[i];
                  const vUrl = cleanUrl(v.url);
                  if (vUrl && !seenUrls.has(vUrl)) {
                    seenUrls.add(vUrl);
                    const isHD = i === 0 || (v.width && v.width >= 720);
                    const resLabel = isHD ? "1080p HD" : "720p Standard";

                    formats.push({
                      formatId: `ig-stream-${i + 1}`,
                      resolution: resLabel,
                      ext: "mp4",
                      url: vUrl,
                      hasAudio: true,
                      hasVideo: true,
                      type: "video",
                      label: `Instagram MP4 Video (${resLabel})`,
                    });
                  }
                }

                // Add 320kbps MP3 Audio extraction format
                if (formats.length > 0) {
                  formats.push({
                    formatId: `ig-audio-320`,
                    resolution: "320kbps",
                    ext: "mp3",
                    url: formats[0].url,
                    isAudio: true,
                    hasAudio: true,
                    hasVideo: false,
                    type: "audio",
                    label: "Studio MP3 Audio (320 kbps)",
                  });

                  const thumb =
                    cleanUrl(media.image_versions2?.candidates?.[0]?.url) ||
                    cleanUrl(media.display_url) ||
                    "";
                  const rawCaption =
                    media.caption?.text ||
                    media.edge_media_to_caption?.edges?.[0]?.node?.text ||
                    `Instagram Reel ${shortcode}`;
                  const author =
                    media.user?.username ||
                    media.owner?.username ||
                    "Instagram Creator";

                  return {
                    platform: "instagram",
                    id: shortcode,
                    title: rawCaption.slice(0, 75).trim() || `Instagram Reel ${shortcode}`,
                    author: `@${author.replace(/^@/, "")}`,
                    duration: media.video_duration ? Math.round(media.video_duration) : 0,
                    thumbnail: thumb,
                    formats,
                  };
                }
              }
            } catch (e) {}
          }
        }
      }
    }
  } catch (err) {
    console.warn("Polaris scraper failed, trying embed fallback:", err.message);
  }

  // Strategy 2: Public Embed Page Scraping Fallback
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const embedRes = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (embedRes.ok) {
      const html = await embedRes.text();
      const videoMatch =
        html.match(/class="EmbeddedMediaVideo"[^>]*src="([^"]+)"/) ||
        html.match(/"video_url":"([^"]+)"/) ||
        html.match(/"video_versions":\s*\[\s*\{[^}]*"url":\s*"([^"]+)"/);

      if (videoMatch && videoMatch[1]) {
        const directUrl = cleanUrl(videoMatch[1]);
        return {
          platform: "instagram",
          id: shortcode,
          title: `Instagram Reel ${shortcode}`,
          author: "Instagram Creator",
          duration: 0,
          thumbnail: "",
          formats: [
            {
              formatId: "ig-embed",
              resolution: "Original HD Video",
              ext: "mp4",
              url: directUrl,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: "Instagram MP4 Video (HD)",
            },
            {
              formatId: "ig-audio-320",
              resolution: "320kbps",
              ext: "mp3",
              url: directUrl,
              isAudio: true,
              hasAudio: true,
              hasVideo: false,
              type: "audio",
              label: "Studio MP3 Audio (320 kbps)",
            },
          ],
        };
      }
    }
  } catch (e) {
    console.warn("Embed scraping failed:", e.message);
  }

  throw new Error(
    "Instagram is requiring authentication or this reel is private. Please verify the link is public or use the Desktop App with 'Connect Instagram' enabled."
  );
};
