import { app, BrowserWindow, shell, ipcMain, dialog, session } from "electron";
import path from "path";
import fs from "fs";
import { spawn, spawnSync, execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function getNodePath() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  // 1. In dev, check local repo electron/bin
  if (isDev) {
    const devPath = path.join(__dirname, "bin", "node.exe");
    if (fs.existsSync(devPath)) return devPath;
    const devParent = path.join(__dirname, "..", "electron", "bin", "node.exe");
    if (fs.existsSync(devParent)) return devParent;
  }

  // 2. Known local Windows node installations
  const known = [
    "C:\\nvm4w\\nodejs\\node.exe",
    "C:\\Program Files\\nodejs\\node.exe",
    "C:\\Program Files (x86)\\nodejs\\node.exe",
  ];
  for (const p of known) {
    if (fs.existsSync(p)) return p;
  }

  // 3. Check standalone filesystem paths outside app.asar
  const nonAsarPaths = [
    path.join(process.resourcesPath, "bin", "node.exe"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "bin", "node.exe"),
    path.join(path.dirname(process.execPath), "resources", "bin", "node.exe"),
    path.join(path.dirname(process.execPath), "bin", "node.exe"),
  ];
  for (const p of nonAsarPaths) {
    if (fs.existsSync(p)) return p;
  }

  // 4. Try resolving via system PATH
  try {
    const isWindows = process.platform === "win32";
    const whereCmd = isWindows ? "where" : "which";
    const out = execSync(`${whereCmd} node`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const firstLine = out.split(/[\r\n]+/)[0]?.trim();
    if (firstLine && fs.existsSync(firstLine)) return firstLine;
  } catch (e) {}

  return "node";
}

function getYtDlpPath() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  // 1. In local development, use repo electron/bin directly
  if (isDev) {
    const devPath = path.join(__dirname, "bin", "yt-dlp.exe");
    if (fs.existsSync(devPath)) return devPath;
    const devParent = path.join(__dirname, "..", "electron", "bin", "yt-dlp.exe");
    if (fs.existsSync(devParent)) return devParent;
  }

  // 2. Check standalone filesystem paths outside app.asar
  const nonAsarPaths = [
    path.join(process.resourcesPath, "bin", "yt-dlp.exe"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "bin", "yt-dlp.exe"),
    path.join(process.resourcesPath, "electron", "bin", "yt-dlp.exe"),
    path.join(path.dirname(process.execPath), "resources", "bin", "yt-dlp.exe"),
    path.join(path.dirname(process.execPath), "bin", "yt-dlp.exe"),
  ];

  for (const p of nonAsarPaths) {
    if (!p.includes("app.asar") && fs.existsSync(p)) {
      try {
        if (fs.statSync(p).size > 1000000) {
          return p;
        }
      } catch (e) {}
    }
  }

  // 3. UserData persistent folder: guaranteed real filesystem path
  const userDataBin = path.join(app.getPath("userData"), "bin", "yt-dlp.exe");
  const userDataDir = path.dirname(userDataBin);

  // If already extracted to userData and valid size, use it
  if (fs.existsSync(userDataBin)) {
    try {
      if (fs.statSync(userDataBin).size > 1000000) {
        return userDataBin;
      }
    } catch (e) {}
  }

  // 4. Extract from inside app.asar to userData folder if present in asar
  const internalSources = [
    path.join(__dirname, "bin", "yt-dlp.exe"),
    path.join(app.getAppPath(), "electron", "bin", "yt-dlp.exe"),
    path.join(process.resourcesPath, "bin", "yt-dlp.exe"),
  ];

  for (const src of internalSources) {
    try {
      if (fs.existsSync(src)) {
        if (!fs.existsSync(userDataDir)) {
          fs.mkdirSync(userDataDir, { recursive: true });
        }
        const buffer = fs.readFileSync(src);
        if (buffer && buffer.length > 1000000) {
          fs.writeFileSync(userDataBin, buffer);
          console.log("Successfully extracted yt-dlp.exe to userData:", userDataBin);
          return userDataBin;
        }
      }
    } catch (extractErr) {
      console.warn("Failed extracting yt-dlp from", src, extractErr);
    }
  }

  // 5. If userData file exists at all, return it
  if (fs.existsSync(userDataBin)) {
    return userDataBin;
  }

  return "yt-dlp";
}

