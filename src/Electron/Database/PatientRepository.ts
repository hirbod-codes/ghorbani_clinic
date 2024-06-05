import { Document } from "mongodb";
import { patientSchema, type Patient, getPrivileges, collectionName, updatableFields } from "./Models/Patient";
import { collectionName as visitsCollectionName } from "./Models/Visit";
import { Auth } from "../Auth/auth-types";
import { Unauthorized } from "./Unauthorized";
import { DateTime } from "luxon";
import { getFieldsInPrivileges } from "../Auth/roles";
import type { IPatientRepository } from "./dbAPI";
import { extractKeys, extractKeysRecursive } from "./helpers";
import { MongoDB } from "./mongodb";

export class PatientRepository extends MongoDB implements IPatientRepository {
    /**
     *
     * @param patient
     * @returns The id of the created patient
     */
    async createPatient(patient: Patient): Promise<string> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`create.${collectionName}`))
            throw new Unauthorized();

        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');
        patient = patientSchema.cast(patient);
        patient.schemaVersion = 'v0.0.1';
        patient.createdAt = DateTime.utc().toUnixInteger();
        patient.updatedAt = DateTime.utc().toUnixInteger();

        const result = await (await this.getPatientsCollection()).insertOne(patient)
        console.log(result)

        return (await (await this.getPatientsCollection()).insertOne(patient)).insertedId.toString();
    }

    /**
     *
     * @param socialId
     * @returns json string of Patient
     */
    async getPatientWithVisits(socialId: string): Promise<string | null> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (privileges.filter(p => p === `read.${collectionName}` || p === `read.${visitsCollectionName}`).length !== 2)
            throw new Unauthorized();

        try {
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

            const readablePatient = extractKeysRecursive(patients, getFieldsInPrivileges(privileges, 'read', collectionName))
                .map(p => {
                    p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFieldsInPrivileges(privileges, 'read', visitsCollectionName));
                    return p;
                })[0];

            return JSON.stringify(readablePatient);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     *
     * @param socialId
     * @returns json string of Patient
     */
    async getPatient(socialId: string): Promise<string | null> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const patient: Patient = await (await this.getPatientsCollection()).findOne({ socialId: socialId });
        if (!patientSchema.isValidSync(patient))
            throw new Error('Invalid patient info provided.');

        const readablePatient = extractKeys(patient, getFieldsInPrivileges(privileges, 'read', collectionName));

        return JSON.stringify(readablePatient);
    }

    async getPatients(offset: number, count: number): Promise<string | null> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        try {
            const patients: Patient[] = await (await this.getPatientsCollection()).find().limit(count).skip(offset * count).sort('createdAt', -1).toArray();

            const readablePatients = extractKeysRecursive(patients, getFieldsInPrivileges(privileges, 'read', collectionName));

            return JSON.stringify(readablePatients);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getPatientsWithVisits(offset: number, count: number): Promise<string | null> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (privileges.filter(p => p == `read.${collectionName}` || p == `read.${visitsCollectionName}`).length !== 2)
            throw new Unauthorized();

        try {
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

            const readablePatients = extractKeysRecursive(patients, getFieldsInPrivileges(privileges, 'read', collectionName))
                .map(p => {
                    p[visitsCollectionName] = extractKeysRecursive(p[visitsCollectionName], getFieldsInPrivileges(privileges, 'read', visitsCollectionName));
                    return p;
                });

            return JSON.stringify(readablePatients);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async updatePatient(patient: Patient): Promise<boolean> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
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

        return (await (await this.getPatientsCollection()).updateOne({ _id: id }, patient, { upsert: false })).matchedCount === 1;
    }

    async deletePatient(id: string): Promise<boolean> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`delete.${collectionName}`))
            throw new Unauthorized();

        const result = await (await this.getPatientsCollection()).deleteOne({ _id: id });
        console.log(result);

        return (await (await this.getPatientsCollection()).deleteOne({ _id: id })).deletedCount === 1;
    }
}
