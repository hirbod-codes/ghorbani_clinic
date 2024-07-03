import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import type { Config } from './types'
import { v4 as uuidV4 } from 'uuid';

export function readConfig(): Config | null | undefined {
    const configFile = path.join(app.getPath('appData'), app.getName(), 'Configuration', 'config.json')

    if (!fs.existsSync(configFile))
        writeConfigSync({ appIdentifier: 'clinic', appName: `clinic-${uuidV4()}.local`, port: 3001 })

    let configJson = fs.readFileSync(configFile).toString()
    let c = JSON.parse(configJson)

    if (c.appIdentifier && c.appName && c.port)
        return c

    writeConfigSync({ ...c, appIdentifier: 'clinic', appName: `clinic-${uuidV4()}.local`, port: 3001 })

    configJson = fs.readFileSync(configFile).toString()
    return JSON.parse(configJson)
}

export function writeConfig(config: Config): void {
    const configFolder = path.join(app.getPath('appData'), app.getName(), 'Configuration')
    const configFile = path.join(configFolder, 'config.json')

    if (!fs.existsSync(configFolder))
        fs.mkdirSync(configFolder, { recursive: true })

    fs.writeFile(configFile, JSON.stringify(config), (err) => err ? console.error(err) : null)
}

export function writeConfigSync(config: Config): void {
    const configFolder = path.join(app.getPath('appData'), app.getName(), 'Configuration')
    const configFile = path.join(configFolder, 'config.json')

    if (!fs.existsSync(configFolder))
        fs.mkdirSync(configFolder, { recursive: true })

    fs.writeFileSync(configFile, JSON.stringify(config))
}

export function handleConfigEvents() {
    ipcMain.handle('read-config', () => {
        return readConfig()
    })

    ipcMain.on('write-config', (_e, { config }: { config: Config }) => {
        writeConfigSync(config)
    })
}
