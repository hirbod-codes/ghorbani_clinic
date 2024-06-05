import { ipcMain } from 'electron'
import { compareSync } from 'bcrypt'
import { Auth, User } from './auth-types'
import { readAuth } from '../../Config/config'

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

function getAuthenticatedUser(): User {
    return Auth.authenticatedUser
}

export function handleAuthEvents() {
    ipcMain.handle('get-authenticated-user', () => {
        return getAuthenticatedUser()
    })

    ipcMain.handle('login', (_e, { username, password }: { username: string, password: string }) => {
        return login(username, password)
    })

    ipcMain.handle('logout', () => {
        return logout()
    })
}
