export type dbAPI = {
    getConfig: () => Promise<MongodbConfig>,
    updateConfig: (config: MongodbConfig) => Promise<boolean>,

    /**
     * 
     * @param patient
     * @returns The id of the created patient
     */
    createPatient(patient: Patient): Promise<string>,
    /**
     * 
     * @param socialId
     * @returns json string of Patient
     */
    getPatient(socialId: string): Promise<string | null>,
    getPatients(offset: number, count: number): Promise<string | null>,
    updatePatient(patient: Patient): Promise<boolean>,
    deletePatient(id: string): Promise<boolean>,

    /**
     * 
     * @param visit
     * @returns The id of the created visit
     */
    createVisit(visit: Visit): Promise<string>,
    /**
     * 
     * @param patientId
     * @returns json string of Visit[]
     */
    getVisits(patientId: string): Promise<string | null>,
    updateVisit(visit: Visit): Promise<boolean>,
    deleteVisit(id: string): Promise<boolean>,

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