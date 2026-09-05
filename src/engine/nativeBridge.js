import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatformName = () => {
  return Capacitor.getPlatform(); // 'android', 'ios', 'web'
};

export const showToast = async (text) => {
  try {
    if (Capacitor.isPluginAvailable("Toast")) {
      await Toast.show({ text, duration: "short", position: "bottom" });
    } else {
      console.log("[Toast]", text);
    }
  } catch (err) {
    console.warn("Toast error:", err);
  }
};

export const readClipboard = async () => {
  try {
    if (Capacitor.isPluginAvailable("Clipboard")) {
      const { value } = await Clipboard.read();
      return value || "";
    }
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn("Clipboard read error:", err);
  }
  return "";
};

export const saveFileToDevice = async ({ fileName, blob, progressCallback }) => {
  try {
    if (isNativePlatform()) {
      // Convert blob to base64 for native filesystem write
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Write to Android Documents or Downloads directory
      const result = await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true,
      });

      await showToast(`Saved to device: ${fileName}`);
      return { success: true, path: result.uri };
    } else {
      // Browser / Desktop fallback: trigger standard browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return { success: true, path: fileName };
    }
  } catch (err) {
    console.error("Save file error:", err);
    // Fallback if ExternalStorage permission fails on newer Android versions
    if (isNativePlatform()) {
      try {
        const reader = new FileReader();
        const base64Data = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const fallbackResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });
        await showToast(`Saved to Documents: ${fileName}`);
        return { success: true, path: fallbackResult.uri };
      } catch (fallbackErr) {
        throw new Error("Unable to save file to device storage: " + fallbackErr.message);
      }
    }
    throw err;
  }
};

export const shareFile = async ({ title, text, url }) => {
  try {
    if (Capacitor.isPluginAvailable("Share")) {
      await Share.share({ title, text, url, dialogTitle: "Share video" });
    } else if (navigator.share) {
      await navigator.share({ title, text, url });
    }
  } catch (err) {
    console.warn("Share cancelled or failed:", err);
  }
};
