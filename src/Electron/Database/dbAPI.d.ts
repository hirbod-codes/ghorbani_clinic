export type dbAPI = {
    getConfig: () => Promise<MongodbConfig>,
    updateConfig: (config: MongodbConfig) => Promise<boolean>,
}

export type IPatientRepository = dbAPI & {
    createPatient(patient: Patient): Promise<InsertOneResult>,
    getPatientWithVisits(socialId: string): Promise<Patient & { visits: Visit[] }>,
    getPatient(socialId: string): Promise<Patient>,
    getPatients(offset: number, count: number): Promise<Patient[]>,
    getPatientsWithVisits(offset: number, count: number): Promise<(Patient & { visits: Visit[] })[]>,
    updatePatient(patient: Patient): Promise<UpdateResult>,
    deletePatient(id: string): Promise<DeleteResult>
}

export type IVisitRepository = dbAPI & {
    createVisit(visit: Visit): Promise<InsertOneResult>,
    getVisits(patientId: string): Promise<Visit[]>,
    updateVisit(visit: Visit): Promise<UpdateResult>,
    deleteVisit(id: string): Promise<DeleteResult>,
}

export type IFileRepository = dbAPI & {
    uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<boolean>,
    retrieveFiles(patientId: string): Promise<GridFSFile[]>,
    downloadFile(patientId: string, fileName: string): Promise<string>,
    downloadFiles(patientId: string): Promise<string[]>,
    openFile(patientId: string, fileName: string): Promise<void>,
    deleteFiles(patientId: string): Promise<boolean>,
}