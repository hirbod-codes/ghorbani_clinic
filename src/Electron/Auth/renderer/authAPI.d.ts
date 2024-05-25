export type authAPI = {
    getAuthenticatedUser: () => Promise<User>,
    login: (username: string, password: string) => Promise<boolean>,
    logout: () => Promise<boolean>,
}
