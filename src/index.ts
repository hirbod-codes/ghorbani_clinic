import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { template } from './Electron/Menu/Templates/MainMenu'

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

    ipcMain.on('open-menu', (e) => {
        const menu = Menu.buildFromTemplate(template)
        menu.popup({ window: BrowserWindow.fromWebContents(e.sender) })
    })

    ipcMain.on('minimize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        if (browserWindow.minimizable)
            browserWindow.minimize()
    })

    ipcMain.on('maximize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        if (browserWindow.maximizable)
            browserWindow.maximize()
    })

    ipcMain.on('unmaximize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        browserWindow.unmaximize()
    })

    ipcMain.on('maxUnmax', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        if (browserWindow.isMaximized())
            browserWindow.unmaximize()
        else
            browserWindow.maximize()
    })

    ipcMain.on('close', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        browserWindow.close()
    })

    ipcMain.handle('isMaximized', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()

        if (browserWindow !== null)
            return browserWindow.isMaximized()
    })
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
