import { Visit, collectionName, updatableFields, visitSchema } from "../Models/Visit";
import { MongoDB } from "../mongodb";
import type { IVisitRepository } from "../dbAPI";
import { Auth } from "../../Auth/auth-types";
import { Unauthorized } from "../Unauthorized";
import { DateTime } from "luxon";
import { extractKeysRecursive } from "../helpers";
import { getFieldsInPrivileges } from "../../Auth/roles";
import { ipcMain } from "electron";
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { Unauthenticated } from "../Unauthenticated";

export class VisitRepository extends MongoDB implements IVisitRepository {
    async createVisit(visit: Visit): Promise<InsertOneResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        if (!Auth.authenticatedUser.privileges.includes(`create.${collectionName}`))
            throw new Unauthorized();

        if (!visitSchema.isValidSync(visit))
            throw new Error('Invalid visit info provided.');

        visit = visitSchema.cast(visit);
        visit.schemaVersion = 'v0.0.1';
        visit.createdAt = DateTime.utc().toUnixInteger();
        visit.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getVisitsCollection()).insertOne(visit)
    }

    async getVisits(patientId: string): Promise<Visit[]> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: patientId }).toArray();

        const readableVisits = extractKeysRecursive(visits, getFieldsInPrivileges(privileges, 'read', collectionName));

        return readableVisits
    }

    async updateVisit(visit: Visit): Promise<UpdateResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`update.${collectionName}`))
            throw new Unauthorized();

        const id = visit._id;

        visit = Object.fromEntries(Object.entries(visit).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(visit).forEach(k => {
            if (!getFieldsInPrivileges(privileges, 'update', collectionName).includes(k))
                throw new Unauthorized();
        });

        visit.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getVisitsCollection()).updateOne({ _id: id }, visit, { upsert: false }))
    }

    async deleteVisit(id: string): Promise<DeleteResult> {
        if (!Auth.authenticatedUser)
            throw new Unauthenticated();

        const privileges = Auth.authenticatedUser.privileges;
        if (!privileges.includes(`delete.${collectionName}`))
            throw new Unauthorized();

        return (await (await this.getVisitsCollection()).deleteOne({ _id: id }))
    }

    async handleEvents(): Promise<void> {
        ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.createVisit(visit)))
        ipcMain.handle('get-visits', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.getVisits(patientId)))
        ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.updateVisit(visit)))
        ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteVisit(id)))
    }
}
