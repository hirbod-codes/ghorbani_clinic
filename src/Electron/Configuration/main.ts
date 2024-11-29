import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidV4 } from 'uuid';
import { CONFIGURATION_DIRECTORY } from '../../directories';
import type { ConfigurationStorableData } from "../../react/Contexts/ConfigurationContext"
import { User } from '../Database/Models/User';
import { ColumnPinningState, VisibilityState } from '@tanstack/react-table';
import { Density } from 'src/react/Components/DataGrid/Context';

export type MongodbConfig = {
    supportsTransaction: boolean;
    url: string;
    databaseName: string;
    auth?: {
        username: string;
        password: string;
    };
};

export type AuthConfig = { users: User[] }

export type Peer = {
    isMaster: boolean,
    hostName: string,
    port: number,
    ip: string
}

export type Config = {
    configuration?: ConfigurationStorableData,
    downloadsDirectorySize?: number,
    storage?: { [path: string]: number },
    mongodb?: MongodbConfig,
    auth?: AuthConfig,
    peers?: Peer[],
    appIdentifier?: string,
    appName?: string,
    isMaster?: boolean,
    port?: number,
    ip?: string,
    columnPinningModels?: { [k: string]: ColumnPinningState },
    columnVisibilityModels?: { [k: string]: VisibilityState },
    columnOrderModels?: { [k: string]: string[] },
    tableDensity?: { [k: string]: Density }
}

export function handleConfigEvents() {
    ipcMain.handle('read-config', () => {
        return readConfig()
    })

    ipcMain.on('write-config', (_e, { config }: { config: Config }) => {
        writeConfigSync(config)
    })
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
