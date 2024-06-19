import { DeleteResult, Document, InsertOneResult, UpdateResult } from "mongodb";
import { MongoDB } from "../../mongodb";
import { User, updatableFields, userSchema } from "../../Models/User";
import { IUsersRepository } from "../../dbAPI";
import { Auth } from "../Auth/Auth";
import { Unauthenticated } from "../../Unauthenticated";
import { Unauthorized } from "../../Unauthorized";
import { privilegesRepository } from "../../handleDbEvents";
import { resources, roles } from "../Auth/dev-permissions";
import { DateTime } from "luxon";
import { extractKeys, extractKeysRecursive } from "../../helpers";
import { getFields } from "../../Models/helpers";
import { ipcMain } from "electron";

export class UsersRepository extends MongoDB implements IUsersRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-user', async (_e, { user }: { user: User }) => await this.handleErrors(async () => await this.createUser(user)))
        ipcMain.handle('get-user', async (_e, { userId }: { userId: string }) => await this.handleErrors(async () => await this.getUser(userId)))
        ipcMain.handle('get-users', async (_e) => await this.handleErrors(async () => await this.getUsers()))
        ipcMain.handle('update-user', async (_e, { user }: { user: User }) => await this.handleErrors(async () => await this.updateUser(user)))
        ipcMain.handle('delete-user', async (_e, { userId }: { userId: string }) => await this.handleErrors(async () => await this.deleteUser(userId)))
    }

    async createUser(user: User): Promise<InsertOneResult<Document>> {
        if (user.roleName === roles.ADMIN)
            throw new Unauthorized()

        const authenticated = Auth.getAuthenticated();
        if (authenticated == null)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getPrivileges()).can(authenticated.roleName).create(resources.USER).granted)
            throw new Unauthorized()

        if (!userSchema.isValidSync(user))
            throw new Error('Invalid user info provided.');

        user = userSchema.cast(user);
        user.schemaVersion = 'v0.0.1';
        user.createdAt = DateTime.utc().toUnixInteger();
        user.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getUsersCollection()).insertOne(user)
    }

    async getUser(userId: string): Promise<User | null> {
        const authenticated = Auth.getAuthenticated();
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const user = (await (await this.getUsersCollection()).findOne({ _id: userId }))
        if (!user)
            return null

        if (!userSchema.isValidSync(user))
            throw new Error('Invalid patient info provided.');

        const readableUser = extractKeys(user, permission.attributes)
        return readableUser
    }

    async getUsers(): Promise<User[]> {
        const authenticated = Auth.getAuthenticated();
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const users = await (await this.getUsersCollection()).find().toArray()

        const readableUser = extractKeysRecursive(users, permission.attributes)

        return readableUser
    }

    async updateUser(user: User): Promise<UpdateResult> {
        const authenticated = Auth.getAuthenticated();
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        const permission = privileges.can(authenticated.roleName).update(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const id = user._id;

        user = Object.fromEntries(Object.entries(user).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(user).forEach(k => {
            if (!getFields(updatableFields, permission.attributes).includes(k))
                throw new Unauthorized();
        });

        user.updatedAt = DateTime.utc().toUnixInteger();

        return (await (await this.getUsersCollection()).updateOne({ _id: id }, user, { upsert: false }))

    }

    async deleteUser(userId: string): Promise<DeleteResult> {
        const user = Auth.getAuthenticated();
        if (!user)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getPrivileges();
        if (!privileges.can(user.roleName).delete(resources.USER).granted)
            throw new Unauthorized()

        return (await (await this.getUsersCollection()).deleteOne({ _id: userId }))
    }
}