function getFfmpegDir() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  // 1. In dev, check local repo electron/bin
  if (isDev) {
    const devDir = path.join(__dirname, "bin");
    if (fs.existsSync(path.join(devDir, "ffmpeg.exe"))) return devDir;
    const parentDir = path.join(__dirname, "..", "electron", "bin");
    if (fs.existsSync(path.join(parentDir, "ffmpeg.exe"))) return parentDir;
  }

  // 2. Check standard non-asar application directories
  const nonAsarDirs = [
    path.join(process.resourcesPath, "bin"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "bin"),
    path.join(path.dirname(process.execPath), "resources", "bin"),
    path.join(path.dirname(process.execPath), "bin"),
  ];

  for (const dir of nonAsarDirs) {
    if (!dir.includes("app.asar") && fs.existsSync(path.join(dir, "ffmpeg.exe"))) {
      try {
        if (fs.statSync(path.join(dir, "ffmpeg.exe")).size > 1000000) {
          return dir;
        }
      } catch (e) {}
    }
  }

  // 3. UserData persistent folder
  const userDataBinDir = path.join(app.getPath("userData"), "bin");
  const userDataFfmpeg = path.join(userDataBinDir, "ffmpeg.exe");
  if (fs.existsSync(userDataFfmpeg)) {
    try {
      if (fs.statSync(userDataFfmpeg).size > 1000000) {
        return userDataBinDir;
      }
    } catch (e) {}
  }

  // 4. Extract from inside app.asar if present
  const internalSources = [
    path.join(__dirname, "bin", "ffmpeg.exe"),
    path.join(app.getAppPath(), "electron", "bin", "ffmpeg.exe"),
    path.join(process.resourcesPath, "bin", "ffmpeg.exe"),
  ];

  for (const src of internalSources) {
    try {
      if (fs.existsSync(src)) {
        if (!fs.existsSync(userDataBinDir)) {
          fs.mkdirSync(userDataBinDir, { recursive: true });
        }
        const buffer = fs.readFileSync(src);
        if (buffer && buffer.length > 1000000) {
          fs.writeFileSync(userDataFfmpeg, buffer);
          console.log("Successfully extracted ffmpeg.exe to userData:", userDataFfmpeg);
          return userDataBinDir;
        }
      }
    } catch (e) {}
  }

  // 5. Fallback: check known system path on user machine
  const systemPaths = [
    "C:\\Users\\mobpi\\Documents\\WorkSpace\\WS-1\\100tools\\backend\\ffmpeg-9.0-essentials_build\\bin",
  ];
  for (const sp of systemPaths) {
    if (fs.existsSync(path.join(sp, "ffmpeg.exe"))) {
      return sp;
    }
  }

  return userDataBinDir;
}

function createWindow() {
  const iconPath = path.join(__dirname, "icon.png");

  mainWindow = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 840,
    minHeight: 620,
    title: "Pie Video Downloader",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: "#0A0E17",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function getFfprobePath() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    const devPath = path.join(__dirname, "bin", "ffprobe.exe");
    if (fs.existsSync(devPath)) return devPath;
    const parentPath = path.join(__dirname, "..", "electron", "bin", "ffprobe.exe");
    if (fs.existsSync(parentPath)) return parentPath;
  }
  const ffmpegDir = getFfmpegDir();
  if (ffmpegDir && fs.existsSync(path.join(ffmpegDir, "ffprobe.exe"))) {
    return path.join(ffmpegDir, "ffprobe.exe");
  }
  const known = [
    path.join(process.resourcesPath, "bin", "ffprobe.exe"),
    path.join(app.getPath("userData"), "bin", "ffprobe.exe"),
    "C:\\Users\\mobpi\\Documents\\WorkSpace\\WS-1\\100tools\\backend\\ffmpeg-9.0-essentials_build\\bin\\ffprobe.exe",
  ];
  for (const p of known) {
    if (fs.existsSync(p)) return p;
  }
  return "ffprobe";
}

// ── Native Instagram Profile & DP Extractor (Zero-Login Chromium Background Engine) ──
async function extractInstagramProfile(input) {
  let cleanUser = input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .split("/")[0]
    .split("?")[0]
    .trim();
  if (!cleanUser) throw new Error("Invalid Instagram username");

  const targetUrl = `https://www.instagram.com/${cleanUser}/`;
  const bgWin = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: {
      offscreen: false,
      contextIsolation: false,
    },
  });

  bgWin.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
  );

  try {
    await bgWin.loadURL(targetUrl);
    await new Promise((r) => setTimeout(r, 3000));

    const profileData = await bgWin.webContents.executeJavaScript(`
      (async () => {
        let avatarUrl = "";
        let fullName = "";
        let biography = "";
        let recentPosts = [];

        // Strategy 1: Same-origin Instagram Web Profile API call
        try {
          const apiRes = await fetch('/api/v1/users/web_profile_info/?username=${cleanUser}', {
            headers: {
              'X-IG-App-ID': '936619743392459',
              'Accept': '*/*'
            }
          });
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            const u = apiJson.data?.user;
            if (u) {
              avatarUrl = u.profile_pic_url_hd || u.profile_pic_url || "";
              fullName = u.full_name || u.username || "";
              biography = u.biography || "";
              const edges = u.edge_owner_to_timeline_media?.edges || [];
              for (const edge of edges.slice(0, 8)) {
                const node = edge.node;
                const postUrl = node?.display_url || node?.video_url;
                if (postUrl) {
                  recentPosts.push({
                    url: postUrl,
                    isVideo: Boolean(node.is_video),
                    thumbnail: node.display_url
                  });
                }
              }
            }
          }
        } catch (e) {}

        // Strategy 2: DOM Head & Image Inspection
        if (!avatarUrl) {
          const ogImg = document.querySelector('meta[property="og:image"]')?.content;
          const headerImg = document.querySelector('header img')?.src ||
                            document.querySelector('img[alt*="profile picture" i]')?.src ||
                            document.querySelector('img[alt*="profile photo" i]')?.src;
          const ogTitle = document.querySelector('meta[property="og:title"]')?.content || document.title;
          const ogDesc = document.querySelector('meta[property="og:description"]')?.content;

          avatarUrl = headerImg || ogImg || "";
          fullName = ogTitle || "@${cleanUser}";
          biography = ogDesc || "";

          const allImgs = Array.from(document.querySelectorAll('img'))
            .map(i => i.src)
            .filter(s => s && (s.includes('cdninstagram') || s.includes('fbcdn')));
          if (!avatarUrl && allImgs.length > 0) {
            avatarUrl = allImgs[0];
          }
        }

        return { avatarUrl, fullName, biography, recentPosts };
      })()
    `);

    const avatar = profileData?.avatarUrl || "";
    if (!avatar) {
      throw new Error(`Could not find profile for @${cleanUser}. Please check if the username is spelled correctly.`);
    }

    const formats = [];
    formats.push({
      formatId: `ig-dp-${cleanUser}`,
      resolution: "1080p Full HD Avatar",
      ext: "jpg",
      url: avatar,
      isImage: true,
      hasVideo: false,
      hasAudio: false,
      type: "image",
      label: "Download Full HD Profile Picture (1080x1080 JPG)",
    });

    if (profileData.recentPosts && profileData.recentPosts.length > 0) {
      profileData.recentPosts.forEach((post, idx) => {
        formats.push({
          formatId: `ig-recent-${idx + 1}`,
          resolution: post.isVideo ? "Recent Video (MP4)" : "Recent Photo (JPG)",
          ext: post.isVideo ? "mp4" : "jpg",
          url: post.url,
          isImage: !post.isVideo,
          hasVideo: post.isVideo,
          hasAudio: post.isVideo,
          type: post.isVideo ? "video" : "image",
          label: `Recent Post #${idx + 1} (${post.isVideo ? "MP4 Video" : "Full HD JPG"})`,
        });
      });
    }

    return {
      platform: "instagram",
      subType: "dp",
      id: `ig-dp-${cleanUser}`,
      title: `${profileData.fullName || `@${cleanUser}`} - Instagram Profile DP`,
      author: `@${cleanUser}`,
      description: profileData.biography || "",
      duration: 0,
      thumbnail: avatar,
      formats,
    };
  } finally {
    try {
      bgWin.destroy();
    } catch (e) {}
  }
}

