import { ipcMain } from 'electron'
import fs from 'fs'
import { v4 as uuidV4 } from 'uuid'
import { CONFIGURATION_DIRECTORY, CONFIGURATION_FILE } from '../../directories'
import type { Config as RendererConfig } from './renderer.d'
import type { Config } from './main.d'
import { mixed } from 'yup'

export function handleConfigEvents() {
    ipcMain.handle('read-db-config', () => {
        return readConfig()?.mongodb
    })

    ipcMain.handle('read-config', () => {
        return readConfig()?.rendererConfig
    })

    ipcMain.on('write-config', (_e, { config }: { config: RendererConfig }) => {
        try {
            if (!mixed<RendererConfig>().required().isValidSync(config)) {
                console.warn('Invalid configuration data provided by renderer process.')
                return
            } else
                config = mixed<RendererConfig>().required().cast(config)

            writeConfigSync({ ...readConfig(), rendererConfig: config })
        } catch (e) { console.error(e) }
    })

    ipcMain.handle('get-downloads-directory-size', () => {
        return readConfig()?.downloadsDirectorySize
    })

    ipcMain.handle('set-downloads-directory-size', (_e, { downloadsDirectorySize }: { downloadsDirectorySize: number }) => {
        if (typeof downloadsDirectorySize === 'number' || typeof downloadsDirectorySize === 'bigint')
            if (!Number.isNaN(downloadsDirectorySize) && Number.isFinite(downloadsDirectorySize))
                writeConfigSync({ ...readConfig(), downloadsDirectorySize })
    })
}

export function readConfig(): Config {
    const initialConfig = { appIdentifier: 'clinic', appName: `clinic-${uuidV4()}.local`, port: 3001, downloadsDirectorySize: 8_000_000_000 }

    if (!fs.existsSync(CONFIGURATION_FILE)) {
        writeConfigSync(initialConfig)
        return initialConfig
    }

    let configJson = fs.readFileSync(CONFIGURATION_FILE).toString()
    let c: Config = JSON.parse(configJson)

    if (c.appIdentifier && c.appName && c.port && c.downloadsDirectorySize)
        return c

    if (!c.downloadsDirectorySize)
        c.downloadsDirectorySize = initialConfig.downloadsDirectorySize
    if (!c.appIdentifier)
        c.appIdentifier = initialConfig.appIdentifier
    if (!c.appName)
        c.appName = initialConfig.appName
    if (!c.port)
        c.port = initialConfig.port

    writeConfigSync(c)

    return c
}

export function writeConfig(config: Config): Promise<void> {
    return new Promise((res, rej) => {
        if (!fs.existsSync(CONFIGURATION_DIRECTORY))
            fs.mkdirSync(CONFIGURATION_DIRECTORY, { recursive: true })

        fs.writeFile(CONFIGURATION_FILE, JSON.stringify(config, undefined, 4), (err) => {
            if (err) {
                console.error(err)
                rej()
            }
            else
                res();
        })
    })
}

export function writeConfigSync(config: Config): void {
    if (!fs.existsSync(CONFIGURATION_DIRECTORY))
        fs.mkdirSync(CONFIGURATION_DIRECTORY, { recursive: true })

    fs.writeFileSync(CONFIGURATION_FILE, JSON.stringify(config))
}
