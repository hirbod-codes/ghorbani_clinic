import { Visit, collectionName, getPrivileges, updatableFields, visitSchema } from "./Models/Visit";
import { MongoDB } from "./mongodb";
import type { IVisitRepository } from "./dbAPI";
import { Auth } from "../Auth/auth-types";
import { Unauthorized } from "./Unauthorized";
import { DateTime } from "luxon";
import { extractKeysRecursive } from "./helpers";
import { getFieldsInPrivileges } from "../Auth/roles";

export class VisitRepository extends MongoDB implements IVisitRepository {
    async createVisit(visit: Visit): Promise<string> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`create.${collectionName}`))
            throw new Unauthorized();

        if (!visitSchema.isValidSync(visit))
            throw new Error('Invalid visit info provided.');

        visit = visitSchema.cast(visit);
        visit.schemaVersion = 'v0.0.1';
        visit.createdAt = DateTime.utc().toUnixInteger();
        visit.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getVisitsCollection()).insertOne(visit)).insertedId.toString();
    }

    async getVisits(patientId: string): Promise<string | null> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: patientId }).toArray();

        const readableVisits = extractKeysRecursive(visits, getFieldsInPrivileges(privileges, 'read', collectionName));

        return JSON.stringify(readableVisits);
    }

    async updateVisit(visit: Visit): Promise<boolean> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`update.${collectionName}`))
            throw new Unauthorized();

        const id = visit._id;

        visit = Object.fromEntries(Object.entries(visit).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(visit).forEach(k => {
            if (!getFieldsInPrivileges(privileges, 'update', collectionName).includes(k))
                throw new Unauthorized();
        });

        visit.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getVisitsCollection()).updateOne({ _id: id }, visit, { upsert: false })).matchedCount === 1;
    }

    async deleteVisit(id: string): Promise<boolean> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`delete.${collectionName}`))
            throw new Unauthorized();

        return (await (await this.getVisitsCollection()).deleteOne({ _id: id })).deletedCount === 1;
    }
}
