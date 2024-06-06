import { ipcRenderer } from "electron"
import { Visit } from "../Models/Visit"
import type { MainProcessResponse } from "../../types"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"

export function handleRendererEvents(): handleRendererEvents {
    return {
        createVisit: async (visit: Visit): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-visit', { visit })),
        getVisits: async (patientId: string): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-visits', { patientId })),
        updateVisit: async (visit: Visit): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-visit', { visit })),
        deleteVisit: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-visit', { id })),
    }
}

export type handleRendererEvents = {
    createVisit: (visit: Visit) => Promise<MainProcessResponse<InsertOneResult>>
    getVisits: (patientId: string) => Promise<MainProcessResponse<Visit[]>>
    updateVisit: (visit: Visit) => Promise<MainProcessResponse<UpdateResult>>
    deleteVisit: (id: string) => Promise<MainProcessResponse<DeleteResult>>
}