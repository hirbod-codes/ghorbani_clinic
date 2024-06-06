import * as auth from './Electron/Auth/renderer/auth'
import * as menu from './Electron/Menu/renderer/menu'
import type { menuAPI } from './Electron/Menu/renderer/menuAPI'
import type { authAPI } from './Electron/Auth/renderer/authAPI'
import { contextBridge } from 'electron'
import { handleDbRendererEvents } from "./Electron/Database/handleDbRendererEvents"

contextBridge.exposeInMainWorld('menuAPI', {
    openMenu: menu.openMenu,
    minimize: menu.minimize,
    maximize: menu.maximize,
    unmaximize: menu.unmaximize,
    maxUnmax: menu.maxUnmax,
    close: menu.close,
    isWindowMaximized: menu.isWindowMaximized,
} as menuAPI)

contextBridge.exposeInMainWorld('authAPI', {
    getAuthenticatedUserPrivileges: auth.getAuthenticatedUserPrivileges,
    getAuthenticatedUser: auth.getAuthenticatedUser,
    login: auth.login,
    logout: auth.logout,
} as authAPI)

contextBridge.exposeInMainWorld('dbAPI', handleDbRendererEvents())
