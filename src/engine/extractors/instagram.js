/**
 * Instagram Client-Side Reels & Video Extractor
 */

export const extractInstagram = async (url) => {
  // Extract Shortcode
  const regex = /(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/;
  const match = url.match(regex);
  if (!match || !match[1]) {
    throw new Error("Invalid Instagram Reel or Video URL");
  }
  const shortcode = match[1];

  try {
    // Attempt 1: Direct JSON endpoint with mobile user agent
    const apiUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Accept": "*/*",
      },
    });

    if (response.ok) {
      const json = await response.json();
      const item = json.graphql?.shortcode_media || json.items?.[0];
      if (item) {
        const videoUrl = item.video_url || item.video_versions?.[0]?.url;
        const thumbnail = item.display_url || item.image_versions2?.candidates?.[0]?.url;
        const caption = item.edge_media_to_caption?.edges?.[0]?.node?.text || item.caption?.text || "Instagram Reel";

        if (videoUrl) {
          return {
            platform: "instagram",
            id: shortcode,
            title: caption.slice(0, 80) || `Instagram Reel ${shortcode}`,
            author: item.owner?.username || "Instagram Creator",
            duration: item.video_duration ? Math.round(item.video_duration) : 0,
            thumbnail,
            formats: [
              {
                formatId: "ig-hd",
                resolution: "HD (Original)",
                ext: "mp4",
                url: videoUrl,
                hasAudio: true,
                hasVideo: true,
                label: "Instagram MP4 Video (HD)",
              },
            ],
          };
        }
      }
    }
  } catch (err) {
    console.warn("Direct Instagram API attempt failed, trying embed parser:", err);
  }

  // Attempt 2: Public Embed Page Scraping
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const embedRes = await fetch(embedUrl);
    const html = await embedRes.text();

    const videoMatch = html.match(/class="EmbeddedMediaVideo"[^>]*src="([^"]+)"/) || html.match(/"video_url":"([^"]+)"/);
    if (videoMatch && videoMatch[1]) {
      const directUrl = videoMatch[1].replace(/\\u0026/g, "&");
      return {
        platform: "instagram",
        id: shortcode,
        title: `Instagram Reel ${shortcode}`,
        author: "Instagram User",
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
            label: "Instagram MP4 Video",
          },
        ],
      };
    }
  } catch (e) {
    console.warn("Embed scraping failed:", e);
  }

  throw new Error("Unable to extract Instagram video. The post might be private or deleted.");
};
