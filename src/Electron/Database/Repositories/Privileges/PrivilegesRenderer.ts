import { ipcRenderer } from "electron"
import { MainProcessResponse } from "../../../types"
import { DeleteResult, InsertOneResult, UpdateResult } from "mongodb"
import { Privilege } from "../../Models/Privilege"
import { AccessControl } from "accesscontrol"

export function handleRendererEvents(): RendererEvents {
    return {
        createPrivilege: async (privilege: Privilege): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-privilege', { privilege })),
        getPrivilege: async (roleName: string, action: string): Promise<MainProcessResponse<Privilege | null>> => JSON.parse(await ipcRenderer.invoke('get-privilege', { roleName, action })),
        getPrivileges: async (roleName?: string): Promise<MainProcessResponse<Privilege[] | AccessControl>> => JSON.parse(await ipcRenderer.invoke('get-privileges', { roleName })),
        updatePrivilege: async (privilege: Privilege): Promise<MainProcessResponse<UpdateResult> | undefined> => JSON.parse(await ipcRenderer.invoke('update-privilege', { privilege })),
        deletePrivilege: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-privilege', { id })),
    }
}

export type RendererEvents = {
    createPrivilege: (privilege: Privilege) => Promise<MainProcessResponse<InsertOneResult>>,
    getPrivilege: (roleName: string, action: string) => Promise<MainProcessResponse<Privilege | null>>,
    getPrivileges: (roleName?: string) => Promise<MainProcessResponse<Privilege[] | AccessControl>>,
    updatePrivilege: (privilege: Privilege) => Promise<MainProcessResponse<UpdateResult> | undefined>,
    deletePrivilege: (id: string) => Promise<MainProcessResponse<DeleteResult>>,
}
