import { DeleteResult, Document, InsertOneResult, MongoTopologyClosedError, ObjectId, UpdateResult } from "mongodb";
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
import { hashSync } from "bcryptjs";

export class UsersRepository extends MongoDB implements IUsersRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('create-user', async (_e, { user }: { user: User }) => await this.handleErrors(async () => await this.createUser(user)))
        ipcMain.handle('get-user', async (_e, { userId }: { userId: string }) => await this.handleErrors(async () => await this.getUser(userId)))
        ipcMain.handle('get-users', async (_e) => await this.handleErrors(async () => await this.getUsers()))
        ipcMain.handle('update-user', async (_e, { user }: { user: User }) => await this.handleErrors(async () => await this.updateUser(user)))
        ipcMain.handle('delete-user', async (_e, { userId }: { userId: string }) => await this.handleErrors(async () => await this.deleteUser(userId)))
    }

    async createUser(user: User): Promise<InsertOneResult<Document>> {
        const funcName = 'createUser'

        console.log(funcName, 'called')

        console.log(funcName, 'user', JSON.stringify(user, undefined, 4))

        if (user.roleName === roles.ADMIN)
            throw new Unauthorized()

        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', user.roleName)
        if (!(await privilegesRepository.getAccessControl()).can(authenticated.roleName).create(resources.USER).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        if (!userSchema.isValidSync(user))
            throw new Error('Invalid user info provided.')
        console.log(funcName, 'user validated')

        user.schemaVersion = 'v0.0.1';
        user = userSchema.cast(user);
        user.password = hashSync(user.password, 10);
        user.createdAt = DateTime.utc().toUnixInteger();
        user.updatedAt = DateTime.utc().toUnixInteger();

        console.log(funcName, 'casted user', JSON.stringify(user, undefined, 4))

        const result = await (await this.getUsersCollection()).insertOne(user)
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }

    async getUser(userId: string): Promise<User | null> {
        const funcName = 'getUser'

        console.log(funcName, 'called')

        console.log(funcName, 'userId', JSON.stringify(userId, undefined, 4))

        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', authenticated.roleName)
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const user = (await (await this.getUsersCollection()).findOne({ _id: new ObjectId(userId) }))
        if (!user)
            return null
        console.log(funcName, 'The user is found')

        const readableUser = extractKeys(user, getFields(readableFields, permission.attributes))
        console.log(funcName, 'readableUser', JSON.stringify(readableUser, undefined, 4))

        return readableUser
    }

    async getUsers(): Promise<User[]> {
        const funcName = 'getUsers'

        console.log(funcName, 'called')

        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', authenticated.roleName)
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).read(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const users = await (await this.getUsersCollection()).find({ roleName: { $ne: roles.ADMIN } }).toArray()
        console.log(funcName, 'users', JSON.stringify(users, undefined, 4))

        const readableUsers = extractKeysRecursive(users, getFields(readableFields, permission.attributes))
        console.log(funcName, 'readableUsers', JSON.stringify(readableUsers, undefined, 4))

        return readableUsers
    }

    async updateUser(user: User): Promise<UpdateResult> {
        const funcName = 'updateUser'

        console.log(funcName, 'called')

        console.log(funcName, 'user', JSON.stringify(user, undefined, 4))

        const authenticated = await authRepository.getAuthenticatedUser()
        if (authenticated == null)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', authenticated.roleName)
        const privileges = await privilegesRepository.getAccessControl();
        const permission = privileges.can(authenticated.roleName).update(resources.USER);
        if (!permission.granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const id = user._id.toString();

        user = Object.fromEntries(Object.entries(user).filter(arr => (updatableFields as string[]).includes(arr[0])));
        Object.keys(user).forEach(k => {
            if (!getFields(updatableFields, permission.attributes).includes(k))
                throw new Unauthorized();
        });

        user.updatedAt = DateTime.utc().toUnixInteger();

        console.log(funcName, 'casted user update', JSON.stringify(user, undefined, 4))

        const result = (await (await this.getUsersCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { ...user } }, { upsert: false }))
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        console.log(funcName, 'update logged in user if successful')
        if (result.acknowledged && result.matchedCount === 1)
            if ((await authRepository.getAuthenticatedUser())?._id.toString() === id)
                await authRepository.updateAuthenticatedUser(id)

        console.log(funcName, 'return')
        return result
    }

    async deleteUser(userId: string): Promise<DeleteResult> {
        const funcName = 'deleteUser'

        console.log(funcName, 'called')

        console.log(funcName, 'userId', JSON.stringify(userId, undefined, 4))

        const authenticated = await authRepository.getAuthenticatedUser()
        if (!authenticated)
            throw new Unauthenticated()
        console.log(funcName, 'authenticated')

        console.log(funcName, 'user.roleName', authenticated.roleName)
        const privileges = await privilegesRepository.getAccessControl();
        if (!privileges.can(authenticated.roleName).delete(resources.USER).granted)
            throw new Unauthorized()
        console.log(funcName, 'authorized')

        const result = (await (await this.getUsersCollection()).deleteOne({ _id: new ObjectId(userId), roleName: { $ne: roles.ADMIN } }))
        console.log(funcName, 'result', JSON.stringify(result, undefined, 4))

        return result
    }
}
