import { ipcRenderer } from "electron"
import { User } from "../../Models/User"
import { MainProcessResponse } from "../../../types"

export function handleRendererEvents(): handleRendererEvents {
    return {
        login: async (username: string, password: string): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('login', { username, password })),
        logout: async (): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('logout')),
        getAuthenticatedUser: async (): Promise<MainProcessResponse<User | null>> => JSON.parse(await ipcRenderer.invoke('get-authenticated-user')),
    }
}

export type handleRendererEvents = {
    login: (username: string, password: string) => Promise<MainProcessResponse<boolean>>,
    logout: () => Promise<MainProcessResponse<boolean>>,
    getAuthenticatedUser: () => Promise<MainProcessResponse<User | null>>,
}
