import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { GridFSFile } from "mongodb";
import { Canvas } from "../../Models/Canvas";

export function handleRendererEvents(): RendererEvents {
    return {
        uploadCanvas: async (fileName: string, canvas: Canvas): Promise<MainProcessResponse<string>> => JSON.parse(await ipcRenderer.invoke('upload-canvas', { fileName, canvas })),
        retrieveCanvases: async (id: string): Promise<MainProcessResponse<GridFSFile[]>> => JSON.parse(await ipcRenderer.invoke('retrieve-canvases', { id })),
        downloadCanvas: async (id: string): Promise<MainProcessResponse<Canvas>> => JSON.parse(await ipcRenderer.invoke('download-canvas', { id })),
        downloadCanvases: async (ids: string[]): Promise<MainProcessResponse<Canvas[]>> => JSON.parse(await ipcRenderer.invoke('download-canvases', { ids })),
        openCanvas: async (id: string): Promise<MainProcessResponse<void>> => JSON.parse(await ipcRenderer.invoke('open-canvas', { id })),
        deleteCanvases: async (id: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-canvases', { id })),

    }
}

export type RendererEvents = {
    uploadCanvas(fileName: string, canvas: Canvas): Promise<MainProcessResponse<string>>,
    retrieveCanvases(id: string): Promise<MainProcessResponse<GridFSFile[]>>,
    downloadCanvas(id: string): Promise<MainProcessResponse<Canvas>>,
    downloadCanvases(ids: string[]): Promise<MainProcessResponse<Canvas[]>>,
    openCanvas(id: string): Promise<MainProcessResponse<void>>,
    deleteCanvases(id: string): Promise<MainProcessResponse<boolean>>,
}
