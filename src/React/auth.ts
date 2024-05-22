class Auth {
    static User: User | null
}

class User {
    username: string
    password: string

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}
