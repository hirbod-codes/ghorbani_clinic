import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { GridFSFile } from "mongodb";

export function handleRendererEvents(): RendererEvents {
    return {
        uploadFiles: async (patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('upload-files', { patientId, files })),
        retrieveFiles: async (patientId: string): Promise<MainProcessResponse<GridFSFile[]>> => JSON.parse(await ipcRenderer.invoke('retrieve-files', { patientId })),
        downloadFiles: async (patientId: string, saveDirectory?: string, force?: boolean): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('download-files', { patientId, saveDirectory, force })),
        fileExists: async (patientId: string, fileId: string, filename: string, saveDirectory?: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('file-exists', { patientId, fileId, filename, saveDirectory })),
        downloadFile: async (patientId: string, fileId: string, filename: string, saveDirectory?: string, force?: boolean): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('download-file', { patientId, fileId, filename, saveDirectory, force })),
        openFile: async (patientId: string, fileId: string, filename: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('open-file', { patientId, fileId, filename })),
        deleteFiles: async (patientId: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-files', { patientId })),
        deleteFile: async (patientId: string, fileId: string, filename: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-file', { patientId, fileId, filename })),
    }
}

export type RendererEvents = {
    uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<MainProcessResponse<boolean>>,
    retrieveFiles(patientId: string): Promise<MainProcessResponse<GridFSFile[]>>,
    downloadFiles(patientId: string, saveDirectory?: string, force?: boolean): Promise<MainProcessResponse<boolean>>;
    fileExists(patientId: string, fileId: string, filename: string, saveDirectory?: string): Promise<MainProcessResponse<boolean>>;
    downloadFile(patientId: string, fileId: string, filename: string, saveDirectory?: string, force?: boolean): Promise<MainProcessResponse<boolean>>;
    openFile(patientId: string, fileId: string, filename: string): Promise<MainProcessResponse<boolean>>;
    deleteFiles(patientId: string): Promise<MainProcessResponse<boolean>>;
    deleteFile(patientId: string, fileId: string, filename: string): Promise<MainProcessResponse<boolean>>;
}
