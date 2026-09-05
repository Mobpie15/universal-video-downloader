/**
 * TikTok Client-Side Watermark-Free Extractor
 */

export const extractTikTok = async (url) => {
  // Support both standard tiktok.com/@user/video/123 and vm.tiktok.com / vt.tiktok.com short links
  const directApiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(directApiUrl);
  if (!response.ok) {
    throw new Error(`TikTok resolution failed with status ${response.status}`);
  }

  const resData = await response.json();
  if (resData.code !== 0 || !resData.data) {
    throw new Error(resData.msg || "Could not find TikTok video streams");
  }

  const item = resData.data;
  const formats = [];

  // No Watermark Video (HD)
  if (item.hdplay || item.play) {
    formats.push({
      formatId: "tt-nowm-hd",
      resolution: "HD (No Watermark)",
      ext: "mp4",
      url: item.hdplay || item.play,
      hasAudio: true,
      hasVideo: true,
      label: "MP4 Video (No Watermark)",
      filesize: item.size || null,
    });
  }

  // Audio / Music track
  if (item.music) {
    formats.push({
      formatId: "tt-audio",
      resolution: "Audio (MP3)",
      ext: "mp3",
      url: item.music,
      hasAudio: true,
      hasVideo: false,
      label: `Original Sound - ${item.music_info?.title || "Audio Track"}`,
    });
  }

  return {
    platform: "tiktok",
    id: item.id || "tiktok-video",
    title: item.title || "TikTok Video",
    author: item.author?.nickname || item.author?.unique_id || "TikTok Creator",
    duration: item.duration || 0,
    thumbnail: item.cover || item.origin_cover,
    formats,
  };
};
