import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { GridFSFile } from "mongodb";

export function handleRendererEvents(): RendererEvents {
    return {
        uploadFiles: async (patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('upload-files', { patientId, files })),
        retrieveFiles: async (patientId: string): Promise<MainProcessResponse<GridFSFile[]>> => JSON.parse(await ipcRenderer.invoke('retrieve-files', { patientId })),
        downloadFile: async (patientId: string, fileName: string): Promise<MainProcessResponse<string>> => JSON.parse(await ipcRenderer.invoke('download-file', { patientId, fileName })),
        downloadFiles: async (patientId: string): Promise<MainProcessResponse<string[]>> => JSON.parse(await ipcRenderer.invoke('download-files', { patientId })),
        openFile: async (fileId: string): Promise<MainProcessResponse<void>> => JSON.parse(await ipcRenderer.invoke('open-file', { fileId })),
        deleteFiles: async (patientId: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-files', { patientId })),
        deleteFile: async (fileId: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-file', { fileId })),
    }
}

export type RendererEvents = {
    uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<MainProcessResponse<boolean>>,
    retrieveFiles(patientId: string): Promise<MainProcessResponse<GridFSFile[]>>,
    downloadFile(patientId: string, fileName: string): Promise<MainProcessResponse<string>>,
    downloadFiles(patientId: string): Promise<MainProcessResponse<string[]>>,
    openFile(fileId: string): Promise<MainProcessResponse<void>>,
    deleteFiles(patientId: string): Promise<MainProcessResponse<boolean>>,
    deleteFile(fileId: string): Promise<MainProcessResponse<boolean>>,
}
