import { Visit, readableFields, updatableFields, visitSchema } from "../../Models/Visit";
import { MongoDB } from "../../mongodb";
import type { IVisitRepository } from "../../dbAPI";
import { Unauthorized } from "../../Unauthorized";
import { DateTime } from "luxon";
import { extractKeysRecursive } from "../../helpers";
import { ipcMain } from "electron";
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { Unauthenticated } from "../../Unauthenticated";
import { Auth } from "../Auth/Auth";
import { privilegesRepository } from "../../handleDbEvents";
import { resources } from "../Auth/dev-permissions";
import { getFields } from "../../Models/helpers";

export class VisitRepository extends MongoDB implements IVisitRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.createVisit(visit)))
        ipcMain.handle('get-visits', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.getVisits(patientId)))
        ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.updateVisit(visit)))
        ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteVisit(id)))
    }

    async createVisit(visit: Visit): Promise<InsertOneResult> {
        const user = Auth.getAuthenticated();
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getPrivileges()).can(user.roleName).create(resources.VISIT).granted)
            throw new Unauthorized()

        if (!visitSchema.isValidSync(visit))
            throw new Error('Invalid visit info provided.');

        visit = visitSchema.cast(visit);
        visit.schemaVersion = 'v0.0.1';
        visit.createdAt = DateTime.utc().toUnixInteger();
        visit.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getVisitsCollection()).insertOne(visit)
    }

    async getVisits(patientId: string): Promise<Visit[]> {
        const user = Auth.getAuthenticated();
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        if (!privileges.can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: patientId }).toArray();

        const readableVisits = extractKeysRecursive(visits, getFields(readableFields, privileges.can(user.roleName).read(resources.VISIT).attributes));

        return readableVisits
    }

    async updateVisit(visit: Visit): Promise<UpdateResult> {
        const user = Auth.getAuthenticated();
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        if (!privileges.can(user.roleName).update(resources.VISIT).granted)
            throw new Unauthorized()

        const id = visit._id;

        const privilegedFields = getFields(updatableFields, privileges.can(user.roleName).update(resources.VISIT).attributes);

        visit = Object.fromEntries(Object.entries(visit).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(visit).forEach(k => {
            if (!privilegedFields.includes(k))
                throw new Unauthorized();
        });

        visit.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getVisitsCollection()).updateOne({ _id: id }, visit, { upsert: false }))
    }

    async deleteVisit(id: string): Promise<DeleteResult> {
        const user = Auth.getAuthenticated();
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        if (!privileges.can(user.roleName).delete(resources.VISIT).granted)
            throw new Unauthorized()

        return (await (await this.getVisitsCollection()).deleteOne({ _id: id }))
    }
}
