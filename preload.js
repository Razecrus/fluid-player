const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fluid", {
  toggleOverlay: () => ipcRenderer.send("overlay:toggle"),
  closeOverlay: () => ipcRenderer.send("overlay:close"),

  sendCtrl: (channel, value) => ipcRenderer.send(channel, value),
  onCtrl: (channel, callback) =>
    ipcRenderer.on(channel, (event, ...args) => callback(...args)),

  sendState: (state) => ipcRenderer.send("state:update", state),
  onState: (callback) =>
    ipcRenderer.on("state:update", (event, state) => callback(state)),

  winMinimize: () => ipcRenderer.send("win:minimize"),
  winMaximize: () => ipcRenderer.send("win:maximize"),
  winClose: () => ipcRenderer.send("win:close"),
  onMaximizedChange: (callback) =>
    ipcRenderer.on("win:maximized", (event, isMax) => callback(isMax)),

  onUpdateDownloaded: (callback) => ipcRenderer.on("update:downloaded", () => callback()),
  installUpdate: () => ipcRenderer.send("update:install"),
});
