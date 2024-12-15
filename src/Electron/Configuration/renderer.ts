import { ipcRenderer } from 'electron'
import type { Config, configAPI } from './renderer.d'
import { MongodbConfig } from './main.d'

export function writeConfig(config: Config) {
    ipcRenderer.send('write-config', { config })
}

export async function readConfig(): Promise<Config | undefined> {
    return await ipcRenderer.invoke('read-config')
}

export async function readDbConfig(): Promise<MongodbConfig | undefined> {
    return await ipcRenderer.invoke('read-db-config')
}

export function handleRendererEvents(): configAPI {
    return {
        readDbConfig,
        readConfig,
        writeConfig,
    };
}
