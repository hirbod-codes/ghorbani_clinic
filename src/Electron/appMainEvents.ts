import { app, BrowserWindow, dialog, ipcMain, nativeImage } from "electron"
import fs from 'fs';

export function handleAppMainEvents(mainWindow: BrowserWindow) {
    ipcMain.on('relaunch-app', () => {
        app.relaunch()
        app.exit()
    })

    ipcMain.handle('save-file', (_e, { content, path }: { content: string, path: string }) => {
        try {
            if (!fs.existsSync(path) || !fs.statSync(path).isDirectory())
                return false

            fs.writeFileSync(path, content)
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    })

    ipcMain.handle('save-file-dialog', async (_e, options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => {
        try { return await dialog.showSaveDialog(mainWindow, { properties: ['createDirectory', 'showHiddenFiles'], ...options, title: options?.title ?? 'Save file' }) }
        catch (e) { console.error(e) }
    })

    ipcMain.handle('open-directory-dialog', async (_e, options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => {
        try { return await dialog.showOpenDialog(mainWindow, { properties: ['createDirectory', 'openDirectory', 'showHiddenFiles'], ...options, title: options?.title ?? 'Open directory' }) }
        catch (e) { console.error(e) }
    })

    ipcMain.handle('open-file-dialog', async (_e, options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => {
        try { return await dialog.showOpenDialog(mainWindow, { properties: ['createDirectory', 'openFile', 'multiSelections', 'showHiddenFiles'], ...options, title: options?.title ?? 'Open file' }) }
        catch (e) { console.error(e) }
    })

    ipcMain.handle('set-app-icon', async (_e): Promise<boolean> => {
        try {
            const iconAddress = await dialog.showOpenDialog(mainWindow, { properties: ['createDirectory', 'openFile', 'multiSelections', 'showHiddenFiles'], filters: [{ extensions: ['icn', 'ico', 'png'], name: 'icons' }], title: 'Select icon' })
            if (iconAddress.canceled)
                return false

            console.log({ iconAddress })

            mainWindow.setIcon(nativeImage.createFromPath(iconAddress.filePaths[0]))

            return true
        }
        catch (e) {
            console.error(e);
            return false
        }
    })
}
