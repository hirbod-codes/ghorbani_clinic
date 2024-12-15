import { BrowserWindow, ipcMain, Menu } from 'electron'
import { template } from './Templates/MainMenu'

export function handleMenuEvents() {
    ipcMain.on('open-menu', (e) => {
        const menu = Menu.buildFromTemplate(template)
        menu.popup({ window: BrowserWindow.fromWebContents(e.sender) ?? undefined })
    })

    ipcMain.on('minimize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        if (browserWindow.minimizable)
            browserWindow.minimize()
    })

    ipcMain.on('maximize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        if (browserWindow.maximizable)
            browserWindow.maximize()
    })

    ipcMain.on('unmaximize', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        browserWindow.unmaximize()
    })

    ipcMain.on('maxUnmax', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        if (browserWindow.isMaximized())
            browserWindow.unmaximize()
        else
            browserWindow.maximize()
    })

    ipcMain.on('close', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        browserWindow.close()
    })

    ipcMain.handle('isMaximized', () => {
        const browserWindow = BrowserWindow.getFocusedWindow()
        if (!browserWindow)
            return

        if (browserWindow !== null)
            return browserWindow.isMaximized()
    })
}
