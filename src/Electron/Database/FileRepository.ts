import { app, ipcMain, ipcRenderer, shell } from "electron";
import { ObjectId } from "mongodb";
import path from 'path';
import fs from 'fs';
import { MongoDB } from "./mongodb";
import type { IFileRepository } from "./dbAPI";
import { Unauthorized } from "./Unauthorized";
import { Auth } from "../Auth/auth-types";
import { collectionName, getPrivileges } from "./Models/File";

export class FileRepository extends MongoDB implements IFileRepository {
    async uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<boolean> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`create.${collectionName}`))
            throw new Unauthorized();

        console.log('uploading...');
        console.log(patientId, files);

        const bucket = await this.getBucket();

        try {
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
        catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     *
     * @param patientId
     * @returns json string of GridFSFile[]
     */
    async retrieveFiles(patientId: string): Promise<string | null> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`read.${collectionName}`))
            throw new Unauthorized();

        console.log('retrieving...');
        const bucket = await this.getBucket();

        try {
            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

            console.log('found files', f.length);
            return JSON.stringify(f);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     *
     * @param patientId
     * @param fileName
     * @returns The downloaded file's file path
     */
    async downloadFile(patientId: string, fileName: string): Promise<string | null> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`download.${collectionName}`))
            throw new Unauthorized();

        console.log('downloading...');
        const bucket = await this.getBucket();

        try {
            const f = await bucket.find({ metadata: { patientId: patientId }, filename: fileName }).toArray();
            if (f.length === 0)
                return null;

            const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', f[0]._id.toString() + f[0].filename);

            bucket.openDownloadStreamByName(f[0].filename)
                .pipe(fs.createWriteStream(filePath), { end: true })
                .close();

            console.log('finished downloading.');
            return filePath;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     *
     * @param patientId
     * @returns The downloaded files' paths
     */
    async downloadFiles(patientId: string): Promise<string | null> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`download.${collectionName}`))
            throw new Unauthorized();

        console.log('downloading...');
        const bucket = await this.getBucket();

        try {
            const files: string[] = [];

            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

            console.log('found files', f.length);

            for (const doc of f) {
                const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', doc._id.toString() + doc.filename);

                bucket.openDownloadStreamByName(doc.filename)
                    .pipe(fs.createWriteStream(filePath), { end: true })
                    .close();

                files.push(filePath);
            }

            console.log('finished downloading.');
            return JSON.stringify(files);
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }

    async openFile(patientId: string, fileName: string): Promise<void> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`open.${collectionName}`))
            throw new Unauthorized();

        console.log('opening...');
        const bucket = await this.getBucket();

        try {
            const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();

            console.log('found files', f.length);

            for (const doc of f) {
                if (doc.filename !== fileName)
                    continue;

                const filePath = path.join(app.getAppPath(), 'tmp', 'downloads', doc._id.toString() + doc.filename);

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
        catch (error) {
            console.error(error);
            return null;
        }
    }

    async deleteFiles(patientId: string): Promise<boolean> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`delete.${collectionName}`))
            throw new Unauthorized();

        const bucket = await this.getBucket();

        try {
            const cursor = bucket.find({ 'metadata.patientId': patientId });

            for await (const doc of cursor)
                await bucket.delete(new ObjectId(doc._id));

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    static handleRendererEvents() {
        return {
            uploadFiles: async (patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean> => JSON.parse(await ipcRenderer.invoke('upload-files', { patientId, files })),
            retrieveFiles: async (patientId: string): Promise<string | null> => JSON.parse(await ipcRenderer.invoke('retrieve-files', { patientId })),
            downloadFile: async (patientId: string, fileName: string): Promise<string | null> => JSON.parse(await ipcRenderer.invoke('download-file', { patientId, fileName })),
            downloadFiles: async (patientId: string): Promise<string | null> => JSON.parse(await ipcRenderer.invoke('download-files', { patientId })),
            openFile: async (patientId: string, fileName: string): Promise<void> => JSON.parse(await ipcRenderer.invoke('open-file', { patientId, fileName })),
            deleteFiles: async (patientId: string): Promise<boolean> => JSON.parse(await ipcRenderer.invoke('delete-files', { patientId })),
        }
    }

    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => this.handleErrors(async () => await this.uploadFiles(patientId, files)))
        ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => this.handleErrors(async () => await this.retrieveFiles(patientId)))
        ipcMain.handle('download-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => this.handleErrors(async () => await this.downloadFile(patientId, fileName)))
        ipcMain.handle('download-files', async (_e, { patientId }: { patientId: string }) => this.handleErrors(async () => await this.downloadFiles(patientId)))
        ipcMain.handle('open-file', async (_e, { patientId, fileName }: { patientId: string, fileName: string }) => this.handleErrors(async () => await this.openFile(patientId, fileName)))
        ipcMain.handle('delete-file', async (_e, { fileId }: { fileId: string }) => this.handleErrors(async () => await this.deleteFiles(fileId)))
    }
}
