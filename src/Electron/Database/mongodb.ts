import { ClientSession, Collection, Db, GridFSBucket, MongoClient } from "mongodb";
import { type Patient, collectionName as patientsCollectionName } from "./Models/Patient";
import { type MedicalHistory, collectionName as patientsMedicalHistoriesCollectionName } from "./Models/MedicalHistory";
import { Visit, collectionName as visitsCollectionName } from "./Models/Visit";
import { collectionName as patientsDocumentsCollectionName } from "./Models/PatientsDocuments";
import { collectionName as canvasCollectionName } from "./Models/Canvas";
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

    protected transactionClient: MongoClient | undefined = undefined
    protected session: ClientSession | undefined = undefined

    startTransaction(): void {
        const funcName = 'startTransaction'

        console.log(funcName, 'called')

        const supportsTransaction = readConfig().mongodb.supportsTransaction
        if (!supportsTransaction) {
            console.log(funcName, 'Transactions are not supported.')
            return
        }

        this.transactionClient = this.getClient()
        this.session = this.transactionClient.startSession()

        this.session.startTransaction()
    }

    async abortTransaction(): Promise<void> {
        const funcName = 'abortTransaction'

        console.log(funcName, 'called')

        const supportsTransaction = readConfig().mongodb.supportsTransaction
        if (!supportsTransaction) {
            console.log(funcName, 'Transactions are not supported.')
            return
        }

        await this.session.abortTransaction()
    }

    async commitTransaction(): Promise<void> {
        const funcName = 'commitTransaction'

        console.log(funcName, 'called')

        const supportsTransaction = readConfig().mongodb.supportsTransaction
        if (!supportsTransaction) {
            console.log(funcName, 'Transactions are not supported.')
            return
        }

        await this.session.commitTransaction()
    }

    async endSession(): Promise<void> {
        const funcName = 'endSession'

        console.log(funcName, 'called')

        const supportsTransaction = readConfig().mongodb.supportsTransaction
        if (!supportsTransaction) {
            console.log(funcName, 'Transactions are not supported.')
            return
        }

        await this.session.endSession()
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
            authMechanism: "DEFAULT",
            auth: c.mongodb.auth
                ? {
                    username: c.mongodb.auth.username,
                    password: c.mongodb.auth.password,
                }
                : undefined
        });
    }

    async getDb(client?: MongoClient, persist = true): Promise<Db | null> {
        const c = readConfig()

        if (!c || !c.mongodb)
            throw new Error('Mongodb configuration not found.')

        let db
        if (!client) {
            if (MongoDB.db)
                return MongoDB.db

            client = this.getClient()
            db = client.db(c.mongodb.databaseName)
        }
        else
            db = client.db(c.mongodb.databaseName)


        if (persist)
            MongoDB.db = db

        try {
            db.command({ ping: 1 })
        } catch (error) {
            console.error(error);
            await client.close()
            throw error
        }

        return db
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
        await this.addMedicalHistoriesCollection()
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

    private async addMedicalHistoriesCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes(patientsMedicalHistoriesCollectionName))
            await db.createCollection(patientsMedicalHistoriesCollectionName)

        const indexes = await db.collection(patientsMedicalHistoriesCollectionName).indexes()

        if (indexes.find(i => i.name === 'patientId') === undefined)
            await db.createIndex(visitsCollectionName, { patientId: 1 }, { name: 'patientId' })

        if (indexes.find(i => i.name === 'unique-name') === undefined)
            await db.createIndex(patientsMedicalHistoriesCollectionName, { name: 1 }, { unique: true, name: 'unique-name' })
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

    async getUsersCollection(client?: MongoClient, db?: Db): Promise<Collection<User>> {
        return (db ?? (await this.getDb(client))).collection<User>(usersCollectionName)
    }

    async getPrivilegesCollection(client?: MongoClient, db?: Db): Promise<Collection<Privilege>> {
        return (db ?? (await this.getDb(client))).collection<Privilege>(privilegesCollectionName)
    }

    async getPatientsCollection(client?: MongoClient, db?: Db): Promise<Collection<Patient>> {
        return (db ?? (await this.getDb(client))).collection<Patient>(patientsCollectionName)
    }

    async getMedicalHistoriesCollection(client?: MongoClient, db?: Db): Promise<Collection<MedicalHistory>> {
        return (db ?? (await this.getDb(client))).collection<MedicalHistory>(patientsMedicalHistoriesCollectionName)
    }

    async getVisitsCollection(client?: MongoClient, db?: Db): Promise<Collection<Visit>> {
        return (db ?? (await this.getDb(client))).collection<Visit>(visitsCollectionName)
    }

    async getPatientsDocumentsBucket(client?: MongoClient, db?: Db): Promise<GridFSBucket> {
        return new GridFSBucket(db ?? (await this.getDb(client)), { bucketName: patientsDocumentsCollectionName });
    }

    async getCanvasBucket(client?: MongoClient, db?: Db): Promise<GridFSBucket> {
        return new GridFSBucket(db ?? (await this.getDb(client)), { bucketName: canvasCollectionName });
    }

    async handleErrors(callback: () => Promise<unknown> | unknown, jsonStringify = true): Promise<string | any> {
        try {
            const response = {
                code: 200,
                data: await callback()
            }
            if (jsonStringify)
                return JSON.stringify(response)
            else
                return response
        }
        catch (error) {
            console.error('error in main process')
            console.error('error', error)
            console.error('error json', JSON.stringify(error, undefined, 4))
            if (error instanceof Unauthorized)
                return JSON.stringify({ code: 403 })
            else if (error instanceof Unauthenticated)
                return JSON.stringify({ code: 401 })
            else
                return JSON.stringify({ code: 500 })
        }
    }
}
