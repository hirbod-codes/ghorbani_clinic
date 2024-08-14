import { ipcRenderer } from 'electron'
import { Config } from './main'

export type configAPI = {
    readConfig: () => Promise<Config>,
    writeConfig: (config: Config) => void
}

export function writeConfig(config: Config) {
    ipcRenderer.send('write-config', { config })
}

export async function readConfig(): Promise<Config> {
    return await ipcRenderer.invoke('read-config')
}
