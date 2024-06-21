import { Collection, Db, GridFSBucket, MongoClient } from "mongodb";
import { type Patient, collectionName as patientsCollectionName } from "./Models/Patient";
import { Visit, collectionName as visitsCollectionName } from "./Models/Visit";
import { collectionName as filesCollectionName } from "./Models/File";
import { collectionName as privilegesCollectionName } from "./Models/Privilege";
import { collectionName as usersCollectionName } from "./Models/User";
import type { dbAPI } from "./dbAPI";
import { ipcMain } from "electron";
import { Unauthorized } from "./Unauthorized";
import { Unauthenticated } from "./Unauthenticated";
import { MongodbConfig } from "../Configuration/types";
import { readConfig, writeConfigSync } from "../Configuration/configuration";
import { Privilege } from "./Models/Privilege";
import { User } from "./Models/User";

export class MongoDB implements dbAPI {
    private static db: Db | null = null

    async handleEvents(): Promise<void> {
        ipcMain.handle('initialize-db', async (_e, { config }: { config: MongodbConfig }) => await this.initializeDb(config))
        ipcMain.handle('get-config', async () => await this.getConfig())
        ipcMain.handle('update-config', async (_e, { config }: { config: MongodbConfig }) => await this.updateConfig(config) != null)
    }

    async getConfig(): Promise<MongodbConfig> {
        return readConfig().mongodb
    }

    async updateConfig(config: MongodbConfig): Promise<boolean> {
        try {
            const c = readConfig()
            c.mongodb = config
            writeConfigSync(c)
            return readConfig()?.mongodb != null
        } catch (error) { return false }
    }

    getClient(): MongoClient {
        const c = readConfig()

        if (!c || !c.mongodb)
            throw new Error('Mongodb configuration not found.')

        return new MongoClient(c.mongodb.url, {
            directConnection: true,
            authMechanism: "SCRAM-SHA-256",
            auth: {
                username: c.mongodb.auth.username,
                password: c.mongodb.auth.password,
            }
        });
    }

    async getDb(client?: MongoClient): Promise<Db | null> {
        if (MongoDB.db != null)
            return MongoDB.db

        const c = readConfig()

        if (!c || !c.mongodb)
            throw new Error('Mongodb configuration not found.')

        if (!client)
            client = this.getClient()

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

    async initializeDb(config?: MongodbConfig) {
        try {
            if (config) {
                const c = readConfig()
                writeConfigSync({ ...c, mongodb: config })
            }

            this.addCollections()
        } catch (error) {
            console.error(error);
        }
    }

    async addCollections() {
        await this.addUsersCollection()
        await this.addPrivilegesCollection()
        await this.addPatientsCollection()
        await this.addVisitsCollection()
    }

    private async addUsersCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes(usersCollectionName))
            await db.createCollection(usersCollectionName)

        const indexes = await db.collection(usersCollectionName).indexes()

        if (indexes.find(i => i.name === 'unique-username') === undefined)
            await db.createIndex(usersCollectionName, { username: 1 }, { unique: true, name: 'unique-username' })
    }

    private async addPrivilegesCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes(privilegesCollectionName))
            await db.createCollection(privilegesCollectionName)

        const indexes = await db.collection(privilegesCollectionName).indexes()

        if (indexes.find(i => i.name === 'unique-privilege') === undefined)
            await db.createIndex(privilegesCollectionName, { role: 1, resource: 1, action: 1 }, { unique: true, name: 'unique-privilege' })
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

    async getUsersCollection(client?: MongoClient): Promise<Collection<User>> {
        return (await this.getDb(client)).collection<User>(usersCollectionName)
    }

    async getPrivilegesCollection(client?: MongoClient): Promise<Collection<Privilege>> {
        return (await this.getDb(client)).collection<Privilege>(privilegesCollectionName)
    }

    async getPatientsCollection(client?: MongoClient): Promise<Collection<Patient>> {
        return (await this.getDb(client)).collection<Patient>(patientsCollectionName)
    }

    async getVisitsCollection(client?: MongoClient): Promise<Collection<Visit>> {
        return (await this.getDb(client)).collection<Visit>(visitsCollectionName)
    }

    async getBucket(): Promise<GridFSBucket> {
        return new GridFSBucket(await this.getDb(), { bucketName: filesCollectionName });
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
