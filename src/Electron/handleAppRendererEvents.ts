import { ipcRenderer } from "electron"

export type appAPI = {
    reLaunch: () => void;
    saveFile: (content: string) => void;
}

export function handleAppRendererEvents(): appAPI {
    return {
        reLaunch: () => ipcRenderer.send('relaunch-app'),
        saveFile: (content: string) => ipcRenderer.send('save-file', { content })
    }
}
