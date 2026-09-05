/**
 * High-Performance Instagram Reels & Video Extractor
 * Tier 1: Polaris SJS Web Page Scraper (Direct FB CDN MP4 streams with CORS enabled)
 * Tier 2: Embed Page Parser Fallback
 * Tier 3: Direct mobile JSON API (?__a=1&__d=dis)
 */

export const extractInstagram = async (url) => {
  // Extract Shortcode from /reel/, /p/, /tv/, or /reels/
  const regex = /(?:instagram\.com\/(?:p|reel|tv|reels)\/)([\w-]+)/i;
  const match = url.match(regex);
  if (!match || !match[1]) {
    throw new Error("Invalid Instagram link. Please enter a valid Reel or Post URL.");
  }
  const shortcode = match[1];

  // Helper to clean escaped strings from Instagram scripts
  const cleanUrl = (u) => {
    if (!u) return "";
    return u
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/")
      .replace(/\\/g, "");
  };

  // Tier 1: Polaris SJS Web Page Scraper
  try {
    const postUrl = `https://www.instagram.com/p/${shortcode}/`;
    const res = await fetch(postUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
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
                    const resolutionLabel = isHD ? "HD Quality" : "Data Saver (SD)";

                    formats.push({
                      formatId: `ig-stream-${i + 1}`,
                      resolution: resolutionLabel,
                      ext: "mp4",
                      url: vUrl,
                      hasAudio: true,
                      hasVideo: true,
                      type: "video",
                      label: `Instagram MP4 Video (${resolutionLabel})`,
                    });
                  }
                }

                if (formats.length > 0) {
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
            } catch (e) {
              // try next tag
            }
          }
        }
      }

      // Regex fallback directly on HTML
      const videoMatch = html.match(/"video_versions":\s*\[\s*\{[^}]*"url":\s*"([^"]+)"/);
      if (videoMatch && videoMatch[1]) {
        const directUrl = cleanUrl(videoMatch[1]);
        const thumbMatch = html.match(/"image_versions2":\s*\{\s*"candidates":\s*\[\s*\{[^}]*"url":\s*"([^"]+)"/);
        const thumb = thumbMatch ? cleanUrl(thumbMatch[1]) : "";
        const captionMatch = html.match(/"caption":\s*\{\s*"text":\s*"([^"]+)"/);
        const caption = captionMatch ? captionMatch[1] : `Instagram Reel ${shortcode}`;

        return {
          platform: "instagram",
          id: shortcode,
          title: caption.slice(0, 75).trim() || `Instagram Reel ${shortcode}`,
          author: "Instagram Creator",
          duration: 0,
          thumbnail: thumb,
          formats: [
            {
              formatId: "ig-hd",
              resolution: "HD (Original)",
              ext: "mp4",
              url: directUrl,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: "Instagram MP4 Video (HD)",
            },
          ],
        };
      }
    }
  } catch (err) {
    console.warn("Polaris scraper failed, trying embed fallback:", err.message);
  }

  // Tier 2: Public Embed Page Scraping Fallback
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const embedRes = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
              resolution: "Original Video",
              ext: "mp4",
              url: directUrl,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: "Instagram MP4 Video",
            },
          ],
        };
      }
    }
  } catch (e) {
    console.warn("Embed scraping failed:", e.message);
  }

  // Tier 3: Direct mobile JSON API
  try {
    const apiUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Accept": "*/*",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const json = await response.json();
      const item = json.graphql?.shortcode_media || json.items?.[0];
      if (item) {
        const videoUrl = item.video_url || item.video_versions?.[0]?.url;
        const thumbnail = item.display_url || item.image_versions2?.candidates?.[0]?.url;
        const caption =
          item.edge_media_to_caption?.edges?.[0]?.node?.text ||
          item.caption?.text ||
          `Instagram Reel ${shortcode}`;

        if (videoUrl) {
          return {
            platform: "instagram",
            id: shortcode,
            title: caption.slice(0, 75).trim() || `Instagram Reel ${shortcode}`,
            author: item.owner?.username ? `@${item.owner.username}` : "Instagram Creator",
            duration: item.video_duration ? Math.round(item.video_duration) : 0,
            thumbnail: cleanUrl(thumbnail),
            formats: [
              {
                formatId: "ig-direct",
                resolution: "HD (Original)",
                ext: "mp4",
                url: cleanUrl(videoUrl),
                hasAudio: true,
                hasVideo: true,
                type: "video",
                label: "Instagram MP4 Video (HD)",
              },
            ],
          };
        }
      }
    }
  } catch (err) {
    console.warn("Direct API fallback failed:", err.message);
  }

  throw new Error(
    "Unable to extract Instagram video. Please check if the link is public and active, or try another video."
  );
};
