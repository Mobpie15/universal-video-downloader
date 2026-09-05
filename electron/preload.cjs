const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  extractMedia: (url) => ipcRenderer.invoke("extract-media", url),
  downloadMedia: (options) => ipcRenderer.invoke("download-media", options),
  cancelDownload: (id) => ipcRenderer.invoke("cancel-download", id),
  onDownloadProgress: (id, callback) => {
    const channel = `download-progress-${id}`;
    const listener = (event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  openFolder: (filePath) => ipcRenderer.invoke("open-folder", filePath),
  openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
  getVersion: () => ipcRenderer.invoke("get-version"),
  isPortable: () => ipcRenderer.invoke("is-portable"),
  startInAppUpdate: (options) => ipcRenderer.invoke("start-in-app-update", options),
  installAndRestart: () => ipcRenderer.invoke("install-and-restart"),
  onUpdateProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on("update-download-progress", listener);
    return () => ipcRenderer.removeListener("update-download-progress", listener);
  },
});
