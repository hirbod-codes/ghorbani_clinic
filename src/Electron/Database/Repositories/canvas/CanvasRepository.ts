import { GridFSFile, ObjectId } from "mongodb";
import { ICanvasRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { app, ipcMain, shell } from "electron";
import { authRepository, privilegesRepository } from "../../handleDbEvents";
import { Unauthenticated } from "../../Unauthenticated";
import { Unauthorized } from "../../Unauthorized";
import { resources } from "../Auth/resources";
import path from "path";
import fs from 'fs';
import { Canvas, canvasSchema } from "../../Models/Canvas";

export class CanvasRepository extends MongoDB implements ICanvasRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-canvas', async (_e, { canvas }: { canvas: Canvas }) => await this.handleErrors(async () => await this.uploadCanvas(canvas)))
        ipcMain.handle('retrieve-canvases', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.retrieveCanvases(id)))
        ipcMain.handle('download-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.downloadCanvas(id)))
        ipcMain.handle('download-canvases', async (_e, { ids }: { ids: string[] }) => await this.handleErrors(async () => await this.downloadCanvases(ids)))
        ipcMain.handle('open-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.openCanvas(id)))
        ipcMain.handle('delete-canvases', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteCanvases(id)))
    }

    uploadCanvas(canvas: Canvas): Promise<string> {
        return new Promise(async (res, rej) => {
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

            console.log('uploading...', { canvas });

            const bucket = await this.getCanvasBucket();

            const id = (new ObjectId()).toString()
            const upload = bucket.openUploadStream(id, { metadata: { colorSpace: canvas.colorSpace, width: canvas.width, height: canvas.height } });

            upload.on('finish', () => {
                console.log("Upload Finish.");
            });

            upload.write(canvas.data, (err) => {
                if (err)
                    rej(err)

                console.log('finished uploading.');

                upload.end()
                res(id)
            })
        })
    }

    async retrieveCanvases(id: string): Promise<GridFSFile[]> {
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
        const bucket = await this.getCanvasBucket();

        const f = await bucket.find({ _id: new ObjectId(id) }).toArray();

        console.log('found files', f.length);
        return f
    }

    downloadCanvas(id: string): Promise<Canvas> {
        return new Promise(async (res, rej) => {
            const authenticated = await authRepository.getAuthenticatedUser()
            if (authenticated == null)
                throw new Unauthenticated();

            const privileges = await privilegesRepository.getAccessControl();
            const permission = privileges.can(authenticated.roleName).read(resources.FILE);
            if (!permission.granted)
                throw new Unauthorized()

            if (!id || !ObjectId.isValid(id))
                throw new Error('Invalid id provided')

            const bucket = await this.getCanvasBucket();

            const f = await bucket.find({ _id: new ObjectId(id) }).toArray();
            console.log('downloadCanvas', 'found', f);
            if (f.length === 0) {
                res(null);
                return
            }

            const folderPath = path.join(app.getPath('appData'), app.getName(), 'tmp', 'downloads')
            if (!fs.existsSync(folderPath))
                fs.mkdirSync(folderPath, { recursive: true })

            const filePath = path.join(folderPath, f[0]._id.toString() + f[0].filename);
            console.log('downloadCanvas', 'filePath', filePath);

            console.log('downloadCanvas', 'downloading...');
            const readable = bucket.openDownloadStreamByName(f[0].filename)

            const chunks: any[] = []
            readable.on('readable', () => {
                let chunk = readable.read();
                while (chunk !== null) {
                    chunks.push(chunk);
                }
            })
                // .pipe(fs.createWriteStream(filePath), { end: true })
                .on('end', () => {
                    const data = Uint8ClampedArray.from(chunks)
                    console.log('downloadCanvas', 'data', data)

                    res({ colorSpace: f[0].metadata.colorSpace, width: f[0].metadata.width, height: f[0].metadata.height, data })
                    console.log('downloadCanvas', 'finished downloading.')
                })
                .on('error', (err) => {
                    if (err)
                        rej(err)
                });
        })
    }

    async downloadCanvases(ids: string[]): Promise<Canvas[]> {
        const files: Canvas[] = []
        ids.forEach(async (id) => {
            files.push(await this.downloadCanvas(id))
        });

        return files
    }

    async openCanvas(id: string): Promise<void> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        if (!id || !ObjectId.isValid(id))
            throw new Error('Invalid id provided')

        console.log('opening...');
        const bucket = await this.getCanvasBucket();

        const f = await bucket.find({ _id: new ObjectId(id) }).toArray();
        if (f.length === 0)
            return null;

        console.log('found files', f.length);

        const folderPath = path.join(app.getPath('appData'), app.getName(), 'tmp', 'downloads')
        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true })

        const filePath = path.join(folderPath, f[0]._id.toString() + f[0].filename);

        bucket.openDownloadStreamByName(f[0].filename)
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

    async deleteCanvases(id: string): Promise<boolean> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).delete(resources.FILE);
        if (!permission.granted)
            throw new Unauthorized()

        if (!id || !ObjectId.isValid(id))
            throw new Error('Invalid id provided')

        const bucket = await this.getCanvasBucket();

        const cursor = bucket.find({ _id: new ObjectId(id) });

        for await (const doc of cursor)
            await bucket.delete(new ObjectId(doc._id));

        return true;
    }
}
