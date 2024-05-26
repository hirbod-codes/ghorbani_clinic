export type dbAPI = {
    getConfig: () => Promise<MongodbConfig>,
    updateConfig: (config: MongodbConfig) => Promise<boolean>,
    createPatient(patient: Patient): Promise<string>,
    getPatient(socialId: number): Promise<Patient | null>,
    updatePatient(patient: Patient): Promise<boolean>,
    deletePatient(id: string): Promise<boolean>,
    uploadFiles(patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean>,
    retrieveFiles(patientId: string): Promise<string[] | null>,
    openFile(patientId: string, fileName: string): Promise<void>,
    deleteFiles(patientId: string): Promise<boolean>,
}