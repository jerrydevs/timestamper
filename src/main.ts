import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { isValidTimestamp } from './utils';

if (started) {
  app.quit();
}

let previousClipboardText = '';
const POLLING_INTERVAL = 500; // milliseconds
function startClipboardMonitor(mainWindow: BrowserWindow) {
  setInterval(() => {
    try {
      const clipboardText = clipboard.readText();
      if (clipboardText === previousClipboardText) {
        return;
      }

      previousClipboardText = clipboardText;
      if (isValidTimestamp(clipboardText)) {
        mainWindow.webContents.send('timestamp-detected', {
          timestamp: clipboardText,
        })
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  }, POLLING_INTERVAL);
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  startClipboardMonitor(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('start-monitoring', () => {
  console.log('Clipboard monitoring started');
});

ipcMain.on('stop-monitoring', () => {
  console.log('Clipboard monitoring stopped');

});