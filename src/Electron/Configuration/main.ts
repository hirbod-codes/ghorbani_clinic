import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidV4 } from 'uuid';
import { CONFIGURATION_DIRECTORY } from '../../directories';
import type { ConfigurationStorableData } from "../../react/Contexts/ConfigurationContext"
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { User } from '../Database/Models/User';

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
    mongodb?: MongodbConfig,
    auth?: AuthConfig,
    peers?: Peer[],
    appIdentifier?: string,
    appName?: string,
    isMaster?: boolean,
    port?: number,
    ip?: string,
    columnVisibilityModels?: { [k: string]: GridColumnVisibilityModel }
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
    const configFolder = path.join(CONFIGURATION_DIRECTORY)
    const configFile = path.join(configFolder, 'config.json')

    if (!fs.existsSync(configFolder))
        fs.mkdirSync(configFolder, { recursive: true })

    fs.writeFile(configFile, JSON.stringify(config), (err) => err ? console.error(err) : null)
}

export function writeConfigSync(config: Config): void {
    const configFolder = path.join(CONFIGURATION_DIRECTORY)
    const configFile = path.join(configFolder, 'config.json')

    if (!fs.existsSync(configFolder))
        fs.mkdirSync(configFolder, { recursive: true })

    fs.writeFileSync(configFile, JSON.stringify(config))
}
