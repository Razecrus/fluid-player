const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let overlayWindow = null;

function createMainWindow() {
  const { width: waWidth, height: waHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = Math.min(1240, waWidth - 60);
  const winHeight = Math.min(780, waHeight - 60);

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 920,
    minHeight: 560,
    backgroundColor: "#0d0e14",
    autoHideMenuBar: true,
    frame: false,
    title: "Fluid",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (overlayWindow) overlayWindow.close();
  });
  mainWindow.on("maximize", () => mainWindow.webContents.send("win:maximized", true));
  mainWindow.on("unmaximize", () => mainWindow.webContents.send("win:maximized", false));
}

function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.show();
    overlayWindow.focus();
    return;
  }
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  overlayWindow = new BrowserWindow({
    width: 300,
    height: 240,
    x: width - 330,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.loadFile("overlay.html");
  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}

ipcMain.on("overlay:toggle", () => {
  if (overlayWindow) overlayWindow.close();
  else createOverlayWindow();
});
ipcMain.on("overlay:close", () => {
  if (overlayWindow) overlayWindow.close();
});

// Controls sent from the overlay window are relayed to the main window
["ctrl:playpause", "ctrl:next", "ctrl:prev"].forEach((channel) => {
  ipcMain.on(channel, () => {
    if (mainWindow) mainWindow.webContents.send(channel);
  });
});
ipcMain.on("ctrl:seek", (event, value) => {
  if (mainWindow) mainWindow.webContents.send("ctrl:seek", value);
});
ipcMain.on("ctrl:volume", (event, value) => {
  if (mainWindow) mainWindow.webContents.send("ctrl:volume", value);
});

// Custom titlebar window controls (main window is frameless)
ipcMain.on("win:minimize", () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on("win:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on("win:close", () => { if (mainWindow) mainWindow.close(); });

// Now-playing state sent from the main window is relayed to the overlay
ipcMain.on("state:update", (event, state) => {
  if (overlayWindow) overlayWindow.webContents.send("state:update", state);
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // Auto-Update: still checks quietly in dev (no publish config match -> just fails silently)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 4000);
});

autoUpdater.on("update-downloaded", () => {
  if (mainWindow) mainWindow.webContents.send("update:downloaded");
});
ipcMain.on("update:install", () => {
  autoUpdater.quitAndInstall();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
