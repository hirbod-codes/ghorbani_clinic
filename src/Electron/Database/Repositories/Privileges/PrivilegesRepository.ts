import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb";
import { Privilege, privilegeSchema } from "../../Models/Privilege";
import { IPrivilegesRepository } from "../../dbAPI";
import { MongoDB } from "../../mongodb";
import { Unauthenticated } from "../../Unauthenticated";
import { AccessControl } from "accesscontrol";
import { resources, roles } from "../Auth/dev-permissions";
import { Unauthorized } from "../../Unauthorized";
import { DateTime } from "luxon";
import { Auth } from "../Auth/Auth";
import { ipcMain } from "electron";

export class PrivilegesRepository extends MongoDB implements IPrivilegesRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.createPrivilege(privilege)))
        ipcMain.handle('get-privilege', async (_e, { roleName, action }: { roleName: string, action: string }) => await this.handleErrors(async () => await this.getPrivilege(roleName, action)))
        ipcMain.handle('get-privileges', async (_e, { roleName }: { roleName?: string }) => await this.handleErrors(async () => await this.getPrivileges(roleName)))
        ipcMain.handle('update-privilege', async (_e, { privilege }: { privilege: Privilege }) => await this.handleErrors(async () => await this.updatePrivilege(privilege)))
        ipcMain.handle('delete-privilege', async (_e, { id }: { id: string }) => await this.handleErrors(async () => await this.deletePrivilege(id)))
    }

    async createPrivilege(privilege: Privilege): Promise<InsertOneResult> {
        const user = Auth.getAuthenticated();
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getPrivileges()).can(user.roleName).create(resources.PRIVILEGE).granted)
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
        const user = Auth.getAuthenticated();
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getPrivileges()).can(user.roleName).read(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        return await (await this.getPrivilegesCollection()).findOne({ role: roleName, action: action })
    }

    async getPrivileges(): Promise<AccessControl>
    async getPrivileges(roleName: string): Promise<Privilege[]>
    async getPrivileges(roleName?: string): Promise<Privilege[] | AccessControl> {
        const user = Auth.getAuthenticated();
        if (user == null)
            throw new Unauthenticated();

        const privilege = await (await this.getPrivilegesCollection()).findOne({ role: roleName, action: 'read:any', attributes: '*' })
        if (!privilege)
            throw new Unauthorized()

        if (!roleName) {
            const privileges = await (await this.getPrivilegesCollection()).find().toArray()
            return new AccessControl(privileges)
        }

        return await (await this.getPrivilegesCollection()).find({ role: roleName }).toArray()
    }

    async updatePrivilege(privilege: Privilege): Promise<UpdateResult | undefined> {
        const user = Auth.getAuthenticated();
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getPrivileges()).can(user.roleName).update(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        if (privilege.role === roles.ADMIN)
            return undefined
    }

    async deletePrivilege(id: string): Promise<DeleteResult> {
        const user = Auth.getAuthenticated();
        if (user == null)
            throw new Unauthenticated();

        if (!(await this.getPrivileges()).can(user.roleName).delete(resources.PRIVILEGE).granted)
            throw new Unauthorized()

        return await (await this.getPatientsCollection()).deleteOne({ _id: id, role: { $ne: roles.ADMIN } })
    }
}
