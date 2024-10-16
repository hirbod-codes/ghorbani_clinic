import { contextBridge, ipcRenderer } from 'electron'
import * as menu from './Electron/Menu/renderer/menu'
import * as configs from './Electron/Configuration/renderer'
import { menuAPI } from './Electron/Menu/renderer/menuAPI'
import { handleDbRendererEvents } from './Electron/Database/renderer'
import { handleAppRendererEvents } from './Electron/handleAppRendererEvents'

contextBridge.exposeInMainWorld('appAPI', handleAppRendererEvents())

contextBridge.exposeInMainWorld('menuAPI', {
    openMenu: menu.openMenu,
    minimize: menu.minimize,
    maximize: menu.maximize,
    unmaximize: menu.unmaximize,
    maxUnmax: menu.maxUnmax,
    close: menu.close,
    isWindowMaximized: menu.isWindowMaximized,
} as menuAPI)

contextBridge.exposeInMainWorld('configAPI', {
    readConfig: configs.readConfig,
    writeConfig: configs.writeConfig,
} as configs.configAPI)

contextBridge.exposeInMainWorld('dbAPI', handleDbRendererEvents())
