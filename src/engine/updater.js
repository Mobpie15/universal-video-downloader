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
    const res = await fetch(`${VERSION_URL}?_nocache=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    const hasUpdate = compareVersions(data.version, CURRENT_VERSION) > 0;

    return {
      success: true,
      hasUpdate,
      currentVersion: CURRENT_VERSION,
      latestVersion: data.version,
      releaseDate: data.releaseDate,
      releaseNotes: data.releaseNotes || "Performance enhancements & bug fixes",
      downloadUrl: data.downloadUrl,
      releasesPage: data.releasesPage,
    };
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
