import { ipcRenderer } from "electron"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"
import { User } from "../../Models/User"
import { MainProcessResponse } from "../../../../Electron/types"

export function handleRendererEvents(): RendererEvents {
    return {
        createUser: async (user: User): Promise<MainProcessResponse<InsertOneResult<Document>>> => JSON.parse(await ipcRenderer.invoke('create-user', { user })),
        getUser: async (userId: string): Promise<MainProcessResponse<User | null>> => JSON.parse(await ipcRenderer.invoke('get-user', { userId })),
        getUsers: async (): Promise<MainProcessResponse<User[]>> => JSON.parse(await ipcRenderer.invoke('get-users')),
        updateUser: async (user: User): Promise<MainProcessResponse<UpdateResult>> => JSON.parse(await ipcRenderer.invoke('update-user', { user })),
        deleteUser: async (userId: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-user', { userId })),
    }
}

export type RendererEvents = {
    createUser: (user: User) => Promise<MainProcessResponse<InsertOneResult<Document>>>,
    getUser: (userId: string) => Promise<MainProcessResponse<User | null>>,
    getUsers: () => Promise<MainProcessResponse<User[]>>,
    updateUser: (user: User) => Promise<MainProcessResponse<UpdateResult>>,
    deleteUser: (userId: string) => Promise<MainProcessResponse<DeleteResult>>,
}
