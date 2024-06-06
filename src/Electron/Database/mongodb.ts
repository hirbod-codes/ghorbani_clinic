import { readConfig, writeConfig } from "../../Config/config";
import type { MongodbConfig } from '../../Config/types';
import { Collection, Db, GridFSBucket, MongoClient } from "mongodb";
import { type Patient, collectionName as patientsCollectionName } from "./Models/Patient";
import { Visit, collectionName as visitsCollectionName } from "./Models/Visit";
import type { dbAPI } from "./dbAPI";
import { collectionName as filesCollectionName } from "./Models/File";
import { ipcMain } from "electron";
import { Unauthorized } from "./Unauthorized";
import { Unauthenticated } from "./Unauthenticated";

export class MongoDB implements dbAPI {
    private static isInitialized = false
    private static db: Db | null = null

    async getConfig(): Promise<MongodbConfig> {
        return readConfig().mongodb
    }

    async updateConfig(config: MongodbConfig): Promise<boolean> {
        try {
            const c = readConfig()
            c.mongodb = config
            return writeConfig(c).mongodb != null
        } catch (error) {
            return false
        }
    }

    async getDb(): Promise<Db | null> {
        if (MongoDB.db != null)
            return MongoDB.db

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
            MongoDB.db = client.db(c.mongodb.databaseName)
            MongoDB.db.command({ ping: 1 })
            return MongoDB.db
        } catch (error) {
            console.error(error);

            await client.close()
            return null
        }
    }

    async initializeDb() {
        try {
            if (MongoDB.isInitialized)
                return
            else
                MongoDB.isInitialized = true

            this.addCollections()
        } catch (error) {
            console.error(error);
        }
    }

    async addCollections() {
        await this.addPatientsCollection()
        await this.addVisitsCollection()
    }

    private async addPatientsCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes(patientsCollectionName))
            await db.createCollection(patientsCollectionName)

        const indexes = await db.collection(patientsCollectionName).indexes()

        if (indexes.find(i => i.name === 'unique-socialId') === undefined)
            await db.createIndex(patientsCollectionName, { socialId: 1 }, { unique: true, name: 'unique-socialId' })

        if (indexes.find(i => i.name === 'visit-dues') === undefined)
            await db.createIndex(patientsCollectionName, { visitDues: 1 }, { name: 'visit-dues' })

        if (indexes.find(i => i.name === 'created-at') === undefined)
            await db.createIndex(patientsCollectionName, { createdAt: 1 }, { name: 'created-at' })

        if (indexes.find(i => i.name === 'updated-at') === undefined)
            await db.createIndex(patientsCollectionName, { updatedAt: 1 }, { name: 'updated-at' })
    }

    private async addVisitsCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes(visitsCollectionName))
            await db.createCollection(visitsCollectionName)

        const indexes = await db.collection(visitsCollectionName).indexes()

        if (indexes.find(i => i.name === 'patientId') === undefined)
            await db.createIndex(visitsCollectionName, { patientId: 1 }, { name: 'patientId' })

        if (indexes.find(i => i.name === 'due') === undefined)
            await db.createIndex(visitsCollectionName, { due: 1 }, { name: 'due' })

        if (indexes.find(i => i.name === 'created-at') === undefined)
            await db.createIndex(visitsCollectionName, { createdAt: 1 }, { name: 'created-at' })

        if (indexes.find(i => i.name === 'updated-at') === undefined)
            await db.createIndex(visitsCollectionName, { updatedAt: 1 }, { name: 'updated-at' })
    }

    async getPatientsCollection(): Promise<Collection<Patient>> {
        return (await this.getDb()).collection<Patient>(patientsCollectionName)
    }

    async getVisitsCollection(): Promise<Collection<Visit>> {
        return (await this.getDb()).collection<Visit>(visitsCollectionName)
    }

    async getBucket(): Promise<GridFSBucket> {
        return new GridFSBucket(await this.getDb(), { bucketName: filesCollectionName });
    }

    async handleEvents(): Promise<void> {
        ipcMain.handle('get-config', async () => await this.getConfig())
        ipcMain.handle('update-config', async (_e, { config }: { config: MongodbConfig; }) => await this.updateConfig(config) != null)
    }

    async handleErrors(callback: () => Promise<unknown>): Promise<string> {
        try {
            return JSON.stringify({
                code: 200,
                data: await callback()
            })
        }
        catch (error) {
            console.error('error in main process')
            console.error(error)
            if (error instanceof Unauthorized)
                return JSON.stringify({ code: 403 })
            else if (error instanceof Unauthenticated)
                return JSON.stringify({ code: 401 })
            else
                return JSON.stringify({ code: 500 })
        }
    }
}
