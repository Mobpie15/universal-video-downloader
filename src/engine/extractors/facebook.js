/**
 * Facebook Client-Side Video Extractor
 */

export const extractFacebook = async (url) => {
  // Direct mobile page fetch to extract sd_src and hd_src
  const cleanUrl = url.replace("www.facebook.com", "m.facebook.com");
  const response = await fetch(cleanUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const html = await response.text();
  const formats = [];

  // Look for HD video URL
  const hdMatch = html.match(/"browser_native_hd_url":"([^"]+)"/) || html.match(/hd_src:"([^"]+)"/);
  if (hdMatch && hdMatch[1]) {
    const hdUrl = hdMatch[1].replace(/\\/g, "").replace(/&amp;/g, "&");
    formats.push({
      formatId: "fb-hd",
      resolution: "High Definition (HD)",
      ext: "mp4",
      url: hdUrl,
      hasAudio: true,
      hasVideo: true,
      label: "Facebook MP4 (HD 720p/1080p)",
    });
  }

  // Look for SD video URL
  const sdMatch = html.match(/"browser_native_sd_url":"([^"]+)"/) || html.match(/sd_src:"([^"]+)"/);
  if (sdMatch && sdMatch[1]) {
    const sdUrl = sdMatch[1].replace(/\\/g, "").replace(/&amp;/g, "&");
    formats.push({
      formatId: "fb-sd",
      resolution: "Standard Definition (SD)",
      ext: "mp4",
      url: sdUrl,
      hasAudio: true,
      hasVideo: true,
      label: "Facebook MP4 (SD 360p/480p)",
    });
  }

  if (formats.length === 0) {
    throw new Error("Could not find playable Facebook video streams. Video may be private or expired.");
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(" | Facebook", "") : "Facebook Video";

  return {
    platform: "facebook",
    id: "fb-video-" + Date.now(),
    title,
    author: "Facebook User",
    duration: 0,
    thumbnail: "",
    formats,
  };
};
