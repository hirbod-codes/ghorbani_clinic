import { DeleteResult, Document, InsertOneResult, UpdateResult } from "mongodb";
import { patientSchema, type Patient, collectionName, updatableFields } from "../Models/Patient";
import { Visit, collectionName as visitsCollectionName } from "../Models/Visit";
import { Auth } from "../../Auth/auth-types";
import { Unauthorized } from "../Unauthorized";
import { DateTime } from "luxon";
import { getFieldsInPrivileges } from "../../Auth/roles";
import type { IPatientRepository } from "../dbAPI";
import { extractKeys, extractKeysRecursive } from "../helpers";
import { MongoDB } from "../mongodb";
import { ipcMain } from "electron";
import { Unauthenticated } from "../Unauthenticated";

export class PatientRepository extends MongoDB implements IPatientRepository {
    async createPatient(patient: Patient): Promise<InsertOneResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        if (!Auth.authenticatedUser.privileges.includes(`create.${collectionName}`))
            throw new Unauthorized();

        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');
        patient = patientSchema.cast(patient);
        patient.schemaVersion = 'v0.0.1';
        patient.createdAt = DateTime.utc().toUnixInteger();
        patient.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getPatientsCollection()).insertOne(patient)
    }

    async getPatientWithVisits(socialId: string): Promise<Patient & { visits: Visit[] }> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        if (Auth.authenticatedUser.privileges.filter(p => p === `read.${collectionName}` || p === `read.${visitsCollectionName}`).length !== 2)
            throw new Unauthorized();

        const patients = await (await this.getPatientsCollection()).aggregate([
            {
                $match: {
                    socialId: socialId
                }
            },
            {
                $lookup: {
                    from: visitsCollectionName,
                    localField: '_id',
                    foreignField: 'patientId',
                    as: visitsCollectionName
                }
            }
        ]).toArray();

        if (patients.length !== 1)
            return null;

        const readablePatient = extractKeysRecursive(patients, getFieldsInPrivileges(Auth.authenticatedUser.privileges, 'read', collectionName))
            .map(p => {
                p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFieldsInPrivileges(Auth.authenticatedUser.privileges, 'read', visitsCollectionName));
                return p;
            })[0];

        return readablePatient as Patient & { visits: Visit[] }
    }

    async getPatient(socialId: string): Promise<Patient> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const patient: Patient = await (await this.getPatientsCollection()).findOne({ socialId: socialId });
        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');

        const readablePatient = extractKeys(patient, getFieldsInPrivileges(privileges, 'read', collectionName));

        return readablePatient
    }

    async getPatients(offset: number, count: number): Promise<Patient[]> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const patients: Patient[] = await (await this.getPatientsCollection()).find().limit(count).skip(offset * count).sort('createdAt', -1).toArray();

        const readablePatients = extractKeysRecursive(patients, getFieldsInPrivileges(privileges, 'read', collectionName));

        return readablePatients
    }

    async getPatientsWithVisits(offset: number, count: number): Promise<(Patient & { visits: Visit[] })[]> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        console.log('getPatientsWithVisits called')
        const privileges = Auth.authenticatedUser.privileges;
        console.log('getPatientsWithVisits', 'privileges', privileges)
        if (privileges.includes(`read.${collectionName}`) && privileges.includes(`read.${visitsCollectionName}`))
            throw new Unauthorized();

        const patients: Document[] = await (await this.getPatientsCollection()).aggregate([
            {
                $lookup: {
                    from: visitsCollectionName,
                    localField: '_id',
                    foreignField: 'patientId',
                    as: visitsCollectionName
                }
            },
            {
                $sort: {
                    'createdAt': -1
                }
            },
            {
                $skip: offset * count
            },
            {
                $limit: count
            }
        ]).toArray();
        console.log('getPatientsWithVisits', 'patients', patients)

        const readablePatients = extractKeysRecursive(patients, getFieldsInPrivileges(privileges, 'read', collectionName))
            .map(p => {
                p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFieldsInPrivileges(privileges, 'read', visitsCollectionName));
                return p;
            });
        console.log('getPatientsWithVisits', 'readablePatients', readablePatients)

        return readablePatients as (Patient & { visits: Visit[] })[]
    }

    async updatePatient(patient: Patient): Promise<UpdateResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`update.${collectionName}`))
            throw new Unauthorized();

        const id = patient._id;

        patient = Object.fromEntries(Object.entries(patient).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(patient).forEach(k => {
            if (!getFieldsInPrivileges(privileges, 'update', collectionName).includes(k))
                throw new Unauthorized();
        });

        patient.updatedAt = DateTime.utc().toUnixInteger();

        const result = await (await this.getPatientsCollection()).updateOne({ _id: id }, patient, { upsert: false });
        console.log(result);

        return (await (await this.getPatientsCollection()).updateOne({ _id: id }, patient, { upsert: false }))
    }

    async deletePatient(id: string): Promise<DeleteResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`delete.${collectionName}`))
            throw new Unauthorized();

        const result = await (await this.getPatientsCollection()).deleteOne({ _id: id });
        console.log(result);

        return (await (await this.getPatientsCollection()).deleteOne({ _id: id }))
    }

    async handleEvents() {
        ipcMain.handle('create-patient', async (_e, { patient }: { patient: Patient; }) => this.handleErrors(async () => await this.createPatient(patient)))
        ipcMain.handle('get-patient-with-visits', async (_e, { socialId }: { socialId: string; }) => this.handleErrors(async () => await this.getPatientWithVisits(socialId)))
        ipcMain.handle('get-patients-with-visits', async (_e, { offset, count }: { offset: number; count: number; }) => this.handleErrors(async () => await this.getPatientsWithVisits(offset, count)))
        ipcMain.handle('get-patient', async (_e, { socialId }: { socialId: string; }) => this.handleErrors(async () => await this.getPatient(socialId)))
        ipcMain.handle('get-patients', async (_e, { offset, count }: { offset: number; count: number; }) => this.handleErrors(async () => await this.getPatients(offset, count)))
        ipcMain.handle('update-patient', async (_e, { patient }: { patient: Patient; }) => this.handleErrors(async () => await this.updatePatient(patient)))
        ipcMain.handle('delete-patient', async (_e, { id }: { id: string; }) => this.handleErrors(async () => await this.deletePatient(id)))
    }
}
