import { app, ipcMain } from "electron";
import { MongodbConfig, readConfig, writeConfig } from "../../Config/config";
import { Collection, Db, GridFSBucket, MongoClient } from "mongodb";
import { type Patient, collectionName as patientsCollectionName } from "./Models/Patient";
import { Visit, collectionName as visitsCollectionName } from "./Models/Visit";
import type { dbAPI } from "./dbAPI";
import { seed } from "./seed-patients";
import { FileRepository } from "./FileRepository";
import { VisitRepository } from "./VisitRepository";
import { PatientRepository } from "./PatientRepository";
import { collectionName as filesCollectionName } from "./Models/File";

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
}

export async function handleDbEvents() {
    const db = new MongoDB()
    const patientRepository = new PatientRepository()
    const visitRepository = new VisitRepository()
    const fileRepository = new FileRepository()

    await db.initializeDb()

    ipcMain.handle('get-config', async () => await db.getConfig())
    ipcMain.handle('update-config', async (_e, { config }: { config: MongodbConfig }) => await db.updateConfig(config) != null)

    ipcMain.handle('create-patient', async (_e, { patient }: { patient: Patient }) => await patientRepository.createPatient(patient))
    ipcMain.handle('get-patient-with-visits', async (_e, { socialId }: { socialId: string }) => await patientRepository.getPatientWithVisits(socialId))
    ipcMain.handle('get-patients-with-visits', async (_e, { offset, count }: { offset: number, count: number }) => await patientRepository.getPatientsWithVisits(offset, count))
    ipcMain.handle('get-patient', async (_e, { socialId }: { socialId: string }) => await patientRepository.getPatient(socialId))
    ipcMain.handle('get-patients', async (_e, { offset, count }: { offset: number, count: number }) => await patientRepository.getPatients(offset, count))
    ipcMain.handle('update-patient', async (_e, { patient }: { patient: Patient }) => await patientRepository.updatePatient(patient))
    ipcMain.handle('delete-patient', async (_e, { id }: { id: string }) => await patientRepository.deletePatient(id))
    ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => await visitRepository.createVisit(visit))

    ipcMain.handle('get-visits', async (_e, { patientId }: { patientId: string }) => await visitRepository.getVisits(patientId))
    ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => await visitRepository.updateVisit(visit))
    ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => await visitRepository.deleteVisit(id))
    ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => await fileRepository.uploadFiles(patientId, files))

    ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => await fileRepository.retrieveFiles(patientId))
    ipcMain.handle('download-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => await fileRepository.downloadFile(patientId, fileName))
    ipcMain.handle('download-files', async (_e, { patientId }: { patientId: string }) => await fileRepository.downloadFiles(patientId))
    ipcMain.handle('open-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => await fileRepository.openFile(patientId, fileName))
    ipcMain.handle('delete-file', async (_e, { fileId }: { fileId: string }) => await fileRepository.deleteFiles(fileId))

    if (!app.isPackaged) {
        await seed(50, await db.getPatientsCollection(), await db.getVisitsCollection())
    }
}
