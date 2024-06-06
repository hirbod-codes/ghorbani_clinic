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
    uploadFiles(patientId: string, files: { fileName: string, bytes: Buffer | Uint8Array }[]): Promise<boolean>,
    /**
     * 
     * @param patientId
     * @returns json string of GridFSFile[]
     */
    retrieveFiles(patientId: string): Promise<string | null>,
    /**
     * 
     * @param patientId
     * @param fileName
     * @returns The downloaded file's file path
     */
    downloadFile(patientId: string, fileName: string): Promise<string | null>,
    /**
     * 
     * @param patientId
     * @returns The downloaded files' paths
     */
    downloadFiles(patientId: string): Promise<string | null>,
    openFile(patientId: string, fileName: string): Promise<void>,
    deleteFiles(patientId: string): Promise<boolean>,
}