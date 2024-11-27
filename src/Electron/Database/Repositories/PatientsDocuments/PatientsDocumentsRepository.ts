import { ipcMain, shell } from "electron";
import { GridFSFile, ObjectId } from "mongodb";
import Path from 'path';
import fs from 'fs';
import { MongoDB } from "../../mongodb";
import type { IPatientsDocumentsRepository } from "../../dbAPI";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { resources } from "../Auth/resources";
import { authRepository, privilegesRepository } from "../../main";
import { DOWNLOADS_DIRECTORY } from "../../../../directories";
import { readConfig } from "src/Electron/Configuration/main";
import { StorageHelper } from "src/Electron/StorageHelper";

export class PatientsDocumentsRepository extends MongoDB implements IPatientsDocumentsRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-files', async (_e, { patientId, files }: { patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[] }) => await this.handleErrors(async () => await this.uploadFiles(patientId, files)))
        ipcMain.handle('retrieve-files', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.retrieveFiles(patientId)))
        ipcMain.handle('download-files', async (_e, { patientId, saveDirectory, force }: { patientId: string, saveDirectory?: string, force?: boolean }) => await this.handleErrors(async () => await this.downloadFiles(patientId, saveDirectory, force)))
        ipcMain.handle('download-file', async (_e, { patientId, fileId, filename, saveDirectory, force }: { patientId: string, fileId: string, filename: string, saveDirectory?: string, force?: boolean }) => await this.handleErrors(async () => await this.downloadFile(patientId, fileId, filename, saveDirectory, force)))
        ipcMain.handle('file-exists', async (_e, { patientId, fileId, filename, saveDirectory, force }: { patientId: string, fileId: string, filename: string, saveDirectory?: string, force?: boolean }) => await this.handleErrors(async () => await this.fileExists(patientId, fileId, filename, saveDirectory)))
        ipcMain.handle('open-file', async (_e, { patientId, fileId, filename }: { patientId: string, fileId: string, filename: string }) => await this.handleErrors(async () => await this.openFile(patientId, fileId, filename)))
        ipcMain.handle('delete-files', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.deleteFiles(patientId)))
        ipcMain.handle('delete-file', async (_e, { patientId, fileId, filename }: { patientId: string, fileId: string, filename: string }) => await this.handleErrors(async () => await this.deleteFile(patientId, fileId, filename)))
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

    async downloadFiles(patientId: string, saveDirectory?: string, force = false): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('downloading files...');

        const folderPath = saveDirectory ? Path.dirname(saveDirectory) : Path.join(DOWNLOADS_DIRECTORY, patientId)
        console.log('downloadFile', 'folderPath', folderPath)

        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true })

        const bucket = await this.getPatientsDocumentsBucket();

        const files: string[] = [];

        const f = await bucket.find({ metadata: { patientId: patientId } }).toArray();
        console.log('found files', f.length);

        if (f.length === 0)
            return false

        if (force === false) {
            let shouldExit = true
            for (const doc of f)
                if (fs.existsSync(Path.join(folderPath, doc._id.toString(), doc.filename)))
                    continue
                else {
                    shouldExit = false
                    break
                }
            if (shouldExit)
                return true
        }

        const paths = []
        for (const doc of f) {
            const filePath = Path.join(folderPath, doc._id.toString(), doc.filename);
            console.log('downloadFile', 'filePath', filePath);

            paths.push(filePath)

            bucket.openDownloadStreamByName(doc.filename)
                .pipe(fs.createWriteStream(filePath), { end: true })
                .close();

            files.push(filePath);
        }

        if (!saveDirectory)
            StorageHelper.addSize(DOWNLOADS_DIRECTORY, paths)

        console.log('finished downloading.');
        return true
    }

    async fileExists(patientId: string, fileId: string, filename: string, saveDirectory?: string): Promise<boolean> {
        console.log('authenticating...');
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        console.log('authorizing...');
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        const folderPath = saveDirectory ? Path.dirname(saveDirectory) : Path.join(DOWNLOADS_DIRECTORY, patientId, fileId)
        const filePath = saveDirectory ? Path.join(saveDirectory, filename) : Path.join(folderPath, filename)
        console.log('downloadFile', 'filePath', filePath, 'folderPath', folderPath)

        return fs.existsSync(filePath)
    }

    async downloadFile(patientId: string, fileId: string, filename: string, saveDirectory?: string, force = false): Promise<boolean> {
        console.log('authenticating...');
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        console.log('authorizing...');
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('downloading file...');

        const folderPath = saveDirectory ? Path.dirname(saveDirectory) : Path.join(DOWNLOADS_DIRECTORY, patientId, fileId)
        const filePath = saveDirectory ? Path.join(saveDirectory, filename) : Path.join(folderPath, filename)
        console.log('downloadFile', 'filePath', filePath, 'folderPath', folderPath)

        if (force === false && fs.existsSync(filePath))
            return true

        if (force === false && !saveDirectory) {
            const size = readConfig()?.DownloadsDirectorySize
            if (size !== undefined && !Number.isNaN(size) && await StorageHelper.getSize(folderPath) >= size)
                return false
        }

        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true })

        const bucket = await this.getPatientsDocumentsBucket()

        const f = await bucket.find({ metadata: { patientId: patientId }, _id: new ObjectId(fileId), filename: filename }).toArray()
        if (f.length === 0)
            return false

        bucket.openDownloadStreamByName(f[0].filename)
            .pipe(fs.createWriteStream(filePath), { end: true })
            .close()

        if (!saveDirectory)
            StorageHelper.addSize(DOWNLOADS_DIRECTORY, [filePath])

        console.log('finished downloading.')
        return true
    }

    async openFile(patientId: string, fileId: string, filename: string): Promise<boolean> {
        console.log('authenticating...');
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        console.log('authorizing...');
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        console.log('opening...');

        const folderPath = Path.join(DOWNLOADS_DIRECTORY, patientId, fileId)
        const filePath = Path.join(folderPath, filename)
        console.log('openFile', 'filePath', filePath, 'folderPath', folderPath)

        if (fs.existsSync(filePath)) {
            if (process.platform == 'darwin')
                console.log('shell result', await shell.openExternal('file://' + filePath))
            else
                console.log('shell result', await shell.openPath(filePath))
        }

        if (!await this.downloadFile(patientId, fileId, filename))
            return false

        if (process.platform == 'darwin')
            console.log('shell result', await shell.openExternal('file://' + filePath))
        else
            console.log('shell result', await shell.openPath(filePath))

        console.log('finished opening.')
    }

    async deleteFiles(patientId: string): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()

        const privileges = await privilegesRepository.getAccessControl()
        const permission = privileges.can(authenticated.roleName).delete(resources.FILE)
        if (!permission.granted)
            throw new Unauthorized()

        const bucket = await this.getPatientsDocumentsBucket()

        const cursor = await bucket.find({ metadata: { patientId: patientId } }).toArray()

        const folderPath = Path.join(DOWNLOADS_DIRECTORY, patientId)
        console.log('deleteFiles', 'folderPath', folderPath)
        const paths = []
        for (const doc of cursor) {
            await bucket.delete(new ObjectId(doc._id))

            if (fs.existsSync(Path.join(folderPath, doc._id.toString(), doc.filename)))
                paths.push(Path.join(folderPath, doc._id.toString(), doc.filename))
        }

        if (paths.length > 0)
            StorageHelper.subtractSize(DOWNLOADS_DIRECTORY, paths)

        return true
    }

    async deleteFile(patientId: string, fileId: string, filename: string): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()

        const privileges = await privilegesRepository.getAccessControl()
        const permission = privileges.can(authenticated.roleName).delete(resources.FILE)
        if (!permission.granted)
            throw new Unauthorized()

        const bucket = await this.getPatientsDocumentsBucket()

        await bucket.delete(new ObjectId(fileId))

        const filePath = Path.join(DOWNLOADS_DIRECTORY, patientId, fileId, filename)
        if (fs.existsSync(filePath))
            StorageHelper.subtractSize(DOWNLOADS_DIRECTORY, [filePath])

        return true
    }
}
