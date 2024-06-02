import { app, ipcMain, shell } from "electron";
import { MongodbConfig, readConfig, writeConfig } from "../../Config/config";
import { Db, GridFSBucket, MongoClient, ObjectId } from "mongodb";
import { patientSchema, type Patient } from "./Models/Patient";
import path from 'path'
import fs from 'fs'
import { Visit } from "./Models/Visit";
import { array } from "yup";
import type { dbAPI } from "./renderer/dbAPI";

class MongoDB implements dbAPI {
    private static isInitialized = false

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

        if (!(await db.listCollections().toArray()).map(e => e.name).includes('patients'))
            await db.createCollection('patients')

        const indexes = await db.collection('patients').indexes()

        if (indexes.find(i => i.name === 'unique-socialId') === undefined)
            await db.createIndex('patients', { socialId: 1 }, { unique: true, name: 'unique-socialId' })

        if (indexes.find(i => i.name === 'visit-dues') === undefined)
            await db.createIndex('patients', { visitDues: 1 }, { name: 'visit-dues' })

        if (indexes.find(i => i.name === 'created-at') === undefined)
            await db.createIndex('patients', { createdAt: 1 }, { name: 'created-at' })

        if (indexes.find(i => i.name === 'updated-at') === undefined)
            await db.createIndex('patients', { updatedAt: 1 }, { name: 'updated-at' })
    }

    private async addVisitsCollection() {
        const db = await this.getDb();

        if (!(await db.listCollections().toArray()).map(e => e.name).includes('visits'))
            await db.createCollection('visits')

        const indexes = await db.collection('visits').indexes()

        if (indexes.find(i => i.name === 'unique-patientId') === undefined)
            await db.createIndex('visits', { patientId: 1 }, { unique: true, name: 'unique-patientId' })

        if (indexes.find(i => i.name === 'due') === undefined)
            await db.createIndex('visits', { due: 1 }, { name: 'due' })
    }

    //////////////////////////////////////////////////////////////////////////////////////////// Patients

    private async getPatientsCollection() {
        return (await this.getDb()).collection<Patient>('patients')
    }

    /**
     * 
     * @param patient 
     * @returns The id of the created patient
     */
    async createPatient(patient: Patient): Promise<string> {
        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.')
        patient = patientSchema.cast(patient)
        return (await (await this.getPatientsCollection()).insertOne(patient)).insertedId.toString()
    }

    /**
     * 
     * @param socialId 
     * @returns json string of Patient
     */
    async getPatient(socialId: string): Promise<string | null> {
        let patient: Patient = await (await this.getPatientsCollection()).findOne({ socialId: socialId })
        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.')

        patient = patientSchema.cast(patient)
        return JSON.stringify(patient)
    }

    async updatePatient(patient: Patient): Promise<boolean> {
        return (await (await this.getPatientsCollection()).replaceOne({ _id: patient._id }, patient)).matchedCount === 1
    }

    async deletePatient(id: string): Promise<boolean> {
        return (await (await this.getPatientsCollection()).deleteOne({ _id: id })).deletedCount === 1
    }

    //////////////////////////////////////////////////////////////////////////////////////////// Visits

    async getVisitsCollection() {
        return (await this.getDb()).collection<Visit>('visits')
    }

    async createVisit(visit: Visit): Promise<string> {
        if (!patientSchema.isValidSync(visit))
            throw new Error('Invalid visit info provided.')
        visit = patientSchema.cast(visit)
        return (await (await this.getVisitsCollection()).insertOne(visit)).insertedId.toString()
    }

    async getVisits(patientId: string): Promise<string | null> {
        let visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: patientId }).toArray()
        if (!array().required().of(patientSchema).isValidSync(visits))
            throw new Error('Invalid patient info provided.')

        visits = array().required().of(patientSchema).cast(visits)
        return JSON.stringify(visits)
    }

    async updateVisit(visit: Visit): Promise<boolean> {
        return (await (await this.getVisitsCollection()).replaceOne({ _id: visit._id }, visit)).matchedCount === 1
    }

    async deleteVisit(id: string): Promise<boolean> {
        return (await (await this.getVisitsCollection()).deleteOne({ _id: id })).deletedCount === 1
    }


    //////////////////////////////////////////////////////////////////////////////////////////// Documents

    async getBucket() {
        return new GridFSBucket(await this.getDb(), { bucketName: 'fs' });
    }

    async uploadFiles(patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean> {
        console.log('uploading...')
        console.log(patientId, files);

        const bucket = await this.getBucket()

        try {
            for (const file of files) {
                const upload = bucket.openUploadStream(file.fileName, {
                    metadata: { patientId: patientId }
                })

                upload.on('finish', function () {
                    console.log("Write Finish.")
                });

                console.log('written result', upload.write(file.bytes, () => null))

                upload.end()
            }

            console.log('finished uploading.')
            return true
        }
        catch (error) {
            console.error(error);
            return false
        }
    }

    /**
     * 
     * @param patientId 
     * @returns json string of GridFSFile[]
     */
    async retrieveFiles(patientId: string): Promise<string | null> {
        console.log('retrieving...')
        const bucket = await this.getBucket()

        try {
            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray()

            console.log('found files', f.length);
            return JSON.stringify(f)
        }
        catch (error) {
            console.error(error);
            return null
        }
    }

    /**
     * 
     * @param patientId 
     * @param fileName 
     * @returns The downloaded file's file path
     */
    async downloadFile(patientId: string, fileName: string): Promise<string | null> {
        console.log('downloading...')
        const bucket = await this.getBucket()

        try {
            const f = await bucket.find({ metadata: { patientId: patientId }, filename: fileName }).toArray()
            if (f.length === 0)
                return null

            const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', f[0]._id.toString() + f[0].filename)

            bucket.openDownloadStreamByName(f[0].filename)
                .pipe(fs.createWriteStream(filePath), { end: true })
                .close()

            console.log('finished downloading.')
            return filePath
        }
        catch (error) {
            console.error(error);
            return null
        }
    }

    /**
     * 
     * @param patientId 
     * @returns The downloaded files' paths
     */
    async downloadFiles(patientId: string): Promise<string | null> {
        console.log('downloading...')
        const bucket = await this.getBucket()

        try {
            const files: string[] = []

            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray()

            console.log('found files', f.length);

            for (const doc of f) {
                const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', doc._id.toString() + doc.filename)

                bucket.openDownloadStreamByName(doc.filename)
                    .pipe(fs.createWriteStream(filePath), { end: true })
                    .close()

                files.push(filePath)
            }

            console.log('finished downloading.')
            return JSON.stringify(files)
        }
        catch (error) {
            console.error(error);
            return null
        }
    }

    async openFile(patientId: string, fileName: string): Promise<void> {
        console.log('opening...')
        const bucket = await this.getBucket()

        try {
            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray()

            console.log('found files', f.length);

            for (const doc of f) {
                if (doc.filename !== fileName)
                    continue

                const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', doc._id.toString() + doc.filename)

                bucket.openDownloadStreamByName(doc.filename)
                    .on('end', async () => {
                        if (process.platform == 'darwin')
                            console.log('shell result', await shell.openExternal('file://' + filePath))
                        else
                            console.log('shell result', await shell.openPath(filePath))
                    })
                    .pipe(fs.createWriteStream(filePath), { end: true })

                console.log('finished opening.')
                return;
            }
        }
        catch (error) {
            console.error(error);
            return null
        }
    }

    async deleteFiles(patientId: string): Promise<boolean> {
        const bucket = await this.getBucket()

        try {
            const cursor = bucket.find({ 'metadata.patientId': patientId })

            for await (const doc of cursor)
                await bucket.delete(new ObjectId(doc._id))

            return true
        }
        catch (error) {
            console.error(error);
            return false
        }
    }
}

