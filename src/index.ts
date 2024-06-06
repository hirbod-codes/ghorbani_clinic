import { app, BrowserWindow } from 'electron'
import { handleMenuEvents } from './Electron/Menu/menu';
import { handleAuthEvents } from './Electron/Auth/auth';
import { handleDbEvents } from "./Electron/Database/handleDbEvents";
import fs from 'fs'
import path from 'path'
import { logout } from './Electron/Auth/renderer/auth';

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
    fs.rmSync(path.join(app.getAppPath(), 'tmp'), { recursive: true })
    fs.mkdirSync(path.join(app.getAppPath(), 'tmp', 'downloads'), { recursive: true })

    console.log('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
    await createWindow()
    console.log('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111')

    console.log('2222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222')
    handleMenuEvents()
    console.log('3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333')
    handleAuthEvents()
    console.log('4444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444')
    await handleDbEvents()
    console.log('5555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555')
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('quit', async () => {
    await logout()
    fs.rmSync(path.join(app.getAppPath(), 'tmp'), { recursive: true })
})

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow()
    }
})
