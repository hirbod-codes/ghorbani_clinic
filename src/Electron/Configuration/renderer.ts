import { ipcRenderer } from 'electron'
import type { Config } from './renderer.d'
import { mixed } from 'yup'

export function writeConfig(config: Config) {
    ipcRenderer.send('write-config', { config: mixed<Config>().required().cast(config) })
}

export async function readConfig(): Promise<Config> {
    return await ipcRenderer.invoke('read-config')
}