export async function handleDbEvents() {
    const db = new MongoDB()

    await db.initializeDb()

    ipcMain.handle('get-config', async () => {
        return await db.getConfig()
    })

    ipcMain.handle('update-config', async (_e, { config }: { config: MongodbConfig }) => {
        return await db.updateConfig(config) != null
    })

    ipcMain.handle('create-patient', async (_e, { patient }: { patient: Patient }) => {
        return await db.createPatient(patient)
    })

    ipcMain.handle('get-patient', async (_e, { socialId }: { socialId: string }) => {
        return await db.getPatient(socialId)
    })

    ipcMain.handle('update-patient', async (_e, { patient }: { patient: Patient }) => {
        return await db.updatePatient(patient)
    })

    ipcMain.handle('delete-patient', async (_e, { id }: { id: string }) => {
        return await db.deletePatient(id)
    })

    ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => {
        return await db.createVisit(visit)
    })

    ipcMain.handle('get-visits', async (_e, { patientId }: { patientId: string }) => {
        return await db.getVisits(patientId)
    })

    ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => {
        return await db.updateVisit(visit)
    })

    ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => {
        return await db.deleteVisit(id)
    })

    ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => {
        return await db.uploadFiles(patientId, files)
    })

    ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => {
        return await db.retrieveFiles(patientId)
    })

    ipcMain.handle('download-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => {
        return await db.downloadFile(patientId, fileName)
    })

    ipcMain.handle('download-files', async (_e, { patientId }: { patientId: string }) => {
        return await db.downloadFiles(patientId)
    })

    ipcMain.handle('open-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => {
        return await db.openFile(patientId, fileName)
    })

    ipcMain.handle('delete-file', async (_e, { fileId }: { fileId: string }) => {
        return await db.deleteFiles(fileId)
    })
}
