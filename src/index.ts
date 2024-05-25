import { app, BrowserWindow } from 'electron'
import { handleMenuEvents } from './Electron/Menu/menu';
import { handleAuthEvents } from './Electron/Auth/auth';
import { handleDbEvents } from './Electron/Database/mongodb';

app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

if (require('electron-squirrel-startup')) {
    app.quit()
}

const createWindow = async (): Promise<BrowserWindow> => {
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        center: true,
        fullscreen: false,
        frame: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    })

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    mainWindow.webContents.openDevTools()

    return mainWindow
}

app.on('ready', async () => {
    await createWindow()

    handleMenuEvents()
    handleAuthEvents()
    handleDbEvents()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow()
    }
})
