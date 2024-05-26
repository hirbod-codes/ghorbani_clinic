import { app, ipcMain, shell } from "electron";
import { MongodbConfig, readConfig, writeConfig } from "../../Config/config";
import { Db, GridFSBucket, MongoClient, ObjectId } from "mongodb";
import type { Patient } from "./Models/Patient";
import path from 'path'
import fs from 'fs'

function getConfig(): MongodbConfig {
    return readConfig().mongodb
}

function updateConfig(config: MongodbConfig): MongodbConfig | null {
    try {
        const c = readConfig()
        c.mongodb = config
        return writeConfig(c).mongodb
    } catch (error) {
        return null
    }
}

async function getDb(): Promise<Db | null> {
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

let isInitialized = false

async function initializeDb() {
    try {
        if (isInitialized)
            return
        else
            isInitialized = true

        addCollections()
    } catch (error) {
        console.error(error);
    }
}

async function addCollections() {
    await addPatientsCollection()
}

async function addPatientsCollection() {
    const db = await getDb();

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

// patients

async function getPatientsCollection() {
    return (await getDb()).collection<Patient>('patients')
}

async function createPatient(patient: Patient): Promise<string> {
    return (await (await getPatientsCollection()).insertOne(patient)).insertedId
}

async function getPatient(socialId: number): Promise<Patient | null> {
    return (await (await getPatientsCollection()).findOne({ socialId: socialId }))
}

async function updatePatient(patient: Patient): Promise<boolean> {
    return (await (await getPatientsCollection()).replaceOne({ _id: patient._id }, patient)).matchedCount === 1
}

async function deletePatient(id: string): Promise<boolean> {
    return (await (await getPatientsCollection()).deleteOne({ _id: id })).deletedCount === 1
}

// documents

async function getBucket() {
    return new GridFSBucket(await getDb(), { bucketName: 'fs' });
}

async function uploadFiles(patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean> {
    console.log('uploading...')
    console.log(patientId, files);

    const bucket = await getBucket()

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

async function retrieveFiles(patientId: string): Promise<string[] | null> {
    console.log('downloading...')
    const bucket = await getBucket()

    try {
        const files: string[] = []

        const f = await bucket.find({ metadata: { patientId: patientId } }).toArray()

        console.log('found files', f.length);

        for (const doc of f) {
            const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', doc._id.toString())

            bucket.openDownloadStreamByName(doc.filename)
                .pipe(fs.createWriteStream(filePath), { end: true })
                .close()

            files.push(filePath)
        }

        console.log('finished downloading.')
        return files
    }
    catch (error) {
        console.error(error);
        return null
    }
}

async function openFile(patientId: string, fileName: string): Promise<void> {
    console.log('opening...')
    const bucket = await getBucket()

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

async function deleteFiles(patientId: string): Promise<boolean> {
    const bucket = await getBucket()

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

export async function handleDbEvents() {
    await initializeDb()

    ipcMain.handle('get-config', () => {
        return getConfig()
    })

    ipcMain.handle('update-config', (_e, { config }: { config: MongodbConfig }) => {
        return updateConfig(config) != null
    })

    ipcMain.handle('create-patient', async (_e, { patient }: { patient: Patient }) => {
        return await createPatient(patient)
    })

    ipcMain.handle('get-patient', async (_e, { socialId }: { socialId: number }) => {
        return await getPatient(socialId)
    })

    ipcMain.handle('update-patient', async (_e, { patient }: { patient: Patient }) => {
        return await updatePatient(patient)
    })

    ipcMain.handle('delete-patient', async (_e, { id }: { id: string }) => {
        return await deletePatient(id)
    })

    ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => {
        return await uploadFiles(patientId, files)
    })

    ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => {
        return await retrieveFiles(patientId)
    })

    ipcMain.handle('open-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => {
        await openFile(patientId, fileName)
    })

    ipcMain.handle('delete-file', async (_e, { fileId }: { fileId: string }) => {
        return await deleteFiles(fileId)
    })
}
