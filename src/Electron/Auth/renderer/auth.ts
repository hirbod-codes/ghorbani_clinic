import { ipcRenderer } from 'electron'
import { User } from '../auth-types'

export async function getAuthenticatedUserPrivileges(): Promise<string[]> {
    return await ipcRenderer.invoke('get-authenticated-user-privileges')
}

export async function getAuthenticatedUser(): Promise<User | null> {
    return await ipcRenderer.invoke('get-authenticated-user')
}

export async function login(username: string, password: string): Promise<boolean> {
    return await ipcRenderer.invoke('login', { username, password })
}

export async function logout(): Promise<boolean> {
    return await ipcRenderer.invoke('logout')
}
