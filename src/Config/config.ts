import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { hashSync } from 'bcrypt'
import type { AuthConfig, Config } from './types'

export function readConfig(): Config {
    const configFile = path.join(app.getAppPath(), 'src', 'Config', 'config.json')

    if (!fs.existsSync(configFile))
        return writeConfig()
    else {
        const configJson = fs.readFileSync(configFile).toString()
        return JSON.parse(configJson)
    }
}

export function writeConfig(config: Config = {
    "mongodb": {
        "url": null,
        "databaseName": "",
        "auth": {
            "username": "",
            "password": ""
        }
    }
}): Config {
    const configFile = path.join(app.getAppPath(), 'src', 'Config', 'config.json')

    fs.writeFileSync(configFile, JSON.stringify(config))

    return config
}

export function writeAuth(auth: AuthConfig = {
    authenticatedUserIndex: null,
    users: [
        { username: 'Ghorbani', password: hashSync('adminPass', 10), roleName: 'doctor' },
        { username: 'Secretary', password: hashSync('secretaryPass', 10), roleName: 'secretary' },
    ]
}): AuthConfig {
    const authFile = path.join(app.getAppPath(), 'src', 'Config', 'auth.json')

    fs.writeFileSync(authFile, JSON.stringify(auth))

    return auth
}

export function readAuth(): AuthConfig {
    const authFile = path.join(app.getAppPath(), 'src', 'Config', 'auth.json')

    if (!fs.existsSync(authFile))
        return writeAuth()
    else {
        const authJson = fs.readFileSync(authFile).toString()
        const auth = JSON.parse(authJson)
        return auth
    }
}
