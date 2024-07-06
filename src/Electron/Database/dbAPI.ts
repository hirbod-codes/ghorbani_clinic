import { AccessControl } from "accesscontrol"
import { Privilege } from "./Models/Privilege"
import { DeleteResult, GridFSFile, InsertManyResult, InsertOneResult, UpdateResult } from "mongodb"
import { Patient } from "./Models/Patient"
import { Visit } from "./Models/Visit"
import { MongodbConfig } from "../Configuration/types"
import { User } from "./Models/User"

export type dbAPI = {
    getConfig: () => Promise<MongodbConfig>;
    updateConfig: (config: MongodbConfig) => Promise<boolean>;
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
    createPatient(patient: Patient): Promise<InsertOneResult>;
    getPatientWithVisits(socialId: string): Promise<Patient & { visits: Visit[] }>;
    getPatientsEstimatedCount(): Promise<number>;
    getPatient(socialId: string): Promise<Patient | null>;
    getPatients(offset: number, count: number): Promise<Patient[]>;
    getPatientsWithVisits(offset: number, count: number): Promise<(Patient & { visits: Visit[] })[]>;
    updatePatient(patient: Patient): Promise<UpdateResult>;
    deletePatient(id: string): Promise<DeleteResult>
}

export type IVisitRepository = dbAPI & {
    handleEvents(): Promise<void>;
    createVisit(visit: Visit): Promise<InsertOneResult>;
    getVisitsEstimatedCount(): Promise<number>;
    getExpiredVisitsCount(): Promise<number>;
    getExpiredVisits(): Promise<Visit[]>;
    getVisits(): Promise<Visit[]>;
    getVisits(offset: number, count: number): Promise<Visit[]>;
    getVisits(patientId: string): Promise<Visit[]>;
    updateVisit(visit: Visit): Promise<UpdateResult>;
    deleteVisit(id: string): Promise<DeleteResult>;
}

export type IFileRepository = dbAPI & {
    handleEvents(): Promise<void>;
    uploadFiles(patientId: string, files: { fileName: string; bytes: Buffer | Uint8Array; }[]): Promise<boolean>;
    retrieveFiles(patientId: string): Promise<GridFSFile[]>;
    downloadFile(patientId: string, fileName: string): Promise<string>;
    downloadFiles(patientId: string): Promise<string[]>;
    openFile(patientId: string, fileName: string): Promise<void>;
    deleteFiles(patientId: string): Promise<boolean>;
}
