import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { DeleteResult, GridFSFile, InsertOneResult } from "mongodb";
import { Canvas } from "../../Models/Canvas";

export function handleRendererEvents(): RendererEvents {
    return {
        uploadCanvas: async (canvas: Canvas): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('upload-canvas', { canvas })),
        getCanvas: async (id: string): Promise<MainProcessResponse<Canvas>> => JSON.parse(await ipcRenderer.invoke('get-canvas', { id })),
        // downloadCanvas: async (id: string): Promise<MainProcessResponse<Canvas>> => JSON.parse(await ipcRenderer.invoke('download-canvas', { id })),
        // downloadCanvases: async (ids: string[]): Promise<MainProcessResponse<Canvas[]>> => JSON.parse(await ipcRenderer.invoke('download-canvases', { ids })),
        // openCanvas: async (id: string): Promise<MainProcessResponse<void>> => JSON.parse(await ipcRenderer.invoke('open-canvas', { id })),
        deleteCanvas: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-canvas', { id })),
    }
}

export type RendererEvents = {
    uploadCanvas(canvas: Canvas): Promise<MainProcessResponse<InsertOneResult>>,
    getCanvas(id: string): Promise<MainProcessResponse<Canvas>>,
    // downloadCanvas(id: string): Promise<MainProcessResponse<Canvas>>,
    // downloadCanvases(ids: string[]): Promise<MainProcessResponse<Canvas[]>>,
    // openCanvas(id: string): Promise<MainProcessResponse<void>>,
    deleteCanvas(id: string): Promise<MainProcessResponse<DeleteResult>>,
}
