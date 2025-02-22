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

export async function getDownloadsDirectorySize(): Promise<number> {
    return await ipcRenderer.invoke('get-downloads-directory-size')
}

export async function setDownloadsDirectorySize(downloadsDirectorySize: number): Promise<void> {
    await ipcRenderer.invoke('set-downloads-directory-size', { downloadsDirectorySize })
}

export function handleRendererEvents(): configAPI {
    return {
        readDbConfig,
        readConfig,
        writeConfig,
        getDownloadsDirectorySize,
        setDownloadsDirectorySize,
    };
}
