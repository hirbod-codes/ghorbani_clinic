import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { hashSync, compareSync } from 'bcrypt'
import { User } from './auth-types'

const authFile = path.join(app.getAppPath(), 'src', 'Config', 'users.json')

function persistAuth(auth: { authenticatedUserIndex: number | null, users: User[] } = {
    authenticatedUserIndex: null,
    users: [
        { username: 'Ghorbani', password: hashSync('adminPass', 10) },
        { username: 'Secretary', password: hashSync('secretaryPass', 10) },
    ]
}): void {
    fs.writeFileSync(authFile, JSON.stringify(auth))
}

function login(username: string, password: string): boolean {
    if (!fs.existsSync(authFile))
        persistAuth()
    else {
        const authJson = fs.readFileSync(authFile).toString()
        const auth = JSON.parse(authJson)
        for (let i = 0; i < auth.users.length; i++)
            if (auth.users[i].username === username && compareSync(password, auth.users[i].password)) {
                auth.authenticatedUserIndex = i
                persistAuth(auth)
                return true
            }
    }

    return false
}

function logout(): boolean {
    try {
        if (!fs.existsSync(authFile))
            persistAuth()
        else {
            const authJson = fs.readFileSync(authFile).toString()
            const auth = JSON.parse(authJson)
            auth.authenticatedUserIndex = null
            persistAuth(auth)
        }

        return true
    }
    catch (err) {
        return false
    }
}

function getAuthenticatedUser(): User {
    const authJson = fs.readFileSync(authFile).toString()
    const auth = JSON.parse(authJson)

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
