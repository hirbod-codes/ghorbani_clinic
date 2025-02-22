import { DeleteResult, GridFSFile, InsertOneResult, ObjectId } from "mongodb";
import { ICanvasRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { ipcMain, shell } from "electron";
import { authRepository, privilegesRepository } from "../../main";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { resources } from "../Auth/resources";
import path from "path";
import fs from 'fs';
import { Canvas, canvasSchema, readableFields } from "../../Models/Canvas";
import { DOWNLOADS_DIRECTORY } from "../../../../directories";
import { toByteArray, fromByteArray } from 'base64-js';
import { extractKeys, extractKeysRecursive } from "../../helpers";
import { getFields } from "../../Models/helpers";

export class CanvasRepository extends MongoDB implements ICanvasRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-canvas', async (_e, { canvas }: { canvas: Canvas; }) => await this.handleErrors(async () => await this.uploadCanvas(canvas)))
        ipcMain.handle('get-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.getCanvas(id)))
        // ipcMain.handle('download-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.downloadCanvas(id)))
        // ipcMain.handle('download-canvases', async (_e, { ids }: { ids: string[] }) => await this.handleErrors(async () => await this.downloadCanvases(ids)))
        // ipcMain.handle('open-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.openCanvas(id)))
        ipcMain.handle('delete-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteCanvas(id)))
    }

    async uploadCanvas(canvas: Canvas): Promise<InsertOneResult> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).create(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        if (!canvasSchema.isValidSync(canvas))
            throw new Error('invalid canvas provided')

        canvas = canvasSchema.cast(canvas)

        canvas.schemaVersion = 'v0.0.1';

        console.log('uploading...', { canvas });

        return await (await this.getCanvasCollection()).insertOne(canvas)
    }

    async getCanvas(id: string): Promise<Canvas> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        if (!id || !ObjectId.isValid(id))
            throw new Error('Invalid id provided')

        console.log('retrieving...');
        const canvas = await (await this.getCanvasCollection()).findOne({ _id: new ObjectId(id) })

        return extractKeys(canvas, getFields(readableFields, privileges.can(authenticated.roleName).read(resources.CANVAS).attributes));
    }

    // downloadCanvas(id: string): Promise<Canvas | null> {
    //     return new Promise(async (res, rej) => {
    //         const authenticated = await authRepository.getAuthenticatedUser()
    //         if (authenticated == null)
    //             throw new Unauthenticated();

    //         const privileges = await privilegesRepository.getAccessControl();
    //         const permission = privileges.can(authenticated.roleName).read(resources.FILE);
    //         if (!permission.granted)
    //             throw new Unauthorized()

    //         if (!id || !ObjectId.isValid(id))
    //             throw new Error('Invalid id provided')

    //         console.log('downloadCanvas', { id });

    //         const bucket = await this.getCanvasCollection();

    //         const f = await bucket.find({ _id: new ObjectId(id) }).toArray();
    //         console.log('downloadCanvas', 'found', f);
    //         if (f.length === 0) {
    //             res(null);
    //             return
    //         }

    //         if (!fs.existsSync(DOWNLOADS_DIRECTORY))
    //             fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

    //         const filePath = path.join(DOWNLOADS_DIRECTORY, f[0]._id.toString() + f[0]._id.toString());
    //         console.log('downloadCanvas', 'filePath', filePath);

    //         console.log('downloadCanvas', 'downloading...');
    //         const chunks: Buffer[] = []
    //         bucket.openDownloadStream(f[0]._id)
    //             .on('data', (chunk: Buffer) => {
    //                 console.log('chunk', typeof chunk, chunk)
    //                 chunks.push(chunk)
    //             })
    //             .on('end', () => {
    //                 res({ ...f[0].metadata as any, data: fromByteArray(Buffer.concat(chunks)) })
    //                 console.log('downloadCanvas', 'finished downloading.')
    //             })
    //             .on('error', (err) => {
    //                 console.error(err)
    //                 rej(err)
    //             })
    //     })
    // }

    // async downloadCanvases(ids: string[]): Promise<Canvas[]> {
    //     const files: Canvas[] = []
    //     for (const id of ids) {
    //         let canvas = await this.downloadCanvas(id)
    //         if (canvas !== undefined && canvas !== null)
    //             files.push(canvas)
    //     }

    //     return files
    // }

    // async openCanvas(id: string): Promise<void> {
    //     const authenticated = await authRepository.getAuthenticatedUser()
    //     if (authenticated == null)
    //         throw new Unauthenticated();

    //     const privileges = await privilegesRepository.getAccessControl();
    //     const permission = privileges.can(authenticated.roleName).read(resources.FILE);
    //     if (!permission.granted)
    //         throw new Unauthorized()

    //     if (!id || !ObjectId.isValid(id))
    //         throw new Error('Invalid id provided')

    //     console.log('opening...');
    //     const bucket = await this.getCanvasCollection();

    //     const f = await bucket.find({ _id: new ObjectId(id) }).toArray();
    //     if (f.length === 0)
    //         return;

    //     console.log('found files', f.length);

    //     if (!fs.existsSync(DOWNLOADS_DIRECTORY))
    //         fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

    //     const filePath = path.join(DOWNLOADS_DIRECTORY, f[0]._id.toString() + f[0].filename);

    //     bucket.openDownloadStream(f[0]._id)
    //         .on('end', async () => {
    //             if (process.platform == 'darwin')
    //                 console.log('shell result', await shell.openExternal('file://' + filePath));

    //             else
    //                 console.log('shell result', await shell.openPath(filePath));
    //         })
    //         .pipe(fs.createWriteStream(filePath, { encoding: 'base64' }), { end: true })

    //     console.log('finished opening.');
    //     return;
    // }

    async deleteCanvas(id: string): Promise<DeleteResult> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).delete(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        if (!id || !ObjectId.isValid(id))
            throw new Error('Invalid id provided');

        return (await this.getCanvasCollection()).deleteOne(new ObjectId(id));
    }
}
