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
import { DOWNLOADS_DIRECTORY } from "../../../../directories";
import { Stream } from "stream";

export class CanvasRepository extends MongoDB implements ICanvasRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('upload-canvas', async (_e, { fileName, canvas }: { fileName: string; canvas: Canvas; }) => await this.handleErrors(async () => await this.uploadCanvas(fileName, canvas)))
        ipcMain.handle('retrieve-canvases', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.retrieveCanvases(id)))
        ipcMain.handle('download-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.downloadCanvas(id)))
        ipcMain.handle('download-canvases', async (_e, { ids }: { ids: string[] }) => await this.handleErrors(async () => await this.downloadCanvases(ids)))
        ipcMain.handle('open-canvas', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.openCanvas(id)))
        ipcMain.handle('delete-canvases', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteCanvases(id)))
    }

    uploadCanvas(fileName: string, canvas: Canvas): Promise<string> {
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

            const upload = bucket.openUploadStream(fileName, { metadata: { colorSpace: canvas.colorSpace, width: canvas.width, height: canvas.height } });

            upload.on('finish', () => {
                console.log("Upload Finish.");
            });

            const data: Uint8ClampedArray = canvas.data as Uint8ClampedArray
            upload.write(Buffer.from(data.buffer), (err) => {
                if (err)
                    rej(err)
            })

            console.log('finished uploading.');

            upload.end()
            res(upload.id.toString())
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

            console.log('downloadCanvas', { id });

            const bucket = await this.getCanvasBucket();

            const f = await bucket.find({ _id: new ObjectId(id) }).toArray();
            console.log('downloadCanvas', 'found', f);
            if (f.length === 0) {
                res(null);
                return
            }

            if (!fs.existsSync(DOWNLOADS_DIRECTORY))
                fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

            const filePath = path.join(DOWNLOADS_DIRECTORY, f[0]._id.toString() + f[0]._id.toString());
            console.log('downloadCanvas', 'filePath', filePath);

            console.log('downloadCanvas', 'downloading...');

            bucket.openDownloadStream(f[0]._id)
                .pipe(fs.createWriteStream(filePath, { encoding: 'base64' }), { end: true })
                // .on('error', (err) => {
                //     if (err) {
                //         console.error(err)
                //         rej(err)
                //     }
                // })
                // .on('finish', () => {
                //     const data1 = Uint8ClampedArray.from(fs.readFileSync(filePath))
                //     console.log('downloadCanvas', 'data', 'finish', data1)
                //     const data = fs.readFileSync(filePath).toString('base64')
                //     console.log('downloadCanvas', 'data', 'finish', data)
                // })
                // .on('close', () => {
                //     const data1 = Uint8ClampedArray.from(fs.readFileSync(filePath))
                //     console.log('downloadCanvas', 'data', 'close', data1)
                //     const data = fs.readFileSync(filePath).toString('base64')
                //     console.log('downloadCanvas', 'data', 'close', data)

                //     res({ colorSpace: f[0].metadata.colorSpace, width: f[0].metadata.width, height: f[0].metadata.height, data })
                //     console.log('downloadCanvas', 'finished downloading.')
                // })
                .end(() => { console.log('end') })
                .close((err) => {
                    if (err) {
                        console.error(err)
                        rej(err)
                    }

                    const data0 = fs.readFileSync(filePath)
                    console.log('downloadCanvas', 'data0', data0)
                    const data = Uint8ClampedArray.from(fs.readFileSync(filePath))
                    console.log('downloadCanvas', 'data', data)

                    res({ colorSpace: f[0].metadata.colorSpace, width: f[0].metadata.width, height: f[0].metadata.height, data })
                    console.log('downloadCanvas', 'finished downloading.')
                })



            // const readable = bucket.openDownloadStreamByName(f[0].filename)

            // let chunks: any[] = []
            // readable.on('readable', () => {
            //     let chunk = readable.read();
            //     while (chunk !== null)
            //         chunks = chunks.concat(chunk)
            // })
            //     // .pipe(fs.createWriteStream(filePath), { end: true })
            //     .on('end', () => {
            //         console.log('downloadCanvas', 'chunks', chunks)

            //         const data = Uint8ClampedArray.from(chunks)
            //         console.log('downloadCanvas', 'data', data)

            //         res({ colorSpace: f[0].metadata.colorSpace, width: f[0].metadata.width, height: f[0].metadata.height, data })
            //         console.log('downloadCanvas', 'finished downloading.')
            //     })
            //     .on('error', (err) => {
            //         if (err) {
            //             console.error(err)
            //             rej(err)
            //         }
            //     });
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

        if (!fs.existsSync(DOWNLOADS_DIRECTORY))
            fs.mkdirSync(DOWNLOADS_DIRECTORY, { recursive: true })

        const filePath = path.join(DOWNLOADS_DIRECTORY, f[0]._id.toString() + f[0].filename);

        bucket.openDownloadStream(f[0]._id)
            .on('end', async () => {
                if (process.platform == 'darwin')
                    console.log('shell result', await shell.openExternal('file://' + filePath));

                else
                    console.log('shell result', await shell.openPath(filePath));
            })
            .pipe(fs.createWriteStream(filePath, { encoding: 'base64' }), { end: true })

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
