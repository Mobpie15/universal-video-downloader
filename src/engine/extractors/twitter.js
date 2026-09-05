/**
 * Twitter / X Client-Side Video Extractor
 */

export const extractTwitter = async (url) => {
  // Extract Tweet ID
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:[^\/]+)\/status\/(\d+)/);
  if (!match || !match[1]) {
    throw new Error("Invalid Twitter / X tweet status link");
  }
  const tweetId = match[1];

  // Twitter public syndication API (Returns direct MP4 video variants without API key)
  const apiUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=4`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Twitter syndication request failed (${response.status})`);
  }

  const tweet = await response.json();
  const mediaDetails = tweet.mediaDetails || (tweet.video ? [tweet.video] : []);
  const videoMedia = mediaDetails.find((m) => m.type === "video" || m.video_info);

  if (!videoMedia || !videoMedia.video_info || !videoMedia.video_info.variants) {
    throw new Error("No video found in this tweet");
  }

  const variants = videoMedia.video_info.variants
    .filter((v) => v.content_type === "video/mp4" && v.url)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  if (variants.length === 0) {
    throw new Error("No MP4 video streams found for this tweet");
  }

  const formats = variants.map((v, index) => {
    const bitrateKbps = Math.round((v.bitrate || 0) / 1000);
    return {
      formatId: `tw-${bitrateKbps || index}`,
      resolution: bitrateKbps > 0 ? `${bitrateKbps} kbps` : "Standard MP4",
      ext: "mp4",
      url: v.url,
      hasAudio: true,
      hasVideo: true,
      label: bitrateKbps > 1000 ? `High Quality (${bitrateKbps} kbps)` : `Standard (${bitrateKbps} kbps)`,
    };
  });

  return {
    platform: "twitter",
    id: tweetId,
    title: tweet.text ? tweet.text.slice(0, 70) : `X Video ${tweetId}`,
    author: tweet.user?.name || tweet.user?.screen_name || "X User",
    duration: Math.round((videoMedia.video_info.duration_millis || 0) / 1000),
    thumbnail: videoMedia.media_url_https,
    formats,
  };
};
