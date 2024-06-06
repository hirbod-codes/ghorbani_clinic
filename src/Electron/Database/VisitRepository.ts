import { Visit, collectionName, getPrivileges, updatableFields, visitSchema } from "./Models/Visit";
import { MongoDB } from "./mongodb";
import type { IVisitRepository } from "./dbAPI";
import { Auth } from "../Auth/auth-types";
import { Unauthorized } from "./Unauthorized";
import { DateTime } from "luxon";
import { extractKeysRecursive } from "./helpers";
import { getFieldsInPrivileges } from "../Auth/roles";
import { ipcMain, ipcRenderer } from "electron";
import type { MainProcessResponse } from "../types";
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";

export class VisitRepository extends MongoDB implements IVisitRepository {
    async createVisit(visit: Visit): Promise<InsertOneResult> {
        if (!getPrivileges(Auth.authenticatedUser.roleName).includes(`create.${collectionName}`))
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
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`read.${collectionName}`))
            throw new Unauthorized();

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: patientId }).toArray();

        const readableVisits = extractKeysRecursive(visits, getFieldsInPrivileges(privileges, 'read', collectionName));

        return readableVisits
    }

    async updateVisit(visit: Visit): Promise<UpdateResult> {
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

        return (await (await this.getVisitsCollection()).updateOne({ _id: id }, visit, { upsert: false }))
    }

    async deleteVisit(id: string): Promise<DeleteResult> {
        const privileges = getPrivileges(Auth.authenticatedUser.roleName);
        if (!privileges.includes(`delete.${collectionName}`))
            throw new Unauthorized();

        return (await (await this.getVisitsCollection()).deleteOne({ _id: id }))
    }

    static handleRendererEvents(): handleRendererEvents {
        return {
            createVisit: async (visit: Visit): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-visit', { visit })),
            getVisits: async (patientId: string): Promise<MainProcessResponse<Visit[]>> => JSON.parse(await ipcRenderer.invoke('get-visits', { patientId })),
            updateVisit: async (visit: Visit): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-visit', { visit })),
            deleteVisit: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-visit', { id })),
        }
    }

    async handleEvents(): Promise<void> {
        ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => this.handleErrors(async () => await this.createVisit(visit)))
        ipcMain.handle('get-visits', async (_e, { patientId }: { patientId: string }) => this.handleErrors(async () => await this.getVisits(patientId)))
        ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => this.handleErrors(async () => await this.updateVisit(visit)))
        ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => this.handleErrors(async () => await this.deleteVisit(id)))
    }
}

export type handleRendererEvents = {
    createVisit: (visit: Visit) => Promise<MainProcessResponse<InsertOneResult>>
    getVisits: (patientId: string) => Promise<MainProcessResponse<Visit[]>>
    updateVisit: (visit: Visit) => Promise<MainProcessResponse<UpdateResult>>
    deleteVisit: (id: string) => Promise<MainProcessResponse<DeleteResult>>
}
