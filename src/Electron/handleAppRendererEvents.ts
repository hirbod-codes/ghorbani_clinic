import { ipcRenderer, OpenDialogReturnValue, SaveDialogReturnValue } from "electron"

export type appAPI = {
    reLaunch: () => void;
    saveFile: ({ content, path }: { content: string, path: string }) => Promise<boolean>;
    saveFileDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => Promise<SaveDialogReturnValue>;
    openDirectoryDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => Promise<OpenDialogReturnValue>;
    openFileDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }) => Promise<OpenDialogReturnValue>;
}

export function handleAppRendererEvents(): appAPI {
    return {
        reLaunch: () => ipcRenderer.send('relaunch-app'),
        saveFile: ({ content, path }: { content: string, path: string }): Promise<boolean> => ipcRenderer.invoke('save-file', { content, path }),
        saveFileDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }): Promise<SaveDialogReturnValue> => ipcRenderer.invoke('save-file-dialog', options),
        openDirectoryDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }): Promise<OpenDialogReturnValue> => ipcRenderer.invoke('open-directory-dialog', options),
        openFileDialog: (options?: { defaultPath?: string, message?: string, buttonLabel?: string, title?: string }): Promise<OpenDialogReturnValue> => ipcRenderer.invoke('open-file-dialog', options),
    }
}
