export class Auth {
    static authenticatedUser: User | null = null
}

export class User {
    username: string
    password: string

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}
