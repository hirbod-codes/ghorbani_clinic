import { ipcRenderer } from "electron"
import type { MainProcessResponse } from "../../../types"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"
import { Patient } from "../../Models/Patient"
import { Visit } from "../../Models/Visit"

export function handleRendererEvents(): RendererEvents {
    return {
        socialIdExists: async (socialId: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('social-id-exists', { socialId })),
        createPatient: async (patient: Patient): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-patient', { patient })),
        getPatientById: async (id: string): Promise<MainProcessResponse<Patient | null | undefined>> => JSON.parse(await ipcRenderer.invoke('get-patient-by-id', { id })),
        getPatientsEstimatedCount: async (): Promise<MainProcessResponse<number>> => JSON.parse(await ipcRenderer.invoke('get-patients-estimated-count')),
        getPatientWithVisits: async (socialId: string): Promise<MainProcessResponse<Patient & { visits: Visit[] }>> => JSON.parse(await ipcRenderer.invoke('get-patient-with-visits', { socialId })),
        getPatientsWithVisits: async (offset: number, count: number): Promise<MainProcessResponse<(Patient & { visits: Visit[] })[]>> => JSON.parse(await ipcRenderer.invoke('get-patients-with-visits', { offset, count })),
        getPatients: async (offset: number, count: number): Promise<MainProcessResponse<Patient[]>> => JSON.parse(await ipcRenderer.invoke('get-patients', { offset, count })),
        getPatient: async (socialId: string): Promise<MainProcessResponse<Patient | null>> => JSON.parse(await ipcRenderer.invoke('get-patient', { socialId })),
        getPatientsByCreatedAtDate: async (startDate: number, endDate: number, ascending = false): Promise<MainProcessResponse<Patient[]>> => JSON.parse(await ipcRenderer.invoke('get-patients-by-created-at-date', { startDate, endDate, ascending })),
        updatePatient: async (patient: Patient): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-patient', { patient })),
        deletePatient: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-patient', { id })),
    }
}

export type RendererEvents = {
    socialIdExists: (socialId: string) => Promise<MainProcessResponse<boolean>>
    createPatient: (patient: Patient) => Promise<MainProcessResponse<InsertOneResult>>
    getPatientById: (id: string) => Promise<MainProcessResponse<Patient | null | undefined>>
    getPatientsEstimatedCount: () => Promise<MainProcessResponse<number>>
    getPatientWithVisits: (socialId: string) => Promise<MainProcessResponse<Patient & { visits: Visit[] }>>
    getPatientsWithVisits: (offset: number, count: number) => Promise<MainProcessResponse<(Patient & { visits: Visit[] })[]>>
    getPatients: (offset: number, count: number) => Promise<MainProcessResponse<Patient[]>>
    getPatient: (socialId: string) => Promise<MainProcessResponse<Patient | null>>
    getPatientsByCreatedAtDate: (startDate: number, endDate: number, ascending?: boolean) => Promise<MainProcessResponse<Patient[]>>
    updatePatient: (patient: Patient) => Promise<MainProcessResponse<UpdateResult>>
    deletePatient: (id: string) => Promise<MainProcessResponse<DeleteResult>>
}
