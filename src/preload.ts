import { contextBridge } from 'electron'
import * as menu from './Electron/Menu/renderer/menu'
import { menuAPI } from './Electron/Menu/renderer/menuAPI'
import { handleRendererEvents as handleConfigurationRendererEvents } from './Electron/Configuration/renderer'
import { handleRendererEvents as handleDbRendererEvents } from './Electron/Database/renderer'
import { handleRendererEvents as handleAppRendererEvents } from './Electron/appRendererEvents'

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

contextBridge.exposeInMainWorld('configAPI', handleConfigurationRendererEvents())

contextBridge.exposeInMainWorld('dbAPI', handleDbRendererEvents())
