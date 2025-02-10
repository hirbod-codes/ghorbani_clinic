import { DeleteResult, Document, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { patientSchema, type Patient, updatableFields, readableFields as patientReadableFields } from "../../Models/Patient";
import { Visit, readableFields as visitReadableFields, collectionName as visitsCollectionName } from "../../Models/Visit";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { DateTime } from "luxon";
import type { IPatientRepository } from "../../dbAPI";
import { extractKeys, extractKeysRecursive } from "../../helpers";
import { MongoDB } from "../../mongodb";
import { ipcMain } from "electron";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { authRepository, privilegesRepository } from "../../main";
import { resources } from "../Auth/resources";
import { getFields } from "../../Models/helpers";

export class PatientRepository extends MongoDB implements IPatientRepository {
    async handleEvents() {
        ipcMain.handle('create-patient', async (_e, { patient }: { patient: Patient; }) => await this.handleErrors(async () => await this.createPatient(patient)))
        ipcMain.handle('get-patients-estimated-count', async () => await this.handleErrors(async () => await this.getPatientsEstimatedCount()))
        ipcMain.handle('get-patient-with-visits', async (_e, { socialId }: { socialId: string; }) => await this.handleErrors(async () => await this.getPatientWithVisits(socialId)))
        ipcMain.handle('get-patients-with-visits', async (_e, { offset, count }: { offset: number; count: number; }) => await this.handleErrors(async () => await this.getPatientsWithVisits(offset, count)))
        ipcMain.handle('get-patient', async (_e, { socialId }: { socialId: string; }) => await this.handleErrors(async () => await this.getPatient(socialId)))
        ipcMain.handle('get-patients', async (_e, { offset, count }: { offset: number; count: number; }) => await this.handleErrors(async () => await this.getPatients(offset, count)))
        ipcMain.handle('get-patients-by-created-at-date', async (_e, { startDate, endDate, ascending }: { startDate: number, endDate: number, ascending?: boolean }) => await this.handleErrors(async () => await this.getPatientsByCreatedAtDate(startDate, endDate, ascending)))
        ipcMain.handle('update-patient', async (_e, { patient }: { patient: Patient; }) => await this.handleErrors(async () => await this.updatePatient(patient)))
        ipcMain.handle('delete-patient', async (_e, { id }: { id: string; }) => await this.handleErrors(async () => await this.deletePatient(id)))
    }

    async createPatient(patient: Patient): Promise<InsertOneResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).create(resources.PATIENT).granted)
            throw new Unauthorized()

        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');

        patient = patientSchema.cast(patient);
        patient.schemaVersion = 'v0.0.1';
        patient.createdAt = DateTime.utc().toUnixInteger();
        patient.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getPatientsCollection()).insertOne(patient)
    }

    async getPatientsEstimatedCount(): Promise<number> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).read(resources.PATIENT).granted)
            throw new Unauthorized()

        return await (await this.getPatientsCollection()).estimatedDocumentCount()
    }

    async getPatientWithVisits(socialId: string): Promise<Patient & { visits: Visit[] } | null> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const patientPermission = privileges.can(user.roleName).read(resources.PATIENT);
        const visitPermission = privileges.can(user.roleName).read(resources.VISIT);
        if (!patientPermission.granted || !visitPermission.granted)
            throw new Unauthorized()

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

        const readablePatient = extractKeysRecursive(patients, getFields(patientReadableFields, patientPermission.attributes))
            .map(p => {
                p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFields(visitReadableFields, visitPermission.attributes));
                return p;
            })[0];

        return readablePatient as Patient & { visits: Visit[] }
    }

    async getPatient(socialId: string): Promise<Patient | null> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(user.roleName).read(resources.PATIENT);
        if (!permission.granted)
            throw new Unauthorized()

        const patient = await (await this.getPatientsCollection()).findOne({ socialId: socialId });
        if (!patient)
            return null

        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');

        const readablePatient = extractKeys(patient, getFields(patientReadableFields, permission.attributes));

        return readablePatient
    }

    async getPatients(offset: number, count: number): Promise<Patient[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(user.roleName).read(resources.PATIENT);
        if (!permission.granted)
            throw new Unauthorized()

        const patients: Patient[] = await (await this.getPatientsCollection()).find().limit(count).skip(offset * count).sort('createdAt', -1).toArray();

        const readablePatients = extractKeysRecursive(patients, getFields(patientReadableFields, permission.attributes));

        return readablePatients
    }

    async getPatientsByCreatedAtDate(startDate: number, endDate: number, ascending = false) {
        if (startDate > endDate)
            throw new Error('Invalid start and end date provided')

        console.log('Authenticating...')
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        console.log('Authorizing...')
        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).read(resources.PATIENT).granted)
            throw new Unauthorized()

        const patients: Patient[] = await (await this.getPatientsCollection()).find({ $and: [{ createdAt: { $lte: endDate } }, { createdAt: { $gte: startDate } }] }).sort('createdAt', ascending ? 1 : -1).toArray()

        const readableVisits = extractKeysRecursive(patients, getFields(patientReadableFields, privileges.can(user.roleName).read(resources.PATIENT).attributes));

        return readableVisits
    }

    async getPatientsWithVisits(offset: number, count: number): Promise<(Patient & { visits: Visit[] })[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const patientPermission = privileges.can(user.roleName).read(resources.PATIENT);
        const visitPermission = privileges.can(user.roleName).read(resources.VISIT);
        if (!patientPermission.granted || !visitPermission.granted)
            throw new Unauthorized()

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

        let readablePatients = extractKeysRecursive(patients, [...getFields(patientReadableFields, patientPermission.attributes), visitsCollectionName])
        console.log('getPatientsWithVisits', 'readablePatients', readablePatients)
        readablePatients = readablePatients.map(p => {
            p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFields(visitReadableFields, visitPermission.attributes));
            return p;
        });
        console.log('getPatientsWithVisits', 'readablePatients', readablePatients)

        return readablePatients as (Patient & { visits: Visit[] })[]
    }

    async updatePatient(patient: Patient): Promise<UpdateResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(user.roleName).update(resources.PATIENT)
        if (!permission.granted)
            throw new Unauthorized()

        const id = patient._id;

        const updatablePatient = Object.fromEntries(Object.entries(patient).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(updatablePatient).forEach(k => {
            if (!getFields(updatableFields, permission.attributes).includes(k))
                throw new Unauthorized();
        });

        updatablePatient.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getPatientsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { ...updatablePatient } }, { upsert: false }))
    }

    async deletePatient(id: string): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).delete(resources.PATIENT).granted)
            throw new Unauthorized()

        return (await (await this.getPatientsCollection()).deleteOne({ _id: new ObjectId(id) }))
    }
}
