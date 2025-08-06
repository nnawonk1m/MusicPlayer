const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs').promises;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const LYRICS_DIR = path.join(__dirname, 'lyrics');

function isSafeFilename(filename) {
  return (
    typeof filename === 'string' &&
    filename.length > 0 &&
    !filename.includes('/') &&
    !filename.includes('\\') &&
    !filename.includes('..')
  );
}

ipcMain.handle('read-lyrics', async (event, filename) => {
  try {
    if (!isSafeFilename(filename)) {
      return { ok: false, error: 'Invalid filename' };
    }

    const fullPath = path.join(LYRICS_DIR, filename);

    // extra safety: ensure the resolved path is within LYRICS_DIR
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(path.resolve(LYRICS_DIR))) {
      return { ok: false, error: 'Invalid path' };
    }

    const text = await fs.readFile(resolved, 'utf8');
    return { ok: true, text };
  } catch (err) {
    console.error('read-lyrics error:', err);
    return { ok: false, error: err.message || 'Read failed' };
  }
});
