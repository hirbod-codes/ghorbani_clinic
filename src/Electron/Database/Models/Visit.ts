import { ObjectId } from "mongodb";
import { InferType, mixed, number, object, string } from "yup";
import { contentSchema } from "./Content";

export const collectionName = 'visits'

export const visitSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    patientId: mixed<string | ObjectId>().optional().required(),
    due: number().required(),
    diagnosis: contentSchema,
    treatments: contentSchema,
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
    'treatments',
    'createdAt',
    'updatedAt',
]
export const readableFields = fields.filter(f => f !== 'schemaVersion')
export const updatableFields = readableFields.filter(f => !['_id', 'createdAt', 'updatedAt'].includes(f))
