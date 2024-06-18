import { ObjectId } from "mongodb";
import { InferType, array, mixed, number, object, string } from "yup";

export const collectionName = 'visits'

export const visitSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    patientId: mixed<string | ObjectId>().optional().required(),
    due: number().required(),
    diagnosis: array().default([]).of(string().required()),
    createdAt: number().optional(),
    updatedAt: number().optional(),
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
