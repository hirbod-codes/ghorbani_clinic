import { ipcRenderer } from "electron"
import { Visit } from "../../Models/Visit"
import type { MainProcessResponse } from "../../../types"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"

export function handleRendererEvents(): RendererEvents {
    return {
        createVisit: async (visit: Visit): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-visit', { visit })),
        getVisitsEstimatedCount: async (): Promise<MainProcessResponse<number>> => JSON.parse(await ipcRenderer.invoke('get-visits-estimated-count')),
        getExpiredVisitsCount: async (): Promise<MainProcessResponse<number>> => JSON.parse(await ipcRenderer.invoke('get-expired-visits-count')),
        getExpiredVisits: async (): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-expired-visits')),
        getVisitsByDate: async (startDate: number, endDate: number): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-visits-by-date', { startDate, endDate })),
        getVisitsByPatientId: async (patientId: string): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-visits-by-patient-id', { patientId })),
        getVisits: async (offset: number, count: number): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-visits', { offset, count })),
        updateVisit: async (visit: Visit): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-visit', { visit })),
        deleteVisit: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-visit', { id })),
    }
}

export type RendererEvents = {
    createVisit: (visit: Visit) => Promise<MainProcessResponse<InsertOneResult>>
    getVisitsEstimatedCount: () => Promise<MainProcessResponse<number>>
    getExpiredVisitsCount: () => Promise<MainProcessResponse<number>>
    getExpiredVisits: () => Promise<MainProcessResponse<Visit[]>>
    getVisitsByDate: (startDate: number, endDate: number) => Promise<MainProcessResponse<Visit[]>>
    getVisitsByPatientId: (patientId: string) => Promise<MainProcessResponse<Visit[]>>
    getVisits: (offset: number, count: number) => Promise<MainProcessResponse<Visit[]>>
    updateVisit: (visit: Visit) => Promise<MainProcessResponse<UpdateResult>>
    deleteVisit: (id: string) => Promise<MainProcessResponse<DeleteResult>>
}
