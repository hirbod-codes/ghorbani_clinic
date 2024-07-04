import { DeleteResult, InsertManyResult, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { Privilege, privilegeSchema, updatableFields } from "../../Models/Privilege";
import { IPrivilegesRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { Unauthenticated } from "../../Unauthenticated";
import { AccessControl } from "accesscontrol";
import { roles } from "../Auth/dev-permissions";
import { resources } from "../Auth/resources";
import { Unauthorized } from "../../Unauthorized";
import { DateTime } from "luxon";
import { ipcMain } from "electron";
import { authRepository } from "../../handleDbEvents";

export class PrivilegesRepository extends MongoDB implements IPrivilegesRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-role', async (_e, { privileges }: { privileges: Privilege[] }) => await this.handleErrors(async () => await this.createRole(privileges)))
        ipcMain.handle('create-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.createPrivilege(privilege)))
        ipcMain.handle('get-privilege', async (_e, { roleName, action }: { roleName: string, action: string }) => await this.handleErrors(async () => await this.getPrivilege(roleName, action)))
        ipcMain.handle('get-roles', async () => await this.handleErrors(async () => await this.getRoles()))
        ipcMain.handle('get-access-control', async () => await this.handleErrors(async () => await this.getAccessControl()))
        ipcMain.handle('get-privileges', async () => await this.handleErrors(async () => await this.getPrivileges()))
        ipcMain.handle('update-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.updatePrivilege(privilege)))
        ipcMain.handle('update-privileges', async (_e, { privileges }: { privileges: Privilege[] }) => await this.handleErrors(async () => await this.updatePrivileges(privileges)))
        ipcMain.handle('update-role', async (_e, { privileges }: { privileges: Privilege[] }) => await this.handleErrors(async () => await this.updateRole(privileges)))
        ipcMain.handle('delete-privilege', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deletePrivilege(id)))
        ipcMain.handle('delete-privileges', async (_e, { ids }: { ids: string[] }) => await this.handleErrors(async () => await this.deletePrivileges(ids)))
        ipcMain.handle('delete-role', async (_e, { roleName }: { roleName: string }) => await this.handleErrors(async () => await this.deleteRole(roleName)))
    }

    private formatRolePrivileges(privileges: Privilege[]): Privilege[] {
        const ts = DateTime.utc().toUnixInteger()
        for (let i = 0; i < privileges.length; i++) {
            if (i !== 0 && privileges[i].role !== privileges[i - 1].role)
                throw new Error('Invalid privilege role name provided.');

            if (!privilegeSchema.isValidSync(privileges[i]))
                throw new Error('Invalid privilege info provided.');

            privileges[i] = privilegeSchema.cast(privileges[i]);
            privileges[i].schemaVersion = 'v0.0.1';
            privileges[i].createdAt = ts;
            privileges[i].updatedAt = ts;
        }
        return privileges
    }

    async createRole(privileges: Privilege[]): Promise<InsertManyResult> {
        const funcName = 'createRole'

        console.log(funcName, 'called')

        console.log(funcName, 'privileges', JSON.stringify(privileges, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).create(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = await (await this.getPrivilegesCollection()).insertMany(this.formatRolePrivileges(privileges));
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async createPrivilege(privilege: Privilege): Promise<InsertOneResult> {
        const funcName = 'createPrivilege'

        console.log(funcName, 'called')

        console.log(funcName, 'privilege', JSON.stringify(privilege, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).create(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        if (!privilegeSchema.isValidSync(privilege))
            throw new Error('Invalid privilege info provided.');
        console.log(funcName, 'arguments validated')

        privilege = privilegeSchema.cast(privilege);
        privilege.schemaVersion = 'v0.0.1';
        privilege.createdAt = DateTime.utc().toUnixInteger();
        privilege.updatedAt = DateTime.utc().toUnixInteger();

        console.log(funcName, 'casted privilege', JSON.stringify(privilege, undefined, 4))

        const result = await (await this.getPrivilegesCollection()).insertOne(privilege);
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async getPrivilege(roleName: string, action: string): Promise<Privilege | null> {
        const funcName = 'getPrivilege'

        console.log(funcName, 'called')

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).read(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = await (await this.getPrivilegesCollection()).findOne({ role: roleName, action: action });
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async getRoles(): Promise<string[]> {
        const funcName = 'getRoles'

        console.log(funcName, 'called')

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).read(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const privileges = await (await this.getPrivilegesCollection()).find().toArray();
        console.log(funcName, 'privileges', JSON.stringify(privileges))

        const roles: string[] = [];
        privileges
            .forEach(p => {
                if (roles.find(r => r === p.role) === undefined)
                    roles.push(p.role)
            })

        console.log(funcName, 'roles', roles)
        return roles
    }

    async getAccessControl(): Promise<AccessControl> {
        const funcName = 'getAccessControl'

        console.log(funcName, 'called')

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        const privileges = await this.getPrivileges();
        console.log(funcName, 'privileges', JSON.stringify(privileges))

        return new AccessControl((privileges))
    }

    async getPrivileges(): Promise<Privilege[]> {
        const funcName = 'getPrivileges'

        console.log(funcName, 'called')

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        const privileges = await (await this.getPrivilegesCollection()).find().toArray();
        console.log(funcName, 'privileges', JSON.stringify(privileges))

        return privileges
    }

    async updatePrivilege(privilege: Privilege): Promise<UpdateResult | undefined> {
        const funcName = 'updatePrivilege'

        console.log('updatePrivilege', 'called')

        console.log(funcName, 'privilege', JSON.stringify(privilege, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        if (privilege.role === roles.ADMIN)
            return undefined

        if (!privilege._id)
            throw new Error('id field is not provided, to update the privilege')

        const id = privilege._id
        privilege = Object.fromEntries(Object.entries(privilege).filter(arr => updatableFields.includes(arr[0] as any)))
        privilege.updatedAt = DateTime.utc().toUnixInteger()

        console.log(funcName, 'casted privilege', JSON.stringify(privilege, undefined, 4))

        const result = await (await this.getPrivilegesCollection()).updateOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } }, { $set: { ...privilege } });
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async updateRole(privileges: Privilege[]): Promise<boolean> {
        const funcName = 'updateRole'

        console.log('updateRole', 'called')

        console.log(funcName, 'privileges', JSON.stringify(privileges, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        this.startTransaction()
        try {
            privileges = this.formatRolePrivileges(privileges)
            console.log(funcName, 'formatted privileges', JSON.stringify(privileges, undefined, 4))

            const privilegesCollection = await this.getPrivilegesCollection(this.transactionClient)

            const deleteResult = await privilegesCollection.deleteMany({ $and: [{ role: { $ne: roles.ADMIN } }, { role: privileges[0].role }] }, { session: this.session })
            console.log(funcName, 'deleteResult', JSON.stringify(deleteResult, undefined, 4))
            if (!deleteResult.acknowledged) {
                console.log(funcName, 'aborting...')
                await this.abortTransaction()
                return false
            }

            const createResult = await privilegesCollection.insertMany(privileges, { session: this.session })
            console.log(funcName, 'createResult', JSON.stringify(createResult, undefined, 4))
            if (!createResult.acknowledged && createResult.insertedCount <= 0) {
                console.log(funcName, 'aborting...')
                await this.abortTransaction()
                return false
            }

            console.log(funcName, 'committing...')
            await this.commitTransaction()
            return true
        }
        catch (err) {
            console.log(funcName, 'aborting...')
            await this.abortTransaction()
            throw err
        }
        finally { await this.endSession() }
    }

    async updatePrivileges(privileges: Privilege[]): Promise<boolean> {
        const funcName = 'updatePrivileges'

        console.log(funcName, 'called')

        console.log(funcName, 'privileges', JSON.stringify(privileges, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated();
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        this.startTransaction()
        try {
            for (let i = 0; i < privileges.length; i++) {
                const id = privileges[i]._id
                privileges[i] = Object.fromEntries(Object.entries(privileges[i]).filter(arr => updatableFields.includes(arr[0] as any)))
                privileges[i].updatedAt = DateTime.utc().toUnixInteger()
                console.log(funcName, 'casted privileges[i]', JSON.stringify(privileges[i], undefined, 4))

                const result = await (await this.getPrivilegesCollection(this.transactionClient)).updateOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } }, { $set: { ...privileges[i] } }, { session: this.session })
                console.log(funcName, 'result', JSON.stringify(result, undefined, 4))
            }

            console.log(funcName, 'committing...')
            await this.commitTransaction()
            return true
        }
        catch (err) {
            console.log(funcName, 'aborting...')
            await this.abortTransaction()
            return false
        }
        finally { await this.endSession() }
    }

    async deletePrivilege(id: string): Promise<DeleteResult> {
        const funcName = 'deletePrivilege'

        console.log(funcName, 'called')

        console.log(funcName, 'id', JSON.stringify(id, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = await (await this.getPrivilegesCollection()).deleteOne({ _id: new ObjectId(id), role: { $ne: roles.ADMIN } })
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async deleteRole(roleName: string): Promise<DeleteResult> {
        const funcName = 'deleteRole'

        console.log(funcName, 'called')

        console.log(funcName, 'roleName', JSON.stringify(roleName, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = await (await this.getPrivilegesCollection()).deleteMany({ $and: [{ role: { $ne: roles.ADMIN } }, { role: roleName }] })
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async deletePrivileges(ids: string[]): Promise<DeleteResult> {
        const funcName = 'deletePrivileges'

        console.log(funcName, 'called')

        console.log(funcName, 'ids', JSON.stringify(ids, undefined, 4))

        const user = await authRepository.getAuthenticatedUser()
        if (user == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await this.getAccessControl()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = await (await this.getPrivilegesCollection()).deleteMany({ $and: [{ _id: { $in: ids.map(id => new ObjectId(id)) } }, { role: { $ne: roles.ADMIN } }] })
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }
}
