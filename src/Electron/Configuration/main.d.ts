import type { ConfigurationStorableData } from "../../react/Contexts/ConfigurationContext"
import { User } from '../Database/Models/User'
import type { Config as RendererConfig } from './renderer'

export type MongodbConfig = {
    supportsTransaction: boolean;
    url: string;
    databaseName: string;
    auth?: {
        username: string;
        password: string;
    };
}

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
    rendererConfig?: RendererConfig,
}
