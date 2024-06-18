import { MongoDB } from "../../mongodb";
import { User } from "../../Models/User";
import { IAuthRepository } from "../../dbAPI";

export class AuthRepository extends MongoDB implements IAuthRepository {
    async handleEvents(): Promise<void> {
    }

    login(username: string, password: string): boolean {
        throw new Error("Method not implemented.");
    }

    logout(): boolean {
        throw new Error("Method not implemented.");
    }

    getAuthenticatedUser(): User {
        throw new Error("Method not implemented.");
    }

    getAuthenticatedUserPrivileges(): string[] {
        throw new Error("Method not implemented.");
    }
}
