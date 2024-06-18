import { ipcMain } from 'electron'
import { compareSync } from 'bcrypt'
import { readConfig } from '../Configuration/configuration'
import { User } from '../Database/Models/User'

function login(username: string, password: string): boolean {
    const auth = readConfig()?.auth

    if (!auth)
        return false

    for (let i = 0; i < auth.users.length; i++)
        if (auth.users[i].username === username && compareSync(password, auth.users[i].password)) {
            Auth.authenticatedUser = new User(username, auth.users[i].roleName, getPrivileges(auth.users[i].roleName))
            return true
        }

    return false
}

function logout(): boolean {
    Auth.authenticatedUser = null

    return true
}

function getAuthenticatedUser(): User | null {
    if (!Auth.authenticatedUser)
        return null
    return Auth.authenticatedUser
}

function getAuthenticatedUserPrivileges(): string[] | null {
    if (Auth.authenticatedUser)
        return getPrivileges(Auth.authenticatedUser.roleName)
    else
        return null
}

export function handleAuthEvents() {
    ipcMain.handle('get-authenticated-user-privileges', () => getAuthenticatedUserPrivileges())

    ipcMain.handle('get-authenticated-user', () => getAuthenticatedUser())

    ipcMain.handle('login', (_e, { username, password }: { username: string, password: string }) => login(username, password))

    ipcMain.handle('logout', () => logout())
}
