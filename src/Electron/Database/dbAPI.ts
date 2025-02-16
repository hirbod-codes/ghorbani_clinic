import { AccessControl } from "accesscontrol"
import { Privilege } from "./Models/Privilege"
import { DeleteResult, GridFSFile, InsertManyResult, InsertOneResult, UpdateResult } from "mongodb"
import { Patient } from "./Models/Patient"
import { Visit } from "./Models/Visit"
import { User } from "./Models/User"
import { MedicalHistory } from "./Models/MedicalHistory"
import { Canvas } from "./Models/Canvas"
import { MongodbConfig } from "../Configuration/main.d"

export type dbAPI = {
    truncate: () => Promise<boolean>,
    seed: () => Promise<boolean>,
    initializeDb: () => Promise<boolean>,
    getConfig: () => Promise<MongodbConfig | undefined>;
    updateConfig: (config: MongodbConfig) => Promise<boolean>;
    searchForDbService: (databaseName?: string, supportsTransaction?: boolean, auth?: { username: string, password: string }) => Promise<boolean>;
}

export type IAuthRepository = dbAPI & {
    handleEvents(): Promise<void>;
    login(username: string, password: string): Promise<boolean>;
    logout(): Promise<boolean>;
    getAuthenticatedUser(): Promise<User | null>;
}

export type IUsersRepository = dbAPI & {
    handleEvents(): Promise<void>;
    createUser(user: User): Promise<InsertOneResult>;
    getUser(userId: string): Promise<User | null>;
    getUsers(): Promise<User[]>;
    updateUser(user: User): Promise<UpdateResult>;
    deleteUser(userId: string): Promise<DeleteResult>;
}

export type IPrivilegesRepository = dbAPI & {
    handleEvents(): Promise<void>;
    createRole(privileges: Privilege[]): Promise<InsertManyResult>;
    createPrivilege(privilege: Privilege): Promise<InsertOneResult>;
    getRoles(): Promise<string[]>;
    getAccessControl(): Promise<AccessControl>;
    getPrivileges(roleName?: string): Promise<Privilege[]>;
    updatePrivilege(privilege: Privilege): Promise<UpdateResult | undefined>;
    updatePrivileges(privileges: Privilege[]): Promise<boolean>;
    deletePrivilege(id: string): Promise<DeleteResult>;
    deletePrivileges(roleName: string | string[]): Promise<DeleteResult>;
}

export type IPatientRepository = dbAPI & {
    handleEvents(): Promise<void>;
    socialIdExists(socialId: string): Promise<boolean>
    getPatientById(id: string): Promise<Patient | null | undefined>
    createPatient(patient: Patient): Promise<InsertOneResult>;
    getPatientWithVisits(socialId: string): Promise<Patient & { visits: Visit[] } | null>;
    getPatientsEstimatedCount(): Promise<number>;
    getPatient(socialId: string): Promise<Patient | null>;
    getPatients(offset: number, count: number): Promise<Patient[]>;
    getPatientsWithVisits(offset: number, count: number): Promise<(Patient & { visits: Visit[] })[]>;
    updatePatient(patient: Patient): Promise<UpdateResult>;
    deletePatient(id: string): Promise<DeleteResult>
}

export type IMedicalHistoryRepository = dbAPI & {
    handleEvents(): Promise<void>;
    createMedicalHistory(medicalHistory: MedicalHistory): Promise<InsertOneResult<MedicalHistory>>;
    getMedicalHistories(offset: number, count: number): Promise<MedicalHistory[]>;
    searchMedicalHistories(searchStr: string): Promise<MedicalHistory[]>;
    getMedicalHistory(name: string): Promise<MedicalHistory | null>;
    deleteMedicalHistoryById(id: string): Promise<DeleteResult>;
    deleteMedicalHistoryByName(name: string): Promise<DeleteResult>;
}

export type IVisitRepository = dbAPI & {
    handleEvents(): Promise<void>;
    createVisit(visit: Visit): Promise<InsertOneResult>;
    getVisitsEstimatedCount(): Promise<number>;
    getExpiredVisitsCount(): Promise<number>;
    getExpiredVisits(): Promise<Visit[]>;
    getVisitsByDate(startDate: number, endDate: number): Promise<Visit[]>;
    getVisitsByPatientId(patientId: string): Promise<Visit[]>;
    getVisits(offset: number, count: number): Promise<Visit[]>;
    updateVisit(visit: Visit): Promise<UpdateResult>;
    deleteVisit(id: string): Promise<DeleteResult>;
}

export type IPatientsDocumentsRepository = dbAPI & {
    handleEvents(): Promise<void>;
    uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<boolean>;
    retrieveFiles(patientId: string): Promise<GridFSFile[]>;
    downloadFiles(patientId: string, saveDirectory?: string, force?: boolean): Promise<boolean>;
    fileExists(patientId: string, fileId: string, filename: string, saveDirectory?: string): Promise<boolean>;
    downloadFile(patientId: string, fileId: string, filename: string, saveDirectory?: string, force?: boolean): Promise<boolean>;
    openFile(patientId: string, fileId: string, filename: string): Promise<boolean>;
    deleteFiles(patientId: string): Promise<boolean>;
    deleteFile(patientId: string, fileId: string, filename: string): Promise<boolean>;
}

export type ICanvasRepository = dbAPI & {
    handleEvents(): Promise<void>;
    uploadCanvas(canvas: Canvas): Promise<string>;
    retrieveCanvases(id: string): Promise<GridFSFile[]>;
    downloadCanvas(id: string): Promise<Canvas | null>;
    downloadCanvases(ids: string[]): Promise<Canvas[]>;
    openCanvas(id: string): Promise<void>;
    deleteCanvas(id: string): Promise<boolean>;
}
