import { ObjectId } from "mongodb";
import { InferType, array, mixed, number, object, string } from "yup";
import type { Operation } from "../../Auth/types.";
import { RoleName } from "../../../Electron/Auth/roles";

export const collectionName = 'visits'

export const visitSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    patientId: mixed<string | ObjectId>().optional().required(),
    due: number().required(),
    diagnosis: array().default([]).of(string().required()),
    createdAt: number().required(),
    updatedAt: number().required(),
})

export type Visit = InferType<typeof visitSchema>

export const fields: (keyof Visit)[] = [
    'schemaVersion',
    '_id',
    'patientId',
    'due',
    'diagnosis',
    'createdAt',
    'updatedAt',
]
export const readableFields = fields.filter(f => f !== 'schemaVersion')
export const updatableFields = readableFields.filter(f => !['_id', 'createdAt', 'updatedAt'].includes(f))

export function getPrivilege(operation: Operation, field: keyof Visit): string | null {
    if (operation === 'delete' || operation === 'create')
        return null
    if (operation === 'read' && readableFields.includes(field))
        return `${operation}.${collectionName}.${field}`
    if (operation === 'update' && updatableFields.includes(field))
        return `${operation}.${collectionName}.${field}`
    return null
}

export function getPrivileges(): string[]
export function getPrivileges(operation: RoleName): string[]
export function getPrivileges(operation: Operation): string[]
export function getPrivileges(operation?: Operation | RoleName): string[] {
    if (!operation)
        return [
            `create.${collectionName}`,
            `read.${collectionName}`,
            `update.${collectionName}`,
            `delete.${collectionName}`,
            ...readableFields.map(f => getPrivilege('read', f)),
            ...updatableFields.map(f => getPrivilege('update', f)),
        ]

    if (mixed<RoleName>().required().isValidSync(operation))
        switch (operation) {
            case 'doctor':
                return getPrivileges()

            case 'secretary':
                return [
                    `create.${collectionName}`,
                ]

            default:
                throw new Error('Invalid role name provided.')
        }

    if (operation === 'delete' || operation === 'create')
        return []

    if (operation === 'read')
        return readableFields.map(f => `${operation}.${collectionName}.${f}`)

    if (operation === 'update')
        return updatableFields.map(f => `${operation}.${collectionName}.${f}`)

    return null
}