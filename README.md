# PIETools Universal Video Downloader App

A high-performance, cross-platform Universal Video Downloader application that executes **100% client-side on the user's device** (Android `.apk`, Windows `.exe`, and Web/PWA).

---

## Key Features

* **Multi-Platform Video Extraction:**
  * **YouTube:** Full resolution streams (1080p, 720p, 480p, 360p) and Audio (MP3/M4A).
  * **Instagram:** Reels, video posts, and IGTV.
  * **TikTok:** Direct HD video downloads with **no watermark** and background music extraction.
  * **Facebook:** High Definition (HD) and Standard Definition (SD) MP4 downloads.
  * **Twitter / X:** Multi-bitrate MP4 video downloads.
  * **Direct Links:** Direct MP4 / WebM video streams.
* **100% Client-Side Engine (Zero Server Load):**
  * All stream parsing and chunk downloading run directly on the user's phone or computer.
  * ₹0 server compute or bandwidth consumed for PIETools.
  * Completely immune to central server IP blocking by social media platforms.
* **Native Device Integration:**
  * Direct filesystem writes to device storage (`Downloads` / `Documents`).
  * Automatic clipboard link detection.
  * Native sharing intent support (share video link directly into the app).
* **PIETools Glassmorphism UI:**
  * Clean, responsive dark mode theme (`#0B0F19` background, `#EF4444` & `#06B6D4` accents).
  * **Zero Emojis** policy: 100% clean vector SVG icons.
  * Live download progress with real-time speed in MB/s and ETA calculation.

---

## Project Structure

```
universal-video-downloader/
├── .github/
│   └── workflows/
│       └── build-apk.yml        # Automated Cloud CI/CD for APK & EXE
├── android/                     # Native Android Gradle Project
│   ├── app/src/main/
│   │   └── AndroidManifest.xml  # Storage & Network Permissions
│   └── gradlew.bat
├── electron/
│   └── main.js                  # Desktop process for Windows .exe
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Header & platform indicator
│   │   ├── UrlInput.jsx         # URL input, auto-paste & platform pills
│   │   ├── MediaPreview.jsx     # Video details, thumbnail & quality picker
│   │   ├── DownloadQueue.jsx    # Live progress bar, speed & history
│   │   ├── SettingsModal.jsx    # System architecture & privacy modal
│   │   └── icons/Icons.jsx      # Clean vector SVG icons (Zero emojis)
│   ├── engine/
│   │   ├── extractors/          # Platform extractors (YouTube, IG, TT, FB, X)
│   │   ├── downloader.js        # Multi-chunk streaming downloader
│   │   └── nativeBridge.js      # Filesystem, clipboard, and toast APIs
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── build-apk-local.bat          # 1-Click local build script
├── capacitor.config.json
├── package.json
└── vite.config.js
```

---

## Building the Android `.apk`

### Option 1: Automated GitHub Actions (Recommended - No local setup needed)
1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial universal video downloader app"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to the **Actions** tab on your GitHub repository.
3. The workflow will automatically compile the Android APK and upload `pietools-universal-downloader-debug-apk` directly as a downloadable release artifact!
4. Download the `.apk` on your Android phone and tap to install.

### Option 2: Local Compilation (via Gradle)
1. Ensure **OpenJDK 17+** is installed on your PC (`winget install Microsoft.OpenJDK.17`).
2. Run the included builder:
   ```bash
   .\build-apk-local.bat
   ```
   Or manually:
   ```bash
   npm run build
   npx cap sync android
   cd android
   .\gradlew.bat assembleDebug
   ```
3. Your compiled APK will be created at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Running on Windows PC (.exe)

1. Start in development mode:
   ```bash
   npm run dev
   ```
2. Or build the native Windows installer:
   ```bash
   npm run electron:build
   ```

---

## Running on iOS

Due to Apple App Store restrictions on video downloaders, iOS users can install this as a **Progressive Web App (PWA)**:
1. Open the web preview in Safari on your iPhone/iPad.
2. Tap the **Share** button in Safari and select **Add to Home Screen**.
3. The app launches fullscreen with standalone native feel.
