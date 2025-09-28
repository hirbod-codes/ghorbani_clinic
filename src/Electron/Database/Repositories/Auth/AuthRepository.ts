import { MongoDB } from "../../mongodb";
import { User } from "../../Models/User";
import { IAuthRepository } from "../../dbAPI";
import { compareSync } from "bcryptjs";
import { Auth } from "./Auth";
import { DateTime } from "luxon";
import { ipcMain } from "electron";
import { ObjectId } from "mongodb";

export class AuthRepository extends MongoDB implements IAuthRepository {
    async handleEvents(): Promise<void> {
        ipcMain.handle('login', async (_e, { username, password }: { username: string, password: string }) => await this.handleErrors(async () => await this.login(username, password)))
        ipcMain.handle('logout', async (_e) => await this.handleErrors(async () => await this.logout()))
        ipcMain.handle('get-authenticated-user', async (_e) => await this.handleErrors(async () => await this.getAuthenticatedUser()))
    }

    async login(username: string, password: string): Promise<boolean> {
        const user = await (await this.getUsersCollection()).findOne({ username: username });
        console.log(user)
        if (user && compareSync(password, user.password)) {
            Auth.authenticatedUser = user
            Auth.authenticatedAt = DateTime.utc().toUnixInteger()
            return true
        }
        else
            return false
    }

    async logout(): Promise<boolean> {
        Auth.authenticatedUser = null
        Auth.authenticatedAt = null

        return true
    }

    async getAuthenticatedUser(): Promise<User | null> {
        return Auth.authenticatedUser
    }

    async updateAuthenticatedUser(id: string): Promise<void> {
        Auth.authenticatedUser = await (await this.getUsersCollection()).findOne({ _id: new ObjectId(id) })
    }
}
