import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidV4 } from 'uuid'
import { CONFIGURATION_DIRECTORY } from '../../directories'
import type { Config as RendererConfig } from './renderer.d'
import type { Config, MongodbConfig } from './main.d'
import { mixed } from 'yup'

export function handleConfigEvents() {
    ipcMain.handle('read-db-config', () => {
        return readDbConfig()
    })

    ipcMain.handle('read-config', () => {
        return readConfig()?.rendererConfig ?? {}
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
}

export function readDbConfig(): MongodbConfig | undefined {
    const configFile = path.join(CONFIGURATION_DIRECTORY, 'config.json')
    if (!fs.existsSync(configFile))
        return undefined

    let configJson = fs.readFileSync(configFile).toString()
    let c: Config = JSON.parse(configJson)

    if (!mixed<MongodbConfig>().required().isValidSync(c))
        return undefined

    return mixed<MongodbConfig>().required().cast(c)
}

export function readConfig(): Config {
    const configFile = path.join(CONFIGURATION_DIRECTORY, 'config.json')

    const initialConfig = { appIdentifier: 'clinic', appName: `clinic-${uuidV4()}.local`, port: 3001, downloadsDirectorySize: 8_000_000_000 }

    if (!fs.existsSync(configFile)) {
        writeConfigSync(initialConfig)
        return initialConfig
    }

    let configJson = fs.readFileSync(configFile).toString()
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
        const configFolder = path.join(CONFIGURATION_DIRECTORY)
        const configFile = path.join(configFolder, 'config.json')

        if (!fs.existsSync(configFolder))
            fs.mkdirSync(configFolder, { recursive: true })

        fs.writeFile(configFile, JSON.stringify(config, undefined, 4), (err) => {
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
    const configFolder = path.join(CONFIGURATION_DIRECTORY)
    const configFile = path.join(configFolder, 'config.json')

    if (!fs.existsSync(configFolder))
        fs.mkdirSync(configFolder, { recursive: true })

    fs.writeFileSync(configFile, JSON.stringify(config))
}
