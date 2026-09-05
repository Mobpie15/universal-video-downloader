import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function getYtDlpPath() {
  const possiblePaths = [
    path.join(__dirname, "bin", "yt-dlp.exe"),
    path.join(process.resourcesPath, "bin", "yt-dlp.exe"),
    path.join(process.resourcesPath, "electron", "bin", "yt-dlp.exe"),
    path.join(app.getAppPath(), "electron", "bin", "yt-dlp.exe"),
    path.join(__dirname, "..", "electron", "bin", "yt-dlp.exe"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return "yt-dlp";
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

// IPC Handler: Native Media Extraction
ipcMain.handle("extract-media", async (event, url) => {
  return new Promise((resolve, reject) => {
    const binPath = getYtDlpPath();
    const args = [
      "--dump-single-json",
      "--no-warnings",
      "--skip-download",
      "--no-playlist",
      url.trim(),
    ];

    const proc = spawn(binPath, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (err) => {
      reject(new Error(`Failed to execute native media extractor: ${err.message}`));
    });

    proc.on("close", (code) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(new Error(stderr.trim() || "Failed to analyze video URL."));
      }

      try {
        const data = JSON.parse(stdout.trim());
        const formats = [];
        const rawFormats = data.formats || [];

        // 1. Direct Combined Video + Audio formats
        for (const f of rawFormats) {
          if (f.vcodec !== "none" && f.acodec !== "none" && f.url) {
            formats.push({
              formatId: String(f.format_id),
              resolution: f.resolution || (f.height ? `${f.height}p` : "Standard"),
              ext: f.ext || "mp4",
              url: f.url,
              filesize: f.filesize || f.filesize_approx || null,
              hasAudio: true,
              hasVideo: true,
              type: "video",
              label: `${f.resolution || (f.height ? `${f.height}p` : "Standard")} (${(f.ext || "mp4").toUpperCase()} Video + Audio)`,
            });
          }
        }

        // 2. High-Def Progressive / Adaptive Video Streams (1080p, 720p, 480p, 360p)
        const targetHeights = [2160, 1440, 1080, 720, 480, 360];
        for (const h of targetHeights) {
          const matching = rawFormats.find(
            (f) => f.height === h && (f.ext === "mp4" || f.ext === "webm") && f.url
          );
          if (matching && !formats.some((item) => item.resolution?.includes(`${h}p`))) {
            const isFullMp4 = matching.ext === "mp4";
            formats.push({
              formatId: String(matching.format_id),
              resolution: `${h}p HD`,
              ext: matching.ext || "mp4",
              url: matching.url,
              filesize: matching.filesize || matching.filesize_approx || null,
              hasAudio: matching.acodec !== "none",
              hasVideo: true,
              type: "video",
              label: `${h}p HD Video (${matching.ext ? matching.ext.toUpperCase() : "MP4"})`,
            });
          }
        }

        // 3. Audio Streams
        const audioStreams = rawFormats.filter(
          (f) => f.acodec !== "none" && f.vcodec === "none" && f.url
        );
        for (const a of audioStreams.slice(-3)) {
          const bitrate = Math.round(a.tbr || a.abr || 128);
          formats.push({
            formatId: String(a.format_id),
            resolution: `${bitrate}kbps`,
            ext: a.ext || "m4a",
            url: a.url,
            filesize: a.filesize || a.filesize_approx || null,
            hasAudio: true,
            hasVideo: false,
            type: "audio",
            label: `Audio Only (${bitrate} kbps ${(a.ext || "m4a").toUpperCase()})`,
          });
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

// IPC Handler: Open Folder
ipcMain.handle("open-folder", async (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
    return true;
  }
  const downloadsDir = app.getPath("downloads");
  shell.openPath(downloadsDir);
  return true;
});

// IPC Handler: Get Version
ipcMain.handle("get-version", () => {
  return app.getVersion();
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

