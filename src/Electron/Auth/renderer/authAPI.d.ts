import { User } from "../auth-types";

export type authAPI = {
    getAuthenticatedUserPrivileges(): Promise<string[]>,
    getAuthenticatedUser: () => Promise<User>,
    login: (username: string, password: string) => Promise<boolean>,
    logout: () => Promise<boolean>,
}
