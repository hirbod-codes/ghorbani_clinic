import { ipcRenderer } from "electron"
import { MainProcessResponse } from "../../../types"
import { DeleteResult, InsertManyResult, InsertOneResult, UpdateResult } from "mongodb"
import { Privilege } from "../../Models/Privilege"
import { AccessControl } from "accesscontrol"

export function handleRendererEvents(): RendererEvents {
    return {
        createRole: async (privileges: Privilege[]): Promise<MainProcessResponse<InsertManyResult>> => JSON.parse(await ipcRenderer.invoke('create-role', { privileges })),
        createPrivilege: async (privilege: Privilege): Promise<MainProcessResponse<InsertOneResult>> => JSON.parse(await ipcRenderer.invoke('create-privilege', { privilege })),
        getAccessControl: async (): Promise<MainProcessResponse<AccessControl>> => JSON.parse(await ipcRenderer.invoke('get-access-control')),
        getPrivilege: async (roleName: string, action: string): Promise<MainProcessResponse<Privilege | null>> => JSON.parse(await ipcRenderer.invoke('get-privilege', { roleName, action })),
        getRoles: async (): Promise<MainProcessResponse<string[]>> => JSON.parse(await ipcRenderer.invoke('get-roles')),
        getPrivileges: async (roleName?: string): Promise<MainProcessResponse<Privilege[]>> => JSON.parse(await ipcRenderer.invoke('get-privileges', { roleName })),
        updatePrivilege: async (privilege: Privilege): Promise<MainProcessResponse<UpdateResult | undefined>> => JSON.parse(await ipcRenderer.invoke('update-privilege', { privilege })),
        updatePrivileges: async (privileges: Privilege[]): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('update-privileges', { privileges })),
        updateRole: async (privileges: Privilege[]): Promise<MainProcessResponse<boolean>> => JSON.parse(await ipcRenderer.invoke('update-role', { privileges })),
        deletePrivilege: async (id: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-privilege', { id })),
        deletePrivileges: async (ids: string[]): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-privileges', { ids })),
        deleteRole: async (roleName: string): Promise<MainProcessResponse<DeleteResult>> => JSON.parse(await ipcRenderer.invoke('delete-role', { roleName })),
    }
}

export type RendererEvents = {
    createRole: (privileges: Privilege[]) => Promise<MainProcessResponse<InsertManyResult>>,
    createPrivilege: (privilege: Privilege) => Promise<MainProcessResponse<InsertOneResult>>,
    getAccessControl: (roleName?: string) => Promise<MainProcessResponse<AccessControl>>,
    getPrivilege: (roleName: string, action: string) => Promise<MainProcessResponse<Privilege | null>>,
    getRoles: () => Promise<MainProcessResponse<string[]>>,
    getPrivileges: (roleName?: string) => Promise<MainProcessResponse<Privilege[]>>,
    updatePrivilege: (privilege: Privilege) => Promise<MainProcessResponse<UpdateResult | undefined>>,
    updatePrivileges: (privileges: Privilege[]) => Promise<MainProcessResponse<boolean>>,
    updateRole: (privileges: Privilege[]) => Promise<MainProcessResponse<boolean>>,
    deletePrivilege: (id: string) => Promise<MainProcessResponse<DeleteResult>>,
    deletePrivileges: (ids: string[]) => Promise<MainProcessResponse<DeleteResult>>,
    deleteRole: (roleName: string) => Promise<MainProcessResponse<DeleteResult>>,
}
