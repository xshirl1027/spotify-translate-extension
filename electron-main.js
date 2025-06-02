const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev"); // You might need to install this for dev/prod distinction

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Optional: for exposing Node.js APIs to renderer
      nodeIntegration: false, // It's recommended to keep this false for security
      contextIsolation: true, // Recommended for security
    },
  });

  // Load your React app's build output
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000" // Your React dev server URL
      : `file://${path.join(__dirname, "../build/index.html")}` // Path to your React build
  );

  // Open the DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
