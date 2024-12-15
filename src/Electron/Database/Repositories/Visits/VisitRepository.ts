import { Visit, readableFields, updatableFields, visitSchema } from "../../Models/Visit";
import { MongoDB } from "../../mongodb";
import type { IVisitRepository } from "../../dbAPI";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { DateTime } from "luxon";
import { extractKeysRecursive } from "../../helpers";
import { ipcMain } from "electron";
import { DeleteResult, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { authRepository, privilegesRepository } from "../../main";
import { resources } from "../Auth/resources";
import { getFields } from "../../Models/helpers";
import { BadRequest } from "../../Exceptions/BadRequest";
import { number } from "yup";

export class VisitRepository extends MongoDB implements IVisitRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.createVisit(visit)))
        ipcMain.handle('get-visits-estimated-count', async () => await this.handleErrors(async () => await this.getVisitsEstimatedCount()))
        ipcMain.handle('get-expired-visits-count', async () => await this.handleErrors(async () => await this.getExpiredVisitsCount()))
        ipcMain.handle('get-expired-visits', async () => await this.handleErrors(async () => await this.getExpiredVisits()))
        ipcMain.handle('get-visits-by-date', async (_e, { startDate, endDate }: { startDate: number, endDate: number }) => await this.handleErrors(async () => await this.getVisitsByDate(startDate, endDate)))
        ipcMain.handle('get-visits-by-patient-id', async (_e, { patientId }: { patientId: string }) => await this.handleErrors(async () => await this.getVisitsByPatientId(patientId)))
        ipcMain.handle('get-visits', async (_e, { offset, count }: { offset: number, count: number }) => await this.handleErrors(async () => await this.getVisits(offset, count)))
        ipcMain.handle('update-visit', async (_e, { visit }: { visit: Visit }) => await this.handleErrors(async () => await this.updateVisit(visit)))
        ipcMain.handle('delete-visit', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteVisit(id)))
    }

    async createVisit(visit: Visit): Promise<InsertOneResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).create(resources.VISIT).granted)
            throw new Unauthorized()

        if (!visitSchema.isValidSync(visit))
            throw new Error('Invalid visit info provided.');

        visit = visitSchema.cast(visit);
        visit.schemaVersion = 'v0.0.1';
        visit.createdAt = DateTime.utc().toUnixInteger();
        visit.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getVisitsCollection()).insertOne(visit)
    }

    async getVisitsEstimatedCount(): Promise<number> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        return await (await this.getVisitsCollection()).estimatedDocumentCount()
    }

    async getExpiredVisitsCount(): Promise<number> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        return (await this.getExpiredVisits()).length
    }

    async getExpiredVisits(): Promise<Visit[]> {
        const nowTs = DateTime.utc().toUnixInteger()
        return (await (await this.getVisitsCollection()).find({ due: { $lt: nowTs } }).toArray())
    }

    async getVisitsByDate(startDate: number, endDate: number): Promise<Visit[]> {
        if (startDate > endDate)
            throw new Error('Invalid start and end date provided')

        console.log('Authenticating...')
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        console.log('Authorizing...')
        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ $and: [{ due: { $lte: endDate } }, { due: { $gte: startDate } }] }).sort('due', -1).toArray()

        const readableVisits = extractKeysRecursive(visits, getFields(readableFields, privileges.can(user.roleName).read(resources.VISIT).attributes));

        return readableVisits
    }

    async getVisitsByPatientId(patientId: string): Promise<Visit[]> {
        console.log('Authenticating...')
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        console.log('Authorizing...')
        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        const visits: Visit[] = await (await this.getVisitsCollection()).find({ patientId: new ObjectId(patientId) }).sort('due', -1).toArray()

        const readableVisits = extractKeysRecursive(visits, getFields(readableFields, privileges.can(user.roleName).read(resources.VISIT).attributes));

        return readableVisits
    }

    async getVisits(offset: number, count: number): Promise<Visit[]> {
        console.log({ offset, count });
        if (!number().required().min(0).isValidSync(offset) || !number().required().min(1).isValidSync(count))
            throw new BadRequest('Invalid data for getVisits method of VisitRepository.')

        console.log({ offset, count });

        console.log('Authenticating...')
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        console.log('Authorizing...')
        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).read(resources.VISIT).granted)
            throw new Unauthorized()

        const visits: Visit[] = await (await this.getVisitsCollection()).find().limit(count).skip(offset * count).sort('due', -1).toArray()

        const readableVisits = extractKeysRecursive(visits, getFields(readableFields, privileges.can(user.roleName).read(resources.VISIT).attributes));

        return readableVisits
    }

    async updateVisit(visit: Visit): Promise<UpdateResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).update(resources.VISIT).granted)
            throw new Unauthorized()

        const id = visit._id;

        const privilegedFields = getFields(updatableFields, privileges.can(user.roleName).update(resources.VISIT).attributes);

        const updatableVisit = Object.fromEntries(Object.entries(visit).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(updatableVisit).forEach(k => {
            if (!privilegedFields.includes(k))
                throw new Unauthorized();
        });

        updatableVisit.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getVisitsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { ...updatableVisit } }, { upsert: true }))
    }

    async deleteVisit(id: string): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(user.roleName).delete(resources.VISIT).granted)
            throw new Unauthorized()

        return (await (await this.getVisitsCollection()).deleteOne({ _id: new ObjectId(id) }))
    }
}
