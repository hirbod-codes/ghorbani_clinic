import { ipcMain } from "electron";
import { MongodbConfig, readConfig, writeConfig } from "../../Config/config";
import { Db, MongoClient } from "mongodb";

export function getConfig(): MongodbConfig {
    return readConfig().mongodb
}

export function updateConfig(config: MongodbConfig): MongodbConfig | null {
    try {
        const c = readConfig()
        c.mongodb = config
        return writeConfig(c).mongodb
    } catch (error) {
        return null
    }
}

export async function getDb(): Promise<Db | null> {
    const c = readConfig()

    const client = new MongoClient(c.mongodb.url, {
        directConnection: true,
        authMechanism: "SCRAM-SHA-256",
        auth: {
            username: c.mongodb.auth.username,
            password: c.mongodb.auth.password,
        }
    });

    try {
        const db = client.db(c.mongodb.databaseName)
        db.command({ ping: 1 })
        return db
    } catch (error) {
        await client.close()
        return null
    }
}

export function handleDbEvents() {
    ipcMain.handle('get-config', () => {
        return getConfig()
    })

    ipcMain.handle('update-config', (_e, { config }: { config: MongodbConfig }) => {
        return updateConfig(config) != null
    })
}
