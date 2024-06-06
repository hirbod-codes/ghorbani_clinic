import { RoleName } from "./roles"

export class Auth {
    static authenticatedUser: User | null = null
}

export class User {
    username: string
    password?: string
    roleName: RoleName
    privileges: string[]

    constructor(username: string, roleName: RoleName, privileges: string[]) {
        this.username = username
        this.roleName = roleName
        this.privileges = privileges
    }
}
