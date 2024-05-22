import { ipcRenderer } from 'electron'

export function openMenu(x: number, y: number) {
    ipcRenderer.send('open-menu', { x, y })
}

export function minimize() {
    ipcRenderer.send('minimize')
}

export function maximize() {
    ipcRenderer.send('maximize')
}

export function unmaximize() {
    ipcRenderer.send('unmaximize')
}

export function maxUnmax() {
    ipcRenderer.send('maxUnmax')
}

export function close() {
    ipcRenderer.send('close')
}

export async function isWindowMaximized(): Promise<boolean | null | undefined> {
    return await ipcRenderer.invoke('isMaximized')
}
