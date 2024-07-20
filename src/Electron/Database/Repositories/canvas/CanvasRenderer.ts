import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { GridFSFile } from "mongodb";

export function handleRendererEvents(): RendererEvents {
    return {
        uploadCanvas: async (canvas: ImageData): Promise<MainProcessResponse<string>> => JSON.parse(await ipcRenderer.invoke('upload-canvas', { canvas })),
        retrieveCanvases: async (id: string): Promise<MainProcessResponse<GridFSFile[]>> => JSON.parse(await ipcRenderer.invoke('retrieve-canvases', { id })),
        downloadCanvas: async (id: string): Promise<ImageData> => await ipcRenderer.invoke('download-canvas', { id }),
        downloadCanvases: async (ids: string[]): Promise<MainProcessResponse<ImageData[]>> => JSON.parse(await ipcRenderer.invoke('download-canvases', { ids })),
        openCanvas: async (id: string): Promise<MainProcessResponse<void>> => JSON.parse(await ipcRenderer.invoke('open-canvas', { id })),
        deleteCanvases: async (id: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('delete-canvases', { id })),

    }
}

export type RendererEvents = {
    uploadCanvas(canvas: ImageData): Promise<MainProcessResponse<string>>,
    retrieveCanvases(id: string): Promise<MainProcessResponse<GridFSFile[]>>,
    downloadCanvas(id: string): Promise<ImageData>,
    downloadCanvases(ids: string[]): Promise<MainProcessResponse<ImageData[]>>,
    openCanvas(id: string): Promise<MainProcessResponse<void>>,
    deleteCanvases(id: string): Promise<MainProcessResponse<boolean>>,
}
