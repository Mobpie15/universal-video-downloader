/**
 * YouTube Client-Side Innertube Extractor
 * Executes directly on client device via Android / Web client profiles
 */

export const extractYouTube = async (url) => {
  // Extract Video ID
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/;
  const match = url.match(regExp);
  if (!match || !match[1]) {
    throw new Error("Invalid YouTube video or Shorts URL");
  }
  const videoId = match[1];

  // Call YouTube Innertube API using mobile client strategy
  const innertubeBody = {
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "19.09.37",
        androidSdkVersion: 34,
        hl: "en",
        gl: "US",
        utcOffsetMinutes: 0,
      },
    },
    videoId: videoId,
    contentCheckOk: true,
    racyCheckOk: true,
  };

  const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 14; US) gzip",
    },
    body: JSON.stringify(innertubeBody),
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  const playability = data.playabilityStatus || {};

  if (playability.status !== "OK" && playability.status !== "LIVE_STREAM_OFFLINE") {
    // If Android client is blocked or restricted, try TV client
    return await extractYouTubeTvClient(videoId);
  }

  const videoDetails = data.videoDetails || {};
  const streamingData = data.streamingData || {};
  const formats = [];

  // Combined formats (Video + Audio)
  if (streamingData.formats) {
    for (const f of streamingData.formats) {
      if (f.url) {
        formats.push({
          formatId: `${f.itag}`,
          resolution: f.qualityLabel || `${f.height}p` || "Standard",
          quality: f.quality || "medium",
          ext: f.mimeType?.includes("mp4") ? "mp4" : "webm",
          url: f.url,
          filesize: f.contentLength ? parseInt(f.contentLength, 10) : null,
          hasAudio: true,
          hasVideo: true,
          type: "video",
          label: `${f.qualityLabel || `${f.height}p`} (MP4 Video + Audio)`,
        });
      }
    }
  }

  // Adaptive formats (High-res video only & Audio only)
  if (streamingData.adaptiveFormats) {
    for (const f of streamingData.adaptiveFormats) {
      if (f.url) {
        const isAudio = f.mimeType?.startsWith("audio/");
        const isVideo = f.mimeType?.startsWith("video/");

        if (isAudio) {
          formats.push({
            formatId: `${f.itag}`,
            resolution: `${Math.round((f.bitrate || 128000) / 1000)}kbps`,
            quality: "audio",
            ext: f.mimeType?.includes("mp4") ? "m4a" : "opus",
            url: f.url,
            filesize: f.contentLength ? parseInt(f.contentLength, 10) : null,
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: `Audio Only (${Math.round((f.bitrate || 128000) / 1000)} kbps ${f.mimeType?.includes("mp4") ? "M4A" : "WebM"})`,
          });
        } else if (isVideo && f.qualityLabel) {
          // Add 1080p, 1440p, 4K video formats
          formats.push({
            formatId: `${f.itag}`,
            resolution: f.qualityLabel,
            quality: f.quality,
            ext: f.mimeType?.includes("mp4") ? "mp4" : "webm",
            url: f.url,
            filesize: f.contentLength ? parseInt(f.contentLength, 10) : null,
            hasAudio: false,
            hasVideo: true,
            type: "video_adaptive",
            label: `${f.qualityLabel} (${f.mimeType?.includes("mp4") ? "MP4" : "WebM"})`,
          });
        }
      }
    }
  }

  // Select best thumbnail
  const thumbs = videoDetails.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    platform: "youtube",
    id: videoId,
    title: videoDetails.title || "YouTube Video",
    author: videoDetails.author || "Unknown Channel",
    duration: parseInt(videoDetails.lengthSeconds, 10) || 0,
    thumbnail,
    formats,
  };
};

const extractYouTubeTvClient = async (videoId) => {
  const tvBody = {
    context: {
      client: {
        clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        clientVersion: "2.0",
        hl: "en",
        gl: "US",
      },
    },
    videoId: videoId,
  };

  const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (SmartHub; SMART-TV; Linux/SmartTV) AppleWebKit/538.1 (KHTML, like Gecko) Safari/538.1",
    },
    body: JSON.stringify(tvBody),
  });

  const data = await response.json();
  const videoDetails = data.videoDetails || {};
  const streamingData = data.streamingData || {};
  const formats = [];

  if (streamingData.formats) {
    for (const f of streamingData.formats) {
      if (f.url) {
        formats.push({
          formatId: `${f.itag}`,
          resolution: f.qualityLabel || `${f.height}p`,
          ext: "mp4",
          url: f.url,
          filesize: f.contentLength ? parseInt(f.contentLength, 10) : null,
          hasAudio: true,
          hasVideo: true,
          type: "video",
          label: `${f.qualityLabel || `${f.height}p`} (MP4 Video)`,
        });
      }
    }
  }

  return {
    platform: "youtube",
    id: videoId,
    title: videoDetails.title || "YouTube Video",
    author: videoDetails.author || "Creator",
    duration: parseInt(videoDetails.lengthSeconds, 10) || 0,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    formats,
  };
};
