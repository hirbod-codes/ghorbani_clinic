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
import { Unauthorized } from "./Exceptions/Unauthorized";
import { Unauthenticated } from "./Exceptions/Unauthenticated";
import { MongodbConfig, readConfig, writeConfigSync } from "../Configuration/main";
import { Privilege } from "./Models/Privilege";
import { User } from "./Models/User";
import { bonjour } from '../BonjourService';
import { Service } from 'bonjour-service'
import { seed } from "./Seed/seed";
import { ConfigurationError } from "../Configuration/Exceptions/ConfigurationError";
import { ConnectionError } from "./Exceptions/ConnectionError";
import { authRepository, privilegesRepository } from "./main";
import { resources } from "./Repositories/Auth/resources";
import { BadRequest } from "./Exceptions/BadRequest";

export class MongoDB implements dbAPI {
    private static db: Db | null = null

    async handleEvents(): Promise<void> {
        ipcMain.handle('truncate', async () => await this.truncate())
        ipcMain.handle('seed', async () => await this.seed())
        ipcMain.handle('initialize-db', async () => await this.initializeDb())
        ipcMain.handle('get-config', async () => await this.getConfig())
        ipcMain.handle('update-config', async (_e, { config }: { config: MongodbConfig }) => await this.updateConfig(config))
        ipcMain.handle('search-for-db-service', async (_e, { databaseName, supportsTransaction = false, auth }: { databaseName?: string, supportsTransaction: boolean, auth?: { username: string, password: string } }) => await this.searchForDbService(databaseName, supportsTransaction, auth))
    }

    async getConfig(): Promise<MongodbConfig> {
        return readConfig().mongodb
    }

    protected transactionClient: MongoClient | undefined = undefined
    protected session: ClientSession | undefined = undefined

    async startTransaction(): Promise<void> {
        const funcName = 'startTransaction'

        console.log(funcName, 'called')

        const supportsTransaction = readConfig().mongodb.supportsTransaction
        if (!supportsTransaction) {
            console.log(funcName, 'Transactions are not supported.')
            return
        }

        this.transactionClient = await this.getClient()
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
        console.group('updateConfig')

        try {
            console.log({ config })

            const c = readConfig()
            c.mongodb = config

            writeConfigSync(c)

            if (config.url.includes('localhost') || config.url.includes('127.0.0.1') || config.url.includes('0.0.0.0'))
                bonjour.unpublishAll(() => {
                    console.log('bonjour service unpublished all of the previous services.')

                    bonjour.publish({ name: 'clinic-db', type: 'mongodb', protocol: 'tcp', port: Number(c.mongodb.url.split('://')[1]?.split(':')[1]), disableIPv6: true })
                    console.log('new bonjour service has published.')
                })

            return readConfig()?.mongodb != null
        } catch (error) {
            console.error(error)
            return false
        } finally {
            console.groupEnd()
        }
    }

    async searchForDbService(databaseName?: string, supportsTransaction: boolean = false, auth?: { username: string, password: string }): Promise<boolean> {
        return new Promise((resolve, reject) => {
            console.group('searchForDbService')

            try {
                const browser = bonjour.findOne({ type: 'mongodb', name: 'clinic-db', protocol: 'tcp' }, 10000, () => {
                    console.log('times out')
                    resolve(false)
                })

                browser.on('up', (s: Service) => {
                    console.log('found service')

                    const c = readConfig()
                    writeConfigSync({
                        ...c,
                        mongodb: {
                            url: `mongodb://${s.referer.address}:${s.port}`,
                            databaseName: databaseName ?? 'primaryDb',
                            supportsTransaction: supportsTransaction,
                            auth
                        }
                    })

                    resolve(true)
                })
            } catch (error) {
                console.error(error)
                resolve(false)
            } finally {
                console.groupEnd()
            }
        })
    }

    async getClient(): Promise<MongoClient> {
        console.group('getClient')

        try {
            const c = readConfig()

            if (!c || !c.mongodb)
                throw new Error('Mongodb configuration not found.')

            const client = new MongoClient(c.mongodb.url, {
                directConnection: true,
                authMechanism: "DEFAULT",
                auth: c.mongodb.auth
                    ? {
                        username: c.mongodb.auth.username,
                        password: c.mongodb.auth.password,
                    }
                    : undefined
            })

            await client.connect()

            return client
        } catch (error) {
            console.error(error)

            if (error instanceof ConfigurationError)
                throw error
            else
                throw new ConnectionError()
        } finally {
            console.groupEnd()
        }
    }

    async getDb(client?: MongoClient, useCache = true): Promise<Db | null> {
        console.group('getDb')

        try {
            if (useCache)
                return MongoDB.db

            const c = readConfig()

            if (!c || !c.mongodb)
                throw new ConfigurationError()

            let db
            if (!client) {
                client = await this.getClient()
                db = client.db(c.mongodb.databaseName)
            }
            else
                db = client.db(c.mongodb.databaseName)

            MongoDB.db = db

            try {
                const pingResult = await db.command({ ping: 1 })

                console.log({ pingResult })
            } catch (error) {
                console.error(error);
                await client?.close()
                throw error
            }

            return db
        } finally {
            console.groupEnd()
        }
    }

    async truncate(): Promise<boolean> {
        try {
            const user = await authRepository.getAuthenticatedUser()
            if (!user)
                throw new Unauthenticated();

            if (!(await privilegesRepository.getAccessControl()).can(user.roleName).create(resources.DB).granted)
                throw new Unauthorized()

            const db = await this.getDb()
            return db.dropDatabase()
        } catch (error) {
            console.error(error);
            return false
        }
    }

    async seed(): Promise<boolean> {
        try {
            console.group('seed')

            let db
            try { db = await this.getDb() }
            catch (err) { }

            console.log({ db })

            if (db && (await (await this.getPatientsCollection(undefined, db)).estimatedDocumentCount()) > 0) {
                const user = await authRepository.getAuthenticatedUser()
                if (!user)
                    throw new Unauthenticated();

                if (!(await privilegesRepository.getAccessControl()).can(user.roleName).create(resources.DB).granted)
                    throw new Unauthorized()

                console.log({ user })
            }

            return await seed()
        } catch (error) {
            console.error(error);
            return false
        } finally {
            console.groupEnd()
        }
    }

    async initializeDb(): Promise<boolean> {
        try {
            await this.getDb(undefined, false)
            await this.addCollections()
            return true
        } catch (error) {
            console.error(error);
            return false
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

        if (indexes.find(i => i.name === 'name') === undefined)
            await db.createIndex(patientsMedicalHistoriesCollectionName, { name: 'text' }, { name: 'name' })
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
            if (error instanceof BadRequest)
                return JSON.stringify({ code: 400 })
            else if (error instanceof Unauthorized)
                return JSON.stringify({ code: 403 })
            else if (error instanceof Unauthenticated)
                return JSON.stringify({ code: 401 })
            else if (error instanceof ConnectionError)
                return JSON.stringify({ code: 500, message: 'ConnectionError' })
            else if (error instanceof ConfigurationError)
                return JSON.stringify({ code: 500, message: 'ConfigurationError' })
            else
                return JSON.stringify({ code: 500 })
        }
    }
}
