import { InsertOneResult, Document, DeleteResult, ObjectId } from "mongodb";
import { IMedicalHistoryRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { ipcMain } from "electron";
import { MedicalHistory, medicalHistorySchema } from "../../Models/MedicalHistory";
import { authRepository, privilegesRepository } from "../../main";
import { Unauthenticated } from "../../Exceptions/Unauthenticated";
import { Unauthorized } from "../../Exceptions/Unauthorized";
import { resources } from "../Auth/resources";
import { DateTime } from "luxon";
import { BadRequest } from "../../Exceptions/BadRequest";

export class MedicalHistoryRepository extends MongoDB implements IMedicalHistoryRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-medical-history', async (_e, { medicalHistory }: { medicalHistory: MedicalHistory }) => await this.handleErrors(async () => await this.createMedicalHistory(medicalHistory)))
        ipcMain.handle('get-medical-histories', async (_e, { offset, count }: { offset: number, count: number }) => await this.handleErrors(async () => await this.getMedicalHistories(offset, count)))
        ipcMain.handle('search-medical-histories', async (_e, { searchStr }: { searchStr: string }) => await this.handleErrors(async () => await this.searchMedicalHistories(searchStr)))
        ipcMain.handle('get-medical-history', async (_e, { name }: { name: string }) => await this.handleErrors(async () => await this.getMedicalHistory(name)))
        ipcMain.handle('delete-medical-history-by-id', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deleteMedicalHistoryById(id)))
        ipcMain.handle('delete-medical-history-by-name', async (_e, { name }: { name: string }) => await this.handleErrors(async () => await this.deleteMedicalHistoryByName(name)))
    }

    async createMedicalHistory(medicalHistory: MedicalHistory): Promise<InsertOneResult<MedicalHistory>> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).create(resources.MEDICAL_HISTORY).granted)
            throw new Unauthorized()

        if (!medicalHistorySchema.isValidSync(medicalHistory))
            throw new BadRequest('Invalid medicalHistory info provided.');

        medicalHistory = medicalHistorySchema.cast(medicalHistory);
        if (medicalHistory === undefined)
            throw new BadRequest('Invalid medicalHistory info provided.');

        medicalHistory.schemaVersion = 'v0.0.1';
        medicalHistory.createdAt = DateTime.utc().toUnixInteger();
        medicalHistory.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getMedicalHistoriesCollection()).insertOne(medicalHistory)
    }

    async getMedicalHistories(offset: number, count: number): Promise<MedicalHistory[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(user.roleName).read(resources.MEDICAL_HISTORY);
        if (!permission.granted)
            throw new Unauthorized()

        return await (await this.getMedicalHistoriesCollection()).find().limit(count).skip(offset * count).sort('createdAt', -1).toArray()
    }

    async getMedicalHistory(name: string): Promise<MedicalHistory | null> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).read(resources.MEDICAL_HISTORY).granted)
            throw new Unauthorized()

        return await (await this.getMedicalHistoriesCollection()).findOne({ name: name })
    }

    async searchMedicalHistories(searchStr: string): Promise<MedicalHistory[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).read(resources.MEDICAL_HISTORY).granted)
            throw new Unauthorized()

        return await (await this.getMedicalHistoriesCollection()).find({ name: { $regex: searchStr } }).toArray()
    }

    async deleteMedicalHistoryById(id: string): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).delete(resources.MEDICAL_HISTORY).granted)
            throw new Unauthorized()

        return await (await this.getMedicalHistoriesCollection()).deleteOne({ _id: new ObjectId(id) })
    }

    async deleteMedicalHistoryByName(name: string): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (!user)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(user.roleName).delete(resources.MEDICAL_HISTORY).granted)
            throw new Unauthorized()

        return await (await this.getMedicalHistoriesCollection()).deleteOne({ name: name })
    }
}
