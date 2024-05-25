import { ipcMain } from 'electron'
import { compareSync } from 'bcrypt'
import { User } from './auth-types'
import { readAuth, writeAuth } from '../../Config/config'

function login(username: string, password: string): boolean {
    const auth = readAuth()

    for (let i = 0; i < auth.users.length; i++)
        if (auth.users[i].username === username && compareSync(password, auth.users[i].password)) {
            auth.authenticatedUserIndex = i
            writeAuth(auth)
            return true
        }

    return false
}

function logout(): boolean {
    try {
        const auth = readAuth()

        if (auth.authenticatedUserIndex != null) {
            auth.authenticatedUserIndex = null
            writeAuth(auth)
        }

        return true
    }
    catch (err) {
        return false
    }
}

function getAuthenticatedUser(): User {
    const auth = readAuth()

    if (auth.authenticatedUserIndex == null || auth.authenticatedUserIndex == undefined)
        return null
    else
        return new User(auth.users[auth.authenticatedUserIndex].username, auth.users[auth.authenticatedUserIndex].password)
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
