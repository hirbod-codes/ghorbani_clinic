import { ipcRenderer } from "electron"
import { DeleteResult, InsertOneResult } from "mongodb"
import { MedicalHistory } from "../../Models/MedicalHistory"
import { MainProcessResponse } from "../../../types"

export function handleRendererEvents(): RendererEvents {
    return {
        createMedicalHistory: async (medicalHistory: MedicalHistory): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-medical-history', { medicalHistory })),
        getMedicalHistories: async (offset: number, count: number): Promise<MainProcessResponse<MedicalHistory[]>> => JSON.parse(await ipcRenderer.invoke('get-medical-histories', { offset, count })),
        searchMedicalHistories: async (searchStr: string): Promise<MainProcessResponse<MedicalHistory[]>> => JSON.parse(await ipcRenderer.invoke('search-medical-histories', { searchStr })),
        getMedicalHistory: async (name: string): Promise<MainProcessResponse<MedicalHistory>> => JSON.parse(await ipcRenderer.invoke('get-medical-history', { name })),
        deleteMedicalHistoryById: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-medical-history-by-id', { id })),
        deleteMedicalHistoryByName: async (name: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-medical-history-by-name', { name }))
    }
}

export type RendererEvents = {
    createMedicalHistory(medicalHistory: MedicalHistory): Promise<MainProcessResponse<InsertOneResult>>;
    getMedicalHistories(offset: number, count: number): Promise<MainProcessResponse<MedicalHistory[]>>;
    searchMedicalHistories(searchStr: string): Promise<MainProcessResponse<MedicalHistory[]>>;
    getMedicalHistory(name: string): Promise<MainProcessResponse<MedicalHistory>>;
    deleteMedicalHistoryById(id: string): Promise<MainProcessResponse<DeleteResult>>;
    deleteMedicalHistoryByName(name: string): Promise<MainProcessResponse<DeleteResult>>;
}
