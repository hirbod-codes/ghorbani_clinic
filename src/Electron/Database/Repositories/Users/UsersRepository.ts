import { DeleteResult, Document, InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { MongoDB } from "../../mongodb";
import { User, readableFields, updatableFields, userSchema } from "../../Models/User";
import { IUsersRepository } from "../../dbAPI";
import { Unauthenticated } from "../../Unauthenticated";
import { Unauthorized } from "../../Unauthorized";
import { authRepository, privilegesRepository } from "../../handleDbEvents";
import { roles } from "../Auth/dev-permissions";
import { resources } from "../Auth/resources";
import { DateTime } from "luxon";
import { extractKeys, extractKeysRecursive } from "../../helpers";
import { getFields } from "../../Models/helpers";
import { ipcMain } from "electron";
import { hashSync } from "bcrypt";

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

        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        if (!(await privilegesRepository.getAccessControl()).can(authenticated.roleName).create(resources.USER).granted)
            throw new Unauthorized()

        if (!userSchema.isValidSync(user))
            throw new Error('Invalid user info provided.');

        user.schemaVersion = 'v0.0.1';
        user = userSchema.cast(user);
        user.password = hashSync(user.password, 10);
        user.createdAt = DateTime.utc().toUnixInteger();
        user.updatedAt = DateTime.utc().toUnixInteger();

        return await (await this.getUsersCollection()).insertOne(user)
    }

    async getUser(userId: string): Promise<User | null> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const user = (await (await this.getUsersCollection()).findOne({ _id: new ObjectId(userId) }))
        if (!user)
            return null

        if (!userSchema.isValidSync(user))
            throw new Error('Invalid patient info provided.');

        const readableUser = extractKeys(user, getFields(readableFields, permission.attributes))
        return readableUser
    }

    async getUsers(): Promise<User[]> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const users = await (await this.getUsersCollection()).find({ roleName: { $ne: roles.ADMIN } }).toArray()

        const readableUser = extractKeysRecursive(users, getFields(readableFields, permission.attributes))

        return readableUser
    }

    async updateUser(user: User): Promise<UpdateResult> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).update(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()

        const id = user._id.toString();

        user = Object.fromEntries(Object.entries(user).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(user).forEach(k => {
            if (!getFields(updatableFields, permission.attributes).includes(k))
                throw new Unauthorized();
        });

        user.updatedAt = DateTime.utc().toUnixInteger();

        const result = (await (await this.getUsersCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { ...user } }, { upsert: false }))

        if (result.acknowledged && result.matchedCount === 1)
            if ((await authRepository.getAuthenticatedUser())?._id.toString() === id)
                await authRepository.updateAuthenticatedUser(id)

        return result
    }

    async deleteUser(userId: string): Promise<DeleteResult> {
        const authenticated = await authRepository.getAuthenticatedUser()
        if (!authenticated)
            throw new Unauthenticated();

        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(authenticated.roleName).delete(resources.USER).granted)
            throw new Unauthorized()

        return (await (await this.getUsersCollection()).deleteOne({ _id: new ObjectId(userId), roleName: { $ne: roles.ADMIN } }))
    }
}
