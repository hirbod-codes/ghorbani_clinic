import { mixed } from "yup"
import { RoleName } from "../../Auth/roles"
import type { Operation } from "../../Auth/types"

export type FileOperation = Operation | 'download' | 'open'

export const collectionName = 'fs'

export function getPrivilege(operation: Operation): string {
    return `${operation}.${collectionName}`
}

export function getPrivileges(): string[]
export function getPrivileges(operation: RoleName): string[]
export function getPrivileges(operation: FileOperation): string[]
export function getPrivileges(operation?: FileOperation | RoleName): string[] {
    if (!operation)
        return [
            `create.${collectionName}`,
            `read.${collectionName}`,
            `update.${collectionName}`,
            `delete.${collectionName}`,
            `download.${collectionName}`,
            `open.${collectionName}`,
        ]

    if (mixed<RoleName>().required().isValidSync(operation))
        switch (operation) {
            case 'doctor':
                return getPrivileges()

            case 'secretary':
                return [
                    `create.${collectionName}`
                ]

            default:
                throw new Error('Invalid role name provided.')
        }

    return [`${operation}.${collectionName}`]
}
