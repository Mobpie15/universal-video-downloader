export const CURRENT_VERSION = "1.1.1";
export const VERSION_URL = "https://raw.githubusercontent.com/Mobpie15/universal-video-downloader/main/version.json";

export const compareVersions = (v1, v2) => {
  const p1 = v1.replace(/[^0-9.]/g, "").split(".").map(Number);
  const p2 = v2.replace(/[^0-9.]/g, "").split(".").map(Number);
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
    // Primary: fetch version.json from repository main branch
    try {
      const res = await fetch(`${VERSION_URL}?_nocache=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        const hasUpdate = compareVersions(data.version, CURRENT_VERSION) > 0;
        return {
          success: true,
          hasUpdate,
          currentVersion: CURRENT_VERSION,
          latestVersion: data.version,
          releaseDate: data.releaseDate,
          releaseNotes: data.releaseNotes || "Performance enhancements and bug fixes",
          downloadUrl: data.downloadUrl,
          releasesPage: data.releasesPage,
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
      const apkAsset = (ghData.assets || []).find((a) => a.name && a.name.endsWith(".apk"));
      const hasUpdate = compareVersions(latestTag, CURRENT_VERSION) > 0;

      return {
        success: true,
        hasUpdate,
        currentVersion: CURRENT_VERSION,
        latestVersion: latestTag,
        releaseDate: (ghData.published_at || "").split("T")[0],
        releaseNotes: ghData.body || "Performance enhancements and bug fixes",
        downloadUrl: apkAsset?.browser_download_url || ghData.html_url,
        releasesPage: ghData.html_url || "https://github.com/Mobpie15/universal-video-downloader/releases",
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
