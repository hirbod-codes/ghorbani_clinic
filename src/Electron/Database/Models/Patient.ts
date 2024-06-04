import { ObjectId } from "mongodb";
import { InferType, array, number, object, mixed, string } from "yup"
import type { Operation } from "./types.";

export const collectionName = 'patients'

// after updates, don't forget to also update privileges
export const patientSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    socialId: string().required().length(10),
    firstName: string().optional(),
    lastName: string().optional(),
    gender: string().optional().oneOf(['male', 'female']),
    age: number().optional().min(0).max(130),
    birthDate: number().optional(),
    medicalHistory: array().default([]).of(string().required()),
    address: string().optional(),
    createdAt: number().required(),
    updatedAt: number().required(),
})

export type Patient = InferType<typeof patientSchema>

export const fields: (keyof Patient)[] = [
    'schemaVersion',
    '_id',
    'socialId',
    'firstName',
    'lastName',
    'gender',
    'age',
    'birthDate',
    'medicalHistory',
    'address',
    'createdAt',
    'updatedAt',
]
export const readableFields = fields.filter(f => f !== 'schemaVersion')
export const updatableFields = readableFields.filter(f => !['_id', 'createdAt', 'updatedAt'].includes(f))

export function getPrivilege(operation: Operation, field: keyof Patient): string | null {
    if (operation === 'delete' || operation === 'create')
        return null
    if (operation === 'read' && readableFields.includes(field))
        return `${operation}.${collectionName}.${field}`
    if (operation === 'update' && updatableFields.includes(field))
        return `${operation}.${collectionName}.${field}`
    return null
}

export function getPrivileges(): string[]
export function getPrivileges(operation: Operation): string[]
export function getPrivileges(operation?: Operation): string[] {
    if (!operation)
        return [
            `create.${collectionName}`,
            `read.${collectionName}`,
            `update.${collectionName}`,
            `delete.${collectionName}`,
            ...readableFields.map(f => `read.${collectionName}.${f}`),
            ...updatableFields.map(f => `update.${collectionName}.${f}`),
        ]

    if (operation === 'delete' || operation === 'create')
        return []

    if (operation === 'read')
        return readableFields.map(f => `${operation}.${collectionName}.${f}`)

    if (operation === 'update')
        return updatableFields.map(f => `${operation}.${collectionName}.${f}`)

    return null
}