import * as db from './Electron/Database/renderer/mongodb'
import * as auth from './Electron/Auth/renderer/auth'
import * as menu from './Electron/Menu/renderer/menu'
import type { menuAPI } from './Electron/Menu/renderer/menuAPI'
import type { authAPI } from './Electron/Auth/renderer/authAPI'
import type { dbAPI } from './Electron/Database/renderer/dbAPI'
import { contextBridge } from 'electron'

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
    getAuthenticatedUser: auth.getAuthenticatedUser,
    login: auth.login,
    logout: auth.logout,
} as authAPI)

contextBridge.exposeInMainWorld('dbAPI', {
    getConfig: db.getConfig,
    updateConfig: db.updateConfig,
    createPatient: db.createPatient,
    getPatientWithVisits: db.getPatientWithVisits,
    getPatientsWithVisits: db.getPatientsWithVisits,
    getPatient: db.getPatient,
    getPatients: db.getPatients,
    updatePatient: db.updatePatient,
    deletePatient: db.deletePatient,
    createVisit: db.createVisit,
    getVisits: db.getVisits,
    updateVisit: db.updateVisit,
    deleteVisit: db.deleteVisit,
    uploadFiles: db.uploadFiles,
    retrieveFiles: db.retrieveFiles,
    downloadFile: db.downloadFile,
    downloadFiles: db.downloadFiles,
    openFile: db.openFile,
    deleteFiles: db.deleteFiles,
} as dbAPI)
