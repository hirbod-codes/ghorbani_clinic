import { ipcMain } from 'electron'
import { compareSync } from 'bcrypt'
import { Auth, User } from './auth-types'
import { readAuth } from '../../Config/config'
import { getPrivileges } from './roles'

function login(username: string, password: string): boolean {
    const auth = readAuth()

    for (let i = 0; i < auth.users.length; i++)
        if (auth.users[i].username === username && compareSync(password, auth.users[i].password)) {
            Auth.authenticatedUser = new User(username, auth.users[i].password, auth.users[i].roleName)
            return true
        }

    return false
}

function logout(): boolean {
    Auth.authenticatedUser = null

    return true
}

function getAuthenticatedUser(): { username: string, roleName: string } | null {
    if (!Auth.authenticatedUser)
        return null
    return { username: Auth.authenticatedUser.username, roleName: Auth.authenticatedUser.roleName }
}

function getAuthenticatedUserPrivileges(): string[] {
    return getPrivileges(Auth.authenticatedUser.roleName)
}

export function handleAuthEvents() {
    ipcMain.handle('get-authenticated-user-privileges', () => getAuthenticatedUserPrivileges())

    ipcMain.handle('get-authenticated-user', () => getAuthenticatedUser())

    ipcMain.handle('login', (_e, { username, password }: { username: string, password: string }) => login(username, password))

    ipcMain.handle('logout', () => logout())
}
