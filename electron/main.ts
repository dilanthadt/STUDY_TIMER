import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerMonitor } from 'electron';
import * as path from 'path';
import { PersistenceService } from './persistence';
import { SessionLog } from './types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let persistence: PersistenceService;

// Fallback 16x16 orange clock PNG in base64 for tray icon
const TRAY_ICON_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAP0lEQVR42mP8z8AARAEw/UdnoCugGzBxYgwg1gDkGkAsG9CAsYEx2IAoFoz8s6FhNPAfBcg1gFgD/qPzsdgAALq3GQ1oE24EAAAAAElFTkSuQmCC';

function createTray() {
  try {
    let icon = nativeImage.createFromDataURL(TRAY_ICON_BASE64);
    tray = new Tray(icon);
    tray.setToolTip('Focus15 - Floating Study Timer');

    const updateContextMenu = () => {
      const isVisible = mainWindow ? mainWindow.isVisible() : false;
      const isAlwaysOnTop = mainWindow ? mainWindow.isAlwaysOnTop() : true;

      const contextMenu = Menu.buildFromTemplate([
        {
          label: isVisible ? 'Hide Focus15' : 'Show Focus15',
          click: () => {
            if (!mainWindow) return;
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
              mainWindow.focus();
            }
          },
        },
        {
          label: 'Always On Top',
          type: 'checkbox',
          checked: isAlwaysOnTop,
          click: (menuItem) => {
            if (!mainWindow) return;
            const target = menuItem.checked;
            setAlwaysOnTopState(target);
          },
        },
        { type: 'separator' },
        {
          label: 'Quit Focus15',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ]);

      tray?.setContextMenu(contextMenu);
    };

    tray.on('click', () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
      updateContextMenu();
    });

    updateContextMenu();
  } catch (err) {
    console.error('[Main] Failed to initialize tray:', err);
  }
}

function setAlwaysOnTopState(enable: boolean) {
  if (!mainWindow) return;
  if (enable) {
    // Strongest practical setting on Windows desktop
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } else {
    mainWindow.setAlwaysOnTop(false);
  }
  persistence.updateSettings({ alwaysOnTop: enable });
}

function createWindow() {
  persistence = new PersistenceService();
  const savedSettings = persistence.getSettings();

  mainWindow = new BrowserWindow({
    width: 260,
    height: 275,
    minWidth: 230,
    minHeight: 250,
    maxWidth: 340,
    maxHeight: 360,
    frame: false,
    transparent: false,
    backgroundColor: '#141416',
    alwaysOnTop: savedSettings.alwaysOnTop,
    show: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });

  // Apply strongest always on top if configured
  if (savedSettings.alwaysOnTop) {
    setAlwaysOnTopState(true);
  }

  // Handle window close by hiding to tray instead of full exit
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle dev vs production loading
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    const prodPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(prodPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Setup system powerMonitor for Windows sleep & resume honesty
  powerMonitor.on('suspend', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('focus15:power-suspend');
    }
  });

  powerMonitor.on('resume', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('focus15:power-resume');
    }
  });
}

// IPC Handlers
function setupIpc() {
  ipcMain.handle('focus15:getSessions', async () => {
    return persistence.getSessions();
  });

  ipcMain.handle('focus15:saveSession', async (_event, session: SessionLog) => {
    return persistence.addSession(session);
  });

  ipcMain.handle('focus15:getTodayStopwatchSeconds', async () => {
    return persistence.getTodayStopwatchSeconds();
  });

  ipcMain.handle('focus15:saveTodayStopwatchSeconds', async (_event, seconds: number) => {
    return persistence.saveTodayStopwatchSeconds(seconds);
  });

  ipcMain.handle('focus15:minimizeWindow', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('focus15:closeWindow', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Per requirements: hide/minimize to tray rather than terminate
      mainWindow.hide();
    }
  });

  ipcMain.handle('focus15:toggleAlwaysOnTop', async (_event, forcedValue?: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    const currentState = mainWindow.isAlwaysOnTop();
    const nextState = typeof forcedValue === 'boolean' ? forcedValue : !currentState;
    setAlwaysOnTopState(nextState);
    return nextState;
  });

  ipcMain.handle('focus15:isAlwaysOnTop', async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    return mainWindow.isAlwaysOnTop();
  });
}

// App lifecycle
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    setupIpc();
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        mainWindow?.show();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // If user specifically closed all windows and tray is not keeping it alive, or quit
      if (isQuitting) {
        app.quit();
      }
    }
  });
}
