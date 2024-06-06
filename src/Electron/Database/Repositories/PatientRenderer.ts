import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../types"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"
import { Patient } from "../Models/Patient"
import { Visit } from "../Models/Visit"

export function handleRendererEvents(): handleRendererEvents {
    return {
        createPatient: async (patient: Patient): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-patient', { patient })),
        getPatientWithVisits: async (socialId: string): Promise<MainProcessResponse<Patient & { visits: Visit[] }>> => JSON.parse(await ipcRenderer.invoke('get-patient-with-visits', { socialId })),
        getPatientsWithVisits: async (offset: number, count: number): Promise<MainProcessResponse<(Patient & { visits: Visit[] })[]>> => JSON.parse(await ipcRenderer.invoke('get-patients-with-visits', { offset, count })),
        getPatients: async (offset: number, count: number): Promise<MainProcessResponse<Patient[]>> => JSON.parse(await ipcRenderer.invoke('get-patients', { offset, count })),
        getPatient: async (socialId: string): Promise<MainProcessResponse<Patient>> => JSON.parse(await ipcRenderer.invoke('get-patient', { socialId })),
        updatePatient: async (patient: Patient): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-patient', { patient })),
        deletePatient: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-patient', { id })),
    }
}

export type handleRendererEvents = {
    createPatient: (patient: Patient) => Promise<MainProcessResponse<InsertOneResult>>
    getPatientWithVisits: (socialId: string) => Promise<MainProcessResponse<Patient & { visits: Visit[] }>>
    getPatientsWithVisits: (offset: number, count: number) => Promise<MainProcessResponse<(Patient & { visits: Visit[] })[]>>
    getPatients: (offset: number, count: number) => Promise<MainProcessResponse<Patient[]>>
    getPatient: (socialId: string) => Promise<MainProcessResponse<Patient>>
    updatePatient: (patient: Patient) => Promise<MainProcessResponse<UpdateResult>>
    deletePatient: (id: string) => Promise<MainProcessResponse<DeleteResult>>
}