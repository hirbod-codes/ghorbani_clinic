import { ipcRenderer } from "electron";
import { MongodbConfig } from "../../../Config/config";
import type { Patient } from "../Models/Patient";

export async function getConfig(): Promise<MongodbConfig> {
    return await ipcRenderer.invoke('get-config')
}

export async function updateConfig(config: MongodbConfig): Promise<boolean> {
    return await ipcRenderer.invoke('update-config', { config })
}

export async function createPatient(patient: Patient): Promise<string> {
    return await ipcRenderer.invoke('create-patient', { patient })
}

export async function getPatient(socialId: number): Promise<Patient | null> {
    return await ipcRenderer.invoke('get-patient', { socialId })
}

export async function updatePatient(patient: Patient): Promise<boolean> {
    return await ipcRenderer.invoke('update-patient', { patient })
}

export async function deletePatient(id: string): Promise<boolean> {
    return await ipcRenderer.invoke('delete-patient', { id })
}

export async function uploadFiles(patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean> {
    return await ipcRenderer.invoke('upload-files', { patientId, files })
}

export async function retrieveFiles(patientId: string): Promise<string[] | null> {
    return await ipcRenderer.invoke('retrieve-files', { patientId })
}

export async function openFile(patientId: string, fileName: string): Promise<void> {
    await ipcRenderer.invoke('open-file', { patientId, fileName })
}

export async function deleteFiles(patientId: string): Promise<boolean> {
    return await ipcRenderer.invoke('delete-files', { patientId })
}
