export const CURRENT_VERSION = "1.2.1";
export const VERSION_URL = "https://raw.githubusercontent.com/Mobpie15/universal-video-downloader/main/version.json";

export const compareVersions = (v1, v2) => {
  const p1 = (v1 || "0").replace(/[^0-9.]/g, "").split(".").map(Number);
  const p2 = (v2 || "0").replace(/[^0-9.]/g, "").split(".").map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

export const checkForUpdates = async () => {
  try {
    const isElectron = typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);
    let isPortable = false;
    if (isElectron && typeof window.electronAPI?.isPortable === "function") {
      try {
        isPortable = await window.electronAPI.isPortable();
      } catch (e) {}
    }

    // Primary: fetch version.json from repository main branch
    try {
      const res = await fetch(`${VERSION_URL}?_nocache=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        const hasUpdate = compareVersions(data.version, CURRENT_VERSION) > 0;

        let downloadUrl = data.downloadUrl;
        if (isElectron) {
          downloadUrl = isPortable
            ? (data.windowsPortableUrl || data.downloadUrl)
            : (data.windowsInstallerUrl || data.downloadUrl);
        } else if (typeof window !== "undefined" && window.Capacitor?.getPlatform?.() === "android") {
          downloadUrl = data.apkUrl || data.downloadUrl;
        }

        return {
          success: true,
          hasUpdate,
          currentVersion: CURRENT_VERSION,
          latestVersion: data.version,
          releaseDate: data.releaseDate,
          releaseNotes: data.releaseNotes || "Performance enhancements, auto-updater, and bug fixes",
          downloadUrl,
          windowsInstallerUrl: data.windowsInstallerUrl,
          windowsPortableUrl: data.windowsPortableUrl,
          apkUrl: data.apkUrl,
          releasesPage: data.releasesPage,
          isElectron,
          isPortable,
        };
      }
    } catch (e) {
      console.warn("version.json fetch error, attempting GitHub Releases API fallback...", e);
    }

    // Fallback: GitHub Releases API
    const ghRes = await fetch("https://api.github.com/repos/Mobpie15/universal-video-downloader/releases/latest", {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      const latestTag = (ghData.tag_name || "").replace(/^v/, "");
      const assets = ghData.assets || [];
      const apkAsset = assets.find((a) => a.name && a.name.endsWith(".apk"));
      const portableAsset = assets.find((a) => a.name && a.name.endsWith(".exe") && !a.name.toLowerCase().includes("setup"));
      const installerAsset = assets.find((a) => a.name && a.name.endsWith(".exe") && a.name.toLowerCase().includes("setup"));

      const hasUpdate = compareVersions(latestTag, CURRENT_VERSION) > 0;

      let downloadUrl = apkAsset?.browser_download_url || ghData.html_url;
      if (isElectron) {
        downloadUrl = isPortable
          ? (portableAsset?.browser_download_url || installerAsset?.browser_download_url || ghData.html_url)
          : (installerAsset?.browser_download_url || portableAsset?.browser_download_url || ghData.html_url);
      }

      return {
        success: true,
        hasUpdate,
        currentVersion: CURRENT_VERSION,
        latestVersion: latestTag,
        releaseDate: (ghData.published_at || "").split("T")[0],
        releaseNotes: ghData.body || "Performance enhancements, auto-updater, and bug fixes",
        downloadUrl,
        windowsInstallerUrl: installerAsset?.browser_download_url,
        windowsPortableUrl: portableAsset?.browser_download_url,
        apkUrl: apkAsset?.browser_download_url,
        releasesPage: ghData.html_url || "https://github.com/Mobpie15/universal-video-downloader/releases",
        isElectron,
        isPortable,
      };
    }

    throw new Error("Unable to reach update servers.");
  } catch (err) {
    console.warn("Check update failed:", err);
    return {
      success: false,
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      error: err.message || "Unable to check for updates right now.",
    };
  }
};
