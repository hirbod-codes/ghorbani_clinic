import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import type { Config } from './types'

export function readConfig(): Config | null | undefined {
    const configFile = path.join(app.getPath('appData'), app.getName(), 'Configuration', 'config.json')

    if (!fs.existsSync(configFile))
        return undefined

    const configJson = fs.readFileSync(configFile).toString()
    return JSON.parse(configJson)
}

export function writeConfig(config: Config): void {
    const configFile = path.join(app.getPath('appData'), app.getName(), 'Configuration', 'config.json')

    fs.writeFile(configFile, JSON.stringify(config), (err) => err ? console.error(err) : null)
}

export function writeConfigSync(config: Config): void {
    const configFile = path.join(app.getPath('appData'), app.getName(), 'Configuration', 'config.json')

    fs.writeFileSync(configFile, JSON.stringify(config))
}

export function handleConfigEvents() {
    ipcMain.handle('read-config', () => {
        return readConfig()
    })

    ipcMain.on('write-config', (_e, { config }: { config: Config }) => {
        writeConfig(config)
    })
}
