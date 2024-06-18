import { ipcRenderer } from 'electron'
import type { Config } from '../types'

export function writeConfig(config: Config) {
    ipcRenderer.send('write-config', { config })
}

export async function readConfig(): Promise<Config | null | undefined> {
    return await ipcRenderer.invoke('read-config')
}
