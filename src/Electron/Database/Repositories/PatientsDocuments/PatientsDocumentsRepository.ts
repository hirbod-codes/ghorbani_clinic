import { app, ipcMain, shell } from "electron";
import { GridFSFile, ObjectId } from "mongodb";
import path from 'path';
import fs from 'fs';
import { MongoDB } from "../../mongodb";
import type { IPatientsDocumentsRepository } from "../../dbAPI";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { resources } from "../Auth/resources";
import { authRepository, privilegesRepository } from "../../main";
import { DOWNLOADS_DIRECTORY } from "../../../../directories";

export class PatientsDocumentsRepository extends MongoDB implements IPatientsDocumentsRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => await this.handleErrors(async () => await this.uploadFiles(patientId, files)))
        ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.retrieveFiles(patientId)))
        ipcMain.handle('download-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => await this.handleErrors(async () => await this.downloadFile(patientId, fileName)))
        ipcMain.handle('download-files', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.downloadFiles(patientId)))
        ipcMain.handle('open-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => await this.handleErrors(async () => await this.openFile(patientId, fileName)))
        ipcMain.handle('delete-file', async (_e, { fileId }: { fileId: string }) => await this.handleErrors(async () => await this.deleteFiles(fileId)))
    }

    async uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).create(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('uploading...');
        console.log(patientId, files);

        const bucket = await this.getPatientsDocumentsBucket();

        for (const file of files) {
            const upload = bucket.openUploadStream(file.fileName, {
                metadata: { patientId: patientId }
            });

            upload.on('finish', function () {
                console.log("Write Finish.");
            });

            console.log('written result', upload.write(file.bytes, () => null));

            upload.end();
        }

        console.log('finished uploading.');
        return true;
    }

    async retrieveFiles(patientId: string): Promise<GridFSFile[]> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('retrieving...');
        const bucket = await this.getPatientsDocumentsBucket();

        const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

        console.log('found files', f.length);
        return f
    }

    async downloadFile(patientId: string, fileName: string): Promise<string> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('downloading...');
        const bucket = await this.getPatientsDocumentsBucket();

        const f = await bucket.find({ metadata: { patientId: patientId }, filename: fileName }).toArray();
        if (f.length === 0)
            return null;

        if (!fs.existsSync(DOWNLOADS_DIRECTORY))
            fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

        const filePath = path.join(DOWNLOADS_DIRECTORY, f[0]._id.toString() + f[0].filename);
        console.log('downloadFile', 'filePath', filePath);

        bucket.openDownloadStreamByName(f[0].filename)
            .pipe(fs.createWriteStream(filePath), { end: true })
            .close()

        console.log('finished downloading.')
        return filePath
    }

    async downloadFiles(patientId: string): Promise<string[]> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('downloading...');
        const bucket = await this.getPatientsDocumentsBucket();

        const files: string[] = [];

        const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

        console.log('found files', f.length);

        if (!fs.existsSync(DOWNLOADS_DIRECTORY))
            fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

        for (const doc of f) {
            const filePath = path.join(DOWNLOADS_DIRECTORY, doc._id.toString() + doc.filename);
            console.log('downloadFile', 'filePath', filePath);

            bucket.openDownloadStreamByName(doc.filename)
                .pipe(fs.createWriteStream(filePath), { end: true })
                .close();

            files.push(filePath);
        }

        console.log('finished downloading.');
        return files
    }

    async openFile(patientId: string, fileName: string): Promise<void> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('opening...');
        const bucket = await this.getPatientsDocumentsBucket();

        const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

        console.log('found files', f.length);

        if (!fs.existsSync(DOWNLOADS_DIRECTORY))
            fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

        for (const doc of f) {
            if (doc.filename !== fileName)
                continue;

            const filePath = path.join(DOWNLOADS_DIRECTORY, doc._id.toString() + doc.filename);
            console.log('downloadFile', 'filePath', filePath);

            bucket.openDownloadStreamByName(doc.filename)
                .on('end', async () => {
                    if (process.platform == 'darwin')
                        console.log('shell result', await shell.openExternal('file://' + filePath));

                    else
                        console.log('shell result', await shell.openPath(filePath));
                })
                .pipe(fs.createWriteStream(filePath), { end: true });

            console.log('finished opening.');
            return;
        }
    }

    async deleteFiles(patientId: string): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).delete(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        const bucket = await this.getPatientsDocumentsBucket();

        const cursor = bucket.find({ 'metadata.patientId': patientId });

        for await (const doc of cursor)
            await bucket.delete(new ObjectId(doc._id));

        return true;
    }
}
