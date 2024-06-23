import { app, BrowserWindow } from 'electron';
import { handleMenuEvents } from './Electron/Menu/menu';
import { handleConfigEvents } from './Electron/Configuration/configuration';
import { handleDbEvents } from './Electron/Database/handleDbEvents';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) app.quit();

const createWindow = (): void => {
    const mainWindow = new BrowserWindow({
        height: 900,
        width: 1200,
        center: true,
        frame: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (!app.isPackaged)
        mainWindow.webContents.openDevTools({ mode: 'right' });
};

app.on('ready', async () => {
    createWindow()

    handleMenuEvents()
    handleConfigEvents()
    await handleDbEvents()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

