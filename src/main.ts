import os from 'os'
import { app, BrowserWindow } from 'electron';
import { handleMenuEvents } from './Electron/Menu/menu';
import { handleConfigEvents, readConfig, writeConfigSync } from './Electron/Configuration/main';
import { db, handleDbEvents } from './Electron/Database/main';
import path from 'path';
import { handleAppMainEvents } from './Electron/appMainEvents';

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
    console.warn('Failed to find the host IP address.')

writeConfigSync({
    ...c,
    ip
})

if (require('electron-squirrel-startup'))
    app.quit();

let mainWindow: BrowserWindow;

const createWindow = (): void => {
    if (!mainWindow)
        mainWindow = new BrowserWindow({
            fullscreen: false,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL)
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    else
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));


    if (!app.isPackaged)
        mainWindow.webContents.openDevTools({ mode: 'right' });
};

app.on('ready', async () => {

    handleConfigEvents()

    handleMenuEvents()

    await handleDbEvents()

    createWindow()

    handleAppMainEvents(mainWindow)

    const c = readConfig()
    if (app.isPackaged && !c.mongodb)
        return

    try { await db.initializeDb() }
    catch (err) { console.error(err) }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow()
});
