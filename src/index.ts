import os from 'os'
import { app, BrowserWindow, ipcMain } from 'electron';
import { handleMenuEvents } from './Electron/Menu/menu';
import { handleConfigEvents, readConfig, writeConfigSync } from './Electron/Configuration/configuration';
import { handleDbEvents } from './Electron/Database/handleDbEvents';

const c = readConfig()

if (!c.appIdentifier || !c.appName || !c.port)
    throw new Error('Incomplete environment variables provided.')

const interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = os.networkInterfaces();
console.log('interfaces: ', interfaces);

const ip = Object.entries(interfaces)
    .reduce<os.NetworkInterfaceInfo | undefined>((pArr, cArr) => {
        if (pArr)
            return pArr

        if (cArr[1])
            return cArr[1]?.find(f => f.family === 'IPv4' && f.internal === false);
    }, undefined)?.address;

console.log('address: ', ip);

if (!ip)
    throw new Error('Failed to find the host IP address.')

writeConfigSync({
    ...c,
    ip
})

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
    ipcMain.on('relaunch-app', () => {
        app.relaunch()
        app.exit()
    })

    handleConfigEvents()

    createWindow()

    const c = readConfig()
    if (app.isPackaged && !c.mongodb)
        return

    handleMenuEvents()
    await handleDbEvents()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow()
});
