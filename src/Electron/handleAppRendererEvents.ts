import { ipcRenderer } from "electron"

export type appAPI = {
    reLaunch: () => void
}

export function handleAppRendererEvents(): appAPI {
    return {
        reLaunch: () => ipcRenderer.send('relaunch-app')
    }
}
