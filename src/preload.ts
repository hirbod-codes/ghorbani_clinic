import * as menuFunctions from './Electron/Menu/menu-functions'
import type { menuAPI } from './renderer-types'
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('menuAPI', {
    openMenu: menuFunctions.openMenu,
    minimize: menuFunctions.minimize,
    maximize: menuFunctions.maximize,
    unmaximize: menuFunctions.unmaximize,
    maxUnmax: menuFunctions.maxUnmax,
    close: menuFunctions.close,
    isWindowMaximized: menuFunctions.isWindowMaximized,
} as menuAPI)