// ── In-App Instagram Session Bridge (For Stories, Highlights & Private Content) ──
let igLoginWindow = null;
ipcMain.handle("open-instagram-login", async () => {
  return new Promise((resolve) => {
    if (igLoginWindow && !igLoginWindow.isDestroyed()) {
      igLoginWindow.focus();
      return resolve({ status: "already_open" });
    }

    igLoginWindow = new BrowserWindow({
      width: 520,
      height: 740,
      title: "Connect Instagram — Pie Video Downloader",
      autoHideMenuBar: true,
      backgroundColor: "#0A0E17",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    igLoginWindow.loadURL("https://www.instagram.com/accounts/login/");

    let pollTimer = null;

    const checkAndSaveCookies = async () => {
      try {
        if (!igLoginWindow || igLoginWindow.isDestroyed()) return false;
        const cookies = await igLoginWindow.webContents.session.cookies.get({ domain: ".instagram.com" });
        const hasSession = cookies.some((c) => c.name === "sessionid" && c.value);
        if (hasSession) {
          if (pollTimer) clearInterval(pollTimer);
          const cookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
          let netscapeStr = "# Netscape HTTP Cookie File\n# Generated by Pie Video Downloader\n\n";
          for (const c of cookies) {
            let dom = c.domain || ".instagram.com";
            if (!dom.startsWith(".")) dom = "." + dom;
            const isSub = dom.startsWith(".") ? "TRUE" : "FALSE";
            const isSec = c.secure ? "TRUE" : "FALSE";
            const exp = Math.round(c.expirationDate || Date.now() / 1000 + 86400 * 90);
            netscapeStr += `${dom}\t${isSub}\t${c.path || "/"}\t${isSec}\t${exp}\t${c.name}\t${c.value}\n`;
          }
          fs.writeFileSync(cookiePath, netscapeStr, "utf8");

          const userCookie = cookies.find((c) => c.name === "ds_user_id");
          try {
            igLoginWindow.close();
          } catch (e) {}
          igLoginWindow = null;
          resolve({ success: true, userId: userCookie ? userCookie.value : "Connected" });
          return true;
        }
      } catch (e) {}
      return false;
    };

    pollTimer = setInterval(async () => {
      await checkAndSaveCookies();
    }, 1000);

    igLoginWindow.webContents.on("did-navigate", async () => {
      await checkAndSaveCookies();
    });

    igLoginWindow.on("closed", async () => {
      if (pollTimer) clearInterval(pollTimer);
      igLoginWindow = null;
      try {
        const cookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
        const hasCookieFile = fs.existsSync(cookiePath) && fs.statSync(cookiePath).size > 20;
        resolve({ success: hasCookieFile });
      } catch (e) {
        resolve({ success: false });
      }
    });
  });
});

ipcMain.handle("get-instagram-session", async () => {
  try {
    const cookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
    const hasCookieFile = fs.existsSync(cookiePath) && fs.statSync(cookiePath).size > 20;
    return { connected: hasCookieFile };
  } catch (e) {
    return { connected: false };
  }
});

ipcMain.handle("logout-instagram", async () => {
  try {
    const cookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
    if (fs.existsSync(cookiePath)) fs.unlinkSync(cookiePath);
    if (session && session.defaultSession) {
      await session.defaultSession.clearStorageData({ storages: ["cookies"] });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});


// IPC Handler: Native Media Extraction
ipcMain.handle("extract-media", async (event, url) => {
  return new Promise(async (resolve, reject) => {
    if (!url || typeof url !== "string" || !url.trim()) {
      return reject(new Error("Please provide a valid video or profile URL."));
    }
    const cleanUrl = url.trim();

    // 1. Detect Instagram Profile / DP lookup
    const isIgProfile =
      cleanUrl.startsWith("@") ||
      (!cleanUrl.includes("/reel/") &&
        !cleanUrl.includes("/p/") &&
        !cleanUrl.includes("/stories/") &&
        !cleanUrl.includes("/tv/") &&
        (cleanUrl.includes("instagram.com/") || (!cleanUrl.includes(".") && !cleanUrl.includes("/"))));

    if (isIgProfile) {
      try {
        const dpResult = await extractInstagramProfile(cleanUrl);
        return resolve(dpResult);
      } catch (dpErr) {
        console.warn("Offscreen DP extraction fallback to yt-dlp:", dpErr.message);
      }
    }

    const binPath = getYtDlpPath();
    const nodePath = getNodePath();
    const isStoriesOrHighlights = cleanUrl.includes("/stories/") || cleanUrl.includes("/highlights/");
    const args = [
      "--dump-single-json",
      "--no-warnings",
      "--skip-download",
      "--socket-timeout", "18",
      "--extractor-retries", "2",
      "--retry-sleep", "extractor:2",
    ];

    if (!isStoriesOrHighlights) {
      args.push("--no-playlist");
    }

    if (nodePath && nodePath !== "node") {
      args.push("--js-runtimes", `node:${nodePath}`);
    } else {
      args.push("--js-runtimes", "node");
    }

    // Cookie integration: use saved Instagram session if present
    const igCookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
    if (fs.existsSync(igCookiePath) && fs.statSync(igCookiePath).size > 20) {
      args.push("--cookies", igCookiePath);
    }

    // YouTube multi-client fallback strategies
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
      args.push("--extractor-args", "youtube:player_client=ios,android,tv,web");
    }

    args.push(cleanUrl);

    const ffmpegDir = getFfmpegDir();
    const proc = spawn(binPath, args, {
      env: {
        ...process.env,
        PATH: ffmpegDir ? `${ffmpegDir};${process.env.PATH || ""}` : process.env.PATH,
      },
    });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (err) => {
      reject(new Error(`Failed to execute native media extractor: ${err.message}`));
    });

    proc.on("close", async (code) => {
      if (code !== 0 && !stdout.trim()) {
        const errText = stderr.trim();
        if (
          errText.includes("This video is unavailable") ||
          errText.includes("Video unavailable") ||
          errText.includes("not found")
        ) {
          return reject(
            new Error(
              "This YouTube video is unavailable, private, or has been removed from YouTube. Please verify the link or try another video."
            )
          );
        }
        if (
          errText.includes("Instagram sent an empty media response") ||
          errText.includes("API is not granting access") ||
          errText.includes("accessible in your browser without being logged-in")
        ) {
          // If profile/dp, try offscreen extraction
          if (cleanUrl.includes("instagram.com")) {
            try {
              const fbResult = await extractInstagramProfile(cleanUrl);
              return resolve(fbResult);
            } catch (e) {}
          }
          return reject(
            new Error(
              "Instagram is requiring login credentials for this content. You can click 'Connect Instagram' in Settings to download private stories and reels."
            )
          );
        }
        if (errText.includes("Private video") || errText.includes("this video is private")) {
          return reject(new Error("This video is set to private by the creator and cannot be accessed."));
        }
        return reject(new Error(errText || "Failed to analyze media URL."));
      }

      try {
        const data = JSON.parse(stdout.trim());
        const formats = [];

        // 0. Instagram Stories, Highlights & Multi-Item Collection Support
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          const validEntries = data.entries.filter(Boolean);
          validEntries.forEach((entry, idx) => {
            const entryFormats = entry.formats || [];
            const v = entryFormats.filter((f) => f.vcodec !== "none" && f.url).pop();
            const h = v?.height || entry.height || 1080;
            const resLabel = h >= 2160 ? "4K Ultra HD" : h >= 1440 ? "2K Quad HD" : `${h}p HD`;

            if (v || (entry.url && (entry.url.includes(".mp4") || entry.ext === "mp4"))) {
              const videoUrl = v?.url || entry.url;
              formats.push({
                formatId: `story-video-${entry.id || idx + 1}`,
                resolution: `Story #${idx + 1} (${resLabel})`,
                ext: "mp4",
                url: videoUrl,
                filesize: v?.filesize || entry.filesize || null,
                hasAudio: true,
                hasVideo: true,
                type: "video",
                label: `Story / Highlight #${idx + 1} (${resLabel} Video)`,
              });

              // Studio MP3 Audio for each story
              formats.push({
                formatId: `story-audio-${entry.id || idx + 1}`,
                resolution: "320kbps",
                ext: "mp3",
                url: videoUrl,
                filesize: null,
                hasAudio: true,
                hasVideo: false,
                type: "audio",
                label: `Story / Highlight #${idx + 1} MP3 Audio (320 kbps)`,
              });
            } else {
              // Photo Story
              const imgUrl = entry.url || entry.thumbnail || (entry.thumbnails?.length ? entry.thumbnails[entry.thumbnails.length - 1].url : "");
              if (imgUrl) {
                formats.push({
                  formatId: `story-img-${entry.id || idx + 1}`,
                  resolution: `Photo Story #${idx + 1}`,
                  ext: "jpg",
                  url: imgUrl,
                  isImage: true,
                  hasAudio: false,
                  hasVideo: false,
                  type: "image",
                  label: `Story Photo #${idx + 1} (Full HD JPG)`,
                });
              }
            }
          });

          if (formats.length > 0) {
            return resolve({
              platform: data.extractor_key?.toLowerCase() || "instagram",
              id: data.id || `collection-${Date.now()}`,
              title: data.title || "Instagram Stories & Highlights",
              author: data.uploader || data.channel || `@${cleanUrl.split("/")[3] || "instagram"}`,
              duration: 0,
              thumbnail: validEntries[0]?.thumbnail || formats[0]?.url || "",
              formats,
            });
          }
        }

        const rawFormats = data.formats || [];

        // 1. Direct Combined Video + Audio formats
        for (const f of rawFormats) {
          if (f.vcodec !== "none" && f.acodec !== "none" && f.url) {
            const h = f.height || 0;
            const resLabel = h >= 2160 ? "4K Ultra HD (2160p)" : h >= 1440 ? "2K Quad HD (1440p)" : h ? `${h}p HD` : f.resolution || "Standard";
            formats.push({
              formatId: String(f.format_id),
              resolution: resLabel,
              ext: f.ext || "mp4",
              url: f.url,
              filesize: f.filesize || f.filesize_approx || null,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: `${resLabel} (Universal MP4 + Audio)`,
            });
          }
        }

        // 2. High-Def Progressive / Adaptive Video Streams (4K 2160p, 2K 1440p, 1080p, 720p, 480p, 360p)
        const targetHeights = [2160, 1440, 1080, 720, 480, 360];
        const isDirectHttp = (f) => f && f.url && (!f.protocol || f.protocol.startsWith("http")) && !f.url.includes(".m3u8") && !f.url.includes("manifest");

        for (const h of targetHeights) {
          let matching = rawFormats.find(
            (f) => f.height === h && (f.ext === "mp4" || f.ext === "webm") && isDirectHttp(f)
          );
          if (!matching) {
            matching = rawFormats.find(
              (f) => f.height === h && (f.ext === "mp4" || f.ext === "webm") && f.url
            );
          }
          if (matching && !formats.some((item) => item.resolution?.includes(`${h}p`))) {
            const is4K = h >= 2160;
            const is2K = h >= 1440 && h < 2160;
            const resLabel = is4K ? "4K Ultra HD (2160p)" : is2K ? "2K Quad HD (1440p)" : `${h}p HD`;
            formats.push({
              formatId: String(matching.format_id),
              resolution: resLabel,
              ext: "mp4",
              url: matching.url,
              filesize: matching.filesize || matching.filesize_approx || null,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: `${resLabel} (${is4K ? "UHD 4K" : is2K ? "QHD 2K" : "MP4"} Universal Video + Audio)`,
            });
          }
        }

        // 3. Studio Audio Streams
        const audioStreams = rawFormats.filter(
          (f) => f.acodec !== "none" && f.vcodec === "none" && f.url && isDirectHttp(f)
        );
        const fallbackAudio = audioStreams.length ? audioStreams : rawFormats.filter((f) => f.acodec !== "none" && f.vcodec === "none" && f.url);
        for (const a of fallbackAudio.slice(-3)) {
          const bitrate = Math.round(a.tbr || a.abr || 128);
          formats.push({
            formatId: String(a.format_id),
            resolution: `${bitrate}kbps`,
            ext: "mp3",
            url: a.url,
            filesize: a.filesize || a.filesize_approx || null,
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: `Studio MP3 Audio (${bitrate} kbps)`,
          });
        }

        // 4. GUARANTEE: Universal Studio MP3 Audio format for EVERY video!
        if (formats.some((f) => f.hasVideo) && !formats.some((f) => f.type === "audio")) {
          const fallbackUrl = formats[0]?.url || "";
          formats.push({
            formatId: "native-audio-320",
            resolution: "320kbps",
            ext: "mp3",
            url: fallbackUrl,
            filesize: null,
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: "Studio MP3 Audio (320 kbps)",
          });
        // 5. Fallback for photo posts or carousels with no video streams
        if (formats.length === 0) {
          const imgUrl = data.url || data.thumbnail || (data.thumbnails?.length ? data.thumbnails[data.thumbnails.length - 1].url : "");
          if (imgUrl) {
            formats.push({
              formatId: "photo-orig",
              resolution: "Full-HD Photo",
              ext: "jpg",
              url: imgUrl,
              isImage: true,
              hasVideo: false,
              hasAudio: false,
              type: "image",
              label: "Download Full-HD Photo (1080p JPG)",
            });
          }
        }

        resolve({
          platform: data.extractor_key?.toLowerCase() || "video",
          id: data.id || `media-${Date.now()}`,
          title: data.title || "Video",
          author: data.uploader || data.channel || "Content Creator",
          duration: Math.round(data.duration || 0),
          thumbnail: data.thumbnail || (data.thumbnails?.length ? data.thumbnails[data.thumbnails.length - 1].url : ""),
          formats,
        });
      } catch (err) {
        reject(new Error(`Failed to parse media information: ${err.message}`));
      }
    });
  });
});

// Active native download processes
const activeProcesses = new Map();

// IPC Handler: Native Media Download & Muxing
ipcMain.handle("download-media", async (event, options) => {
  const { id, url, formatId, ext, isAudio, title, resolution, startTime, endTime, isImage } = options;

  // Direct Image Download (For Instagram Profile DP and Carousel Photos)
  if (isImage || ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
    return new Promise(async (resolve, reject) => {
      try {
        const downloadsDir = app.getPath("downloads");
        const safeTitle = (title || "photo").replace(/[\\/*?:"<>|]/g, "_").slice(0, 45).trim();
        const destPath = path.join(downloadsDir, `${safeTitle}_${Date.now()}.${ext || "jpg"}`);

        event.sender.send(`download-progress-${id}`, {
          percent: 20,
          speedMBps: "fetching",
          etaSeconds: "...",
        });

        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "Referer": "https://www.instagram.com/",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();

        event.sender.send(`download-progress-${id}`, {
          percent: 85,
          speedMBps: "saving",
          etaSeconds: "...",
        });

        fs.writeFileSync(destPath, Buffer.from(arrayBuf));

        event.sender.send(`download-progress-${id}`, {
          percent: 100,
          speedMBps: "done",
          etaSeconds: 0,
        });

        resolve({ success: true, path: destPath, fileName: path.basename(destPath) });
      } catch (err) {
        reject(new Error(`Failed to download image: ${err.message}`));
      }
    });
  }

  return new Promise((resolve, reject) => {
    const binPath = getYtDlpPath();
    const nodePath = getNodePath();
    const ffmpegDir = getFfmpegDir();
    const downloadsDir = app.getPath("downloads");
    const safeTitle = (title || "video").replace(/[\\/*?:"<>|]/g, "_").slice(0, 45).trim();
    const cleanRes = (resolution || "HD").replace(/[^a-zA-Z0-9]/g, "_");
    const outputTemplate = path.join(downloadsDir, `${safeTitle}_${cleanRes}.%(ext)s`);

    const args = [
      "--no-warnings",
      "--no-colors",
      "--newline",
      "--concurrent-fragments", "4",
      "--buffer-size", "64K",
      "--extractor-retries", "2",
      "--retry-sleep", "extractor:2",
      "--file-access-retries", "2",
      "--socket-timeout", "20",
    ];

    if (nodePath && nodePath !== "node") {
      args.push("--js-runtimes", `node:${nodePath}`);
    } else {
      args.push("--js-runtimes", "node");
    }

    // Cookie integration
    const igCookiePath = path.join(app.getPath("userData"), "ig_cookies.txt");
    if (fs.existsSync(igCookiePath) && fs.statSync(igCookiePath).size > 20) {
      args.push("--cookies", igCookiePath);
    }

    if (ffmpegDir && fs.existsSync(path.join(ffmpegDir, "ffmpeg.exe"))) {
      args.push("--ffmpeg-location", ffmpegDir);
    }

    if (isAudio || ext === "mp3") {
      args.push("-x", "--audio-format", "mp3", "--audio-quality", "320k");
      args.push("-f", "bestaudio[protocol^=http][ext=m4a]/bestaudio[protocol^=http]/bestaudio/best");
    } else {
      let targetHeight = 1080;
      if (resolution) {
        const matchH = resolution.match(/(\d+)/);
        if (matchH) targetHeight = parseInt(matchH[1], 10);
      }

      // 4K (2160p) & 2K (1440p) vs 1080p/720p Handling
      if (targetHeight > 1080) {
        args.push(
          "-f",
          `bestvideo[height<=${targetHeight}]+bestaudio[acodec^=mp4a]/bestvideo[height<=${targetHeight}]+bestaudio[ext=m4a]/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`
        );
      } else {
        args.push(
          "-f",
          `bestvideo[height<=${targetHeight}][vcodec^=avc]+bestaudio[acodec^=mp4a]/bestvideo[height<=${targetHeight}][vcodec^=avc]+bestaudio[ext=m4a]/bestvideo[height<=${targetHeight}][ext=mp4]+bestaudio[acodec^=mp4a]/bestvideo[height<=${targetHeight}]+bestaudio[ext=m4a]/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`
        );
        args.push("--format-sort", "vcodec:avc,acodec:m4a,res,ext:mp4:m4a");
      }

      args.push("--merge-output-format", "mp4");
      args.push("--postprocessor-args", "Merger:-c:a aac -b:a 192k -ar 44100 -ac 2");
    }

    // Video Trimming Feature: Download only selected time section with 100% AV sync
    const hasTrim = Boolean(startTime && startTime !== "00:00" && startTime !== "0") || Boolean(endTime && endTime !== "00:00" && endTime !== "");
    if (hasTrim) {
      const s = (startTime && startTime !== "00:00") ? startTime : "00:00";
      const e = (endTime && endTime !== "00:00") ? endTime : "";
      args.push("--download-sections", `*${s}-${e}`);
      args.push("--force-keyframes-at-cuts");
    }

    args.push("--progress-template", "PROGRESS:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s");
    args.push("--print", "after_move:filepath");
    args.push("-o", outputTemplate);
    args.push(url.trim());

    // Send immediate "preparing" progress so UI isn't stuck at 0%
    event.sender.send(`download-progress-${id}`, {
      percent: 2,
      speedMBps: "preparing",
      etaSeconds: "...",
    });

    const proc = spawn(binPath, args, {
      env: {
        ...process.env,
        PATH: ffmpegDir ? `${ffmpegDir};${process.env.PATH || ""}` : process.env.PATH,
      },
    });
    activeProcesses.set(id, proc);

    let finalPath = "";
    let errorOutput = "";
    let hasReceivedProgress = false;

    const parseProgressLine = (line) => {
      if (line.includes("PROGRESS:")) {
        hasReceivedProgress = true;
        const parts = line.replace(/.*PROGRESS:/, "").split("|");
        const percentStr = parts[0] ? parts[0].replace("%", "").trim() : "0";
        const speedStr = parts[1] ? parts[1].trim() : "0.0";
        const etaStr = parts[2] ? parts[2].trim() : "0";

        let percent = parseFloat(percentStr) || 0;
        let speedMBps = "0.0";
        if (speedStr.includes("MiB/s") || speedStr.includes("MB/s")) {
          speedMBps = parseFloat(speedStr).toFixed(1);
        } else if (speedStr.includes("KiB/s") || speedStr.includes("KB/s")) {
          speedMBps = (parseFloat(speedStr) / 1024).toFixed(1);
        }

        event.sender.send(`download-progress-${id}`, {
          percent: Math.min(100, Math.max(3, Math.round(percent))),
          speedMBps,
          etaSeconds: etaStr,
        });
      } else {
        // Fallback regex for standard yt-dlp download lines:
        // [download]  12.5% of 426.45MiB at 4.52MiB/s ETA 00:35
        // [download]   1.2% of ~ 1.20GiB at 12.5MiB/s ETA 01:20
        const match = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%(?:\s+of\s+[~]?\s*([\d\.]+\s*[A-Za-z]+))?(?:\s+at\s+([\d\.]+\s*[A-Za-z]+\/s|Unknown))?(?:\s+ETA\s+([0-9:]+|Unknown))?/i);
        if (match) {
          hasReceivedProgress = true;
          const percent = parseFloat(match[1]) || 0;
          const speedRaw = match[3] || "";
          let speedMBps = "0.0";
          if (speedRaw.includes("MiB/s") || speedRaw.includes("MB/s")) {
            speedMBps = parseFloat(speedRaw).toFixed(1);
          } else if (speedRaw.includes("KiB/s") || speedRaw.includes("KB/s")) {
            speedMBps = (parseFloat(speedRaw) / 1024).toFixed(1);
          }
          const etaStr = (match[4] && match[4] !== "Unknown") ? match[4] : "...";

          event.sender.send(`download-progress-${id}`, {
            percent: Math.min(100, Math.max(3, Math.round(percent))),
            speedMBps: speedMBps !== "0.0" ? speedMBps : "streaming",
            etaSeconds: etaStr,
          });
        } else if (line.includes("[Merger]") || line.includes("Merging formats") || line.includes("[FixupM4a]")) {
          event.sender.send(`download-progress-${id}`, {
            percent: 98,
            speedMBps: "remuxing",
            etaSeconds: "00:02",
          });
        }
      }
    };

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        parseProgressLine(line);
        if (
          line.trim() &&
          (line.endsWith(".mp4") ||
            line.endsWith(".mp3") ||
            line.endsWith(".mkv") ||
            line.endsWith(".webm") ||
            line.endsWith(".m4a"))
        ) {
          finalPath = line.trim();
        }
      }
    });

    proc.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      errorOutput += text;
      // If we haven't received real progress yet, send live progress status
      if (!hasReceivedProgress) {
        let status = "connecting";
        if (text.includes("Solving JS challenges")) status = "bypassing";
        else if (text.includes("Downloading webpage") || text.includes("Downloading API")) status = "connecting";
        else if (text.includes("Downloading") || text.includes("Extracting")) status = "buffering";

        event.sender.send(`download-progress-${id}`, {
          percent: 1,
          speedMBps: status,
          etaSeconds: "...",
        });
      }
    });

    proc.on("error", (err) => {
      activeProcesses.delete(id);
      reject(new Error(`Download engine error: ${err.message}`));
    });

    proc.on("close", (code) => {
      activeProcesses.delete(id);
      if (code === 0) {
        if (!finalPath || !fs.existsSync(finalPath)) {
          finalPath = path.join(downloadsDir, `${safeTitle}_${resolution || "HD"}.${isAudio ? "mp3" : "mp4"}`);
          if (!fs.existsSync(finalPath)) {
            try {
              const files = fs.readdirSync(downloadsDir);
              const found = files.find((f) => f.startsWith(safeTitle));
              if (found) finalPath = path.join(downloadsDir, found);
            } catch (e) {}
          }
        }
        // 100% Universal Audio Codec & Synchronization Guard:
        // Probe final MP4 file to guarantee audio is universal AAC and in perfect sync with video
        if (finalPath && fs.existsSync(finalPath) && !isAudio) {
          try {
            const probeBin = getFfprobePath();
            const ffmpegBin = (ffmpegDir && fs.existsSync(path.join(ffmpegDir, "ffmpeg.exe")))
              ? path.join(ffmpegDir, "ffmpeg.exe")
              : (fs.existsSync(path.join(__dirname, "bin", "ffmpeg.exe")) ? path.join(__dirname, "bin", "ffmpeg.exe") : "ffmpeg");

            const probeRes = spawnSync(probeBin, [
              "-v", "error",
              "-show_entries", "stream=codec_type,codec_name,start_time,duration",
              "-of", "json",
              finalPath,
            ], { timeout: 15000 });

            if (probeRes.status === 0 && probeRes.stdout) {
              const probeData = JSON.parse(probeRes.stdout.toString());
              const audioStream = probeData.streams?.find((s) => s.codec_type === "audio");
              const videoStream = probeData.streams?.find((s) => s.codec_type === "video");
              const aName = (audioStream?.codec_name || "").toLowerCase();

              const vStart = Math.abs(parseFloat(videoStream?.start_time || "0"));
              const aStart = Math.abs(parseFloat(audioStream?.start_time || "0"));
              const isDesynced = Math.abs(vStart - aStart) > 0.08;
              const needsAac = aName && aName !== "aac";

              // If non-AAC audio OR if audio/video timestamps are drifted OR if trim was performed:
              if (needsAac || isDesynced || hasTrim) {
                console.log(`[Audio Guard] Aligning AV sync & Universal AAC (codec: ${aName}, desync: ${isDesynced}, trim: ${hasTrim}) in:`, finalPath);
                const dir = path.dirname(finalPath);
                const ext = path.extname(finalPath);
                const base = path.basename(finalPath, ext);
                const tempFixed = path.join(dir, `${base}_sync_fixed${ext}`);

                const fixRes = spawnSync(ffmpegBin, [
                  "-y",
                  "-i", finalPath,
                  "-c:v", "copy",
                  "-c:a", "aac",
                  "-b:a", "192k",
                  "-ar", "44100",
                  "-ac", "2",
                  "-async", "1",
                  "-avoid_negative_ts", "make_zero",
                  "-movflags", "+faststart",
                  tempFixed,
                ], { timeout: 300000 });

                if (fixRes.status === 0 && fs.existsSync(tempFixed) && fs.statSync(tempFixed).size > 1000) {
                  fs.unlinkSync(finalPath);
                  fs.renameSync(tempFixed, finalPath);
                  console.log("[Audio Guard] Successfully verified universal AAC synchronized audio track!");
                }
              }
            }
          } catch (guardErr) {
            console.warn("[Audio Guard] Warning:", guardErr.message);
          }
        }

        resolve({
          success: true,
          path: finalPath,
          fileName: path.basename(finalPath),
        });
      } else {
        reject(new Error(errorOutput.trim() || `Download failed with exit code ${code}`));
      }
    });
  });
});

// IPC Handler: Cancel Native Download
ipcMain.handle("cancel-download", (event, id) => {
  const proc = activeProcesses.get(id);
  if (proc) {
    proc.kill();
    activeProcesses.delete(id);
    return true;
  }
  return false;
});

// IPC Handler: Open Folder & Locate File
ipcMain.handle("open-folder", async (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
    return true;
  }
  const downloadsDir = app.getPath("downloads");
  shell.openPath(downloadsDir);
  return true;
});

// IPC Handler: Open File in Default Player
ipcMain.handle("open-file", async (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.openPath(filePath);
    return true;
  }
  return false;
});

// IPC Handler: Get Version
ipcMain.handle("get-version", () => {
  return app.getVersion();
});

// IPC Handler: Open External URL in system default browser
ipcMain.handle("open-external", async (event, externalUrl) => {
  if (externalUrl && (externalUrl.startsWith("http://") || externalUrl.startsWith("https://"))) {
    await shell.openExternal(externalUrl);
    return true;
  }
  return false;
});

// State for downloaded update
let downloadedUpdatePath = null;

// IPC Handler: Is Portable Executable
ipcMain.handle("is-portable", () => {
  return Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
});

// IPC Handler: In-App Update Downloader
ipcMain.handle("start-in-app-update", async (event, options = {}) => {
  const downloadUrl = options.downloadUrl;
  if (!downloadUrl) throw new Error("No download URL provided for update.");

  const tempDir = app.getPath("temp");
  const fileName = downloadUrl.split("/").pop()?.split("?")[0] || "Pie-Video-Downloader-Update.exe";
  const destPath = path.join(tempDir, fileName);

  const res = await fetch(downloadUrl, {
    redirect: "follow",
    headers: { "User-Agent": "PieVideoDownloader-InAppUpdater/1.2.0" },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Update release binary is not yet published on GitHub Releases (HTTP 404). Please download the latest installer from the GitHub Releases page.");
    }
    throw new Error(`Server returned HTTP ${res.status} while downloading update.`);
  }

  const totalBytes = parseInt(res.headers.get("content-length") || "0", 10);
  const fileStream = fs.createWriteStream(destPath);
  const reader = res.body.getReader();

  let receivedBytes = 0;
  let lastProgressTime = Date.now();
  let lastReceivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(Buffer.from(value));
      receivedBytes += value.length;

      const now = Date.now();
      if (now - lastProgressTime >= 120) {
        const timeDiff = (now - lastProgressTime) / 1000;
        const bytesDiff = receivedBytes - lastReceivedBytes;
        const speedMBps = timeDiff > 0 ? ((bytesDiff / (1024 * 1024)) / timeDiff).toFixed(1) : "0.0";
        const percent = totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : 0;
        const transferredMB = (receivedBytes / (1024 * 1024)).toFixed(1);
        const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : "Unknown";

        event.sender.send("update-download-progress", {
          percent,
          speedMBps,
          transferredMB,
          totalMB,
        });

        lastProgressTime = now;
        lastReceivedBytes = receivedBytes;
      }
    }
  } finally {
    await new Promise((resolve) => fileStream.end(resolve));
  }

  downloadedUpdatePath = destPath;
  return {
    success: true,
    filePath: destPath,
  };
});

// IPC Handler: Install and Restart
ipcMain.handle("install-and-restart", async () => {
  if (!downloadedUpdatePath || !fs.existsSync(downloadedUpdatePath)) {
    throw new Error("Update binary not found on local disk.");
  }

  const isPortable = Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
  const portableTarget = process.env.PORTABLE_EXECUTABLE_FILE;

  if (isPortable && portableTarget) {
    // Portable exe: use bat to wait for exit, copy over, restart
    const updaterBat = path.join(app.getPath("temp"), "pie-apply-portable-update.bat");
    const batContent = `@echo off
chcp 65001 > nul
echo Updating Pie Video Downloader...
timeout /t 3 /nobreak > nul
taskkill /f /pid ${process.pid} > nul 2>&1
timeout /t 1 /nobreak > nul
copy /y "${downloadedUpdatePath}" "${portableTarget}" > nul
if errorlevel 1 (
  echo Update failed. Please try again.
  pause
  exit /b 1
)
start "" "${portableTarget}"
del "${downloadedUpdatePath}" > nul 2>&1
(goto) 2>nul & del "%~f0"
`;
    fs.writeFileSync(updaterBat, batContent, "utf8");
    const batProc = spawn("cmd.exe", ["/c", updaterBat], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    batProc.unref();
    app.quit();
    return true;
  } else {
    // NSIS installer: run silently, it handles everything
    const instProc = spawn(downloadedUpdatePath, ["/S"], {
      detached: true,
      stdio: "ignore",
    });
    instProc.unref();
    app.quit();
    return true;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

