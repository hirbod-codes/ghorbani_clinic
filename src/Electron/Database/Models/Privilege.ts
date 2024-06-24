import { ObjectId } from "mongodb";
import { InferType, mixed, number, object, string } from "yup";

export const collectionName = 'privileges'

export const privilegeSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    role: string().required(),
    resource: string().required(),
    action: string().required(),
    attributes: string().optional(),
    createdAt: number().optional(),
    updatedAt: number().optional(),
})

export type Privilege = InferType<typeof privilegeSchema>

export const fields: (keyof Privilege)[] = [
    'schemaVersion',
    '_id',
    'role',
    'resource',
    'action',
    'attributes',
    'createdAt',
    'updatedAt',
]
export const readableFields = fields.filter(f => f !== 'schemaVersion')
export const updatableFields = readableFields.filter(f => !['_id', 'createdAt', 'updatedAt'].includes(f))
