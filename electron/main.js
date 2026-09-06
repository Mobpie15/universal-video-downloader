import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

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

// IPC Handler: Native Media Extraction
ipcMain.handle("extract-media", async (event, url) => {
  return new Promise((resolve, reject) => {
    const binPath = getYtDlpPath();
    const args = [
      "--dump-single-json",
      "--no-warnings",
      "--skip-download",
      "--no-playlist",
      "--extractor-retries", "5",
      "--retry-sleep", "extractor:5",
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
        const errText = stderr.trim();
        if (errText.includes("Instagram sent an empty media response") || errText.includes("accessible in your browser without being logged-in")) {
          return reject(new Error("Instagram is requiring login credentials for this Reel. Please check the link in your browser or try another video."));
        }
        if (errText.includes("Private video") || errText.includes("this video is private")) {
          return reject(new Error("This video is set to private by the creator and cannot be accessed."));
        }
        return reject(new Error(errText || "Failed to analyze video URL."));
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

// Active native download processes
const activeProcesses = new Map();

// IPC Handler: Native Media Download & Muxing
ipcMain.handle("download-media", async (event, options) => {
  const { id, url, formatId, ext, isAudio, title, resolution } = options;
  return new Promise((resolve, reject) => {
    const binPath = getYtDlpPath();
    const ffmpegDir = getFfmpegDir();
    const downloadsDir = app.getPath("downloads");
    const safeTitle = (title || "video").replace(/[\\/*?:"<>|]/g, "_").slice(0, 45).trim();
    const outputTemplate = path.join(downloadsDir, `${safeTitle}_${resolution || "HD"}.%(ext)s`);

    const args = [
      "--no-warnings",
      "--no-colors",
      "--newline",
      "--js-runtimes",
      "node",
      "--extractor-retries", "5",
      "--retry-sleep", "extractor:5",
      "--file-access-retries", "3",
    ];

    if (ffmpegDir && fs.existsSync(path.join(ffmpegDir, "ffmpeg.exe"))) {
      args.push("--ffmpeg-location", ffmpegDir);
    }

    if (isAudio || ext === "mp3") {
      args.push("-x", "--audio-format", "mp3");
    } else {
      if (formatId && formatId !== "direct" && !formatId.startsWith("pie-")) {
        args.push("-f", `${formatId}+bestaudio/best`);
      } else {
        args.push("-f", "bestvideo+bestaudio/best");
      }
      args.push("--merge-output-format", "mp4");
    }

    args.push("--progress-template", "PROGRESS:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s");
    args.push("--print", "after_move:filepath");
    args.push("-o", outputTemplate);
    args.push(url.trim());

    const proc = spawn(binPath, args);
    activeProcesses.set(id, proc);

    let finalPath = "";
    let errorOutput = "";

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        if (line.startsWith("PROGRESS:")) {
          const parts = line.replace("PROGRESS:", "").split("|");
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
            percent: Math.min(100, Math.round(percent)),
            speedMBps,
            etaSeconds: etaStr,
          });
        } else if (
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
      errorOutput += chunk.toString();
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

