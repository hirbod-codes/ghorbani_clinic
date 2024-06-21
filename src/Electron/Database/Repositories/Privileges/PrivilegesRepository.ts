import { DeleteResult, Document, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { Privilege, privilegeSchema, updatableFields } from "../../Models/Privilege";
import { IPrivilegesRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { Unauthenticated } from "../../Unauthenticated";
import { AccessControl } from "accesscontrol";
import { resources, roles } from "../Auth/dev-permissions";
import { Unauthorized } from "../../Unauthorized";
import { DateTime } from "luxon";
import { ipcMain } from "electron";
import { authRepository } from "../../handleDbEvents";
import { array, string } from "yup";

export class PrivilegesRepository extends MongoDB implements IPrivilegesRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.createPrivilege(privilege)))
        ipcMain.handle('get-privilege', async (_e, { roleName, action }: { roleName: string, action: string }) => await this.handleErrors(async () => await this.getPrivilege(roleName, action)))
        ipcMain.handle('get-roles', async () => await this.handleErrors(async () => await this.getRoles()))
        ipcMain.handle('get-access-control', async () => await this.handleErrors(async () => await this.getAccessControl()))
        ipcMain.handle('get-privileges', async (_e, { roleName }: { roleName?: string }) => await this.handleErrors(async () => await this.getPrivileges(roleName)))
        ipcMain.handle('update-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.updatePrivilege(privilege)))
        ipcMain.handle('update-privileges', async (_e, { privileges }: { privileges: Privilege[] }) => await this.handleErrors(async () => await this.updatePrivileges(privileges)))
        ipcMain.handle('delete-privilege', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deletePrivilege(id)))
        ipcMain.handle('delete-privileges', async (_e, { arg }: { arg: string | string[] }) => await this.handleErrors(async () => await this.deletePrivileges(arg as any)))
    }

    async createPrivilege(privilege: Privilege): Promise<InsertOneResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).create(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        if (!privilegeSchema.isValidSync(privilege))
            throw new Error('Invalid privilege info provided.');

        privilege = privilegeSchema.cast(privilege);
        privilege.schemaVersion = 'v0.0.1';
        privilege.createdAt = DateTime.utc().toUnixInteger();
        privilege.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getPrivilegesCollection()).insertOne(privilege)
    }

    async getPrivilege(roleName: string, action: string): Promise<Privilege | null> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).read(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        return await (await this.getPrivilegesCollection()).findOne({ role: roleName, action: action })
    }

    async getRoles(): Promise<string[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).read(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        const roles: string[] = [];
        (await (await this.getPrivilegesCollection()).find().toArray())
            .forEach(p => {
                if (roles.find(r => r === p.role) === undefined)
                    roles.push(p.role)
            })
        return roles
    }

    async getAccessControl(): Promise<AccessControl> {
        return new AccessControl((await this.getPrivileges()))
    }

    async getPrivileges(roleName?: string): Promise<Privilege[]> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        const privilege = await (await this.getPrivilegesCollection()).findOne({ role: user.roleName, action: 'read:any', resource: resources.PRIVILEGE, attributes: '*' })
        if (!privilege)
            throw new Unauthorized()

        if (!roleName)
            return await (await this.getPrivilegesCollection()).find().toArray()

        return await (await this.getPrivilegesCollection()).find({ role: roleName }).toArray()
    }

    async updatePrivilege(privilege: Privilege): Promise<UpdateResult | undefined> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        if (privilege.role === roles.ADMIN)
            return undefined

        if (!privilege._id)
            throw new Error('id field is not provided, to update the privilege')

        const id = privilege._id
        privilege = Object.fromEntries(Object.entries(privilege).filter(arr => updatableFields.includes(arr[0] as any)))
        privilege.updatedAt = DateTime.utc().toUnixInteger()

        return await (await this.getPrivilegesCollection()).updateOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } }, { $set: { ...privilege } })
    }

    async updatePrivileges(privileges: Privilege[]): Promise<boolean> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        const client = this.getClient()
        const session = client.startSession()
        try {
            for (let i = 0; i < privileges.length; i++) {
                const id = privileges[i]._id
                privileges[i] = Object.fromEntries(Object.entries(privileges[i]).filter(arr => updatableFields.includes(arr[0] as any)))
                privileges[i].updatedAt = DateTime.utc().toUnixInteger()

                await (await this.getPrivilegesCollection(client)).updateOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } }, { $set: { ...privileges[i] } }, { session })
            }

            await session.commitTransaction()
            return true
        }
        catch (err) {
            await session.abortTransaction()
            console.error(err);
            return false
        }
        finally { await session.endSession() }
    }

    async deletePrivilege(id: string): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        return await (await this.getPrivilegesCollection()).deleteOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } })
    }

    deletePrivileges(ids: string[]): Promise<DeleteResult>
    deletePrivileges(roleName: string): Promise<DeleteResult>
    async deletePrivileges(arg: string | string[]): Promise<DeleteResult> {
        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getAccessControl()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        if (array().required().of(string().required()).isValidSync(arg))
            return await (await this.getPrivilegesCollection()).deleteMany({ $and: [{ _id: { $in: (arg as string[]).map(arg => new ObjectId(arg)) } }, { role: { $ne: roles.ADMIN } }] })
        else
            return await (await this.getPrivilegesCollection()).deleteMany({ $and: [{ role: arg }, { role: { $ne: roles.ADMIN } }] })
    }
}
