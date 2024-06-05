import { RoleName } from "./roles"

export class Auth {
    static authenticatedUser: User | null = null
}

export class User {
    username: string
    password: string
    roleName: RoleName

    constructor(username: string, password: string, roleName: RoleName) {
        this.username = username
        this.roleName = roleName
    }
}
