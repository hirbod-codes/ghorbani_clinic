import { ObjectId } from "mongodb";
import { InferType, mixed, number, object, string } from "yup";

export const collectionName = 'users'

export const userSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    roleName: string().required(),
    username: string().required(),
    password: string().required(),
    createdAt: number().optional(),
    updatedAt: number().optional(),
})

export type User = InferType<typeof userSchema>

export const fields: (keyof User)[] = [
    'schemaVersion',
    '_id',
    'roleName',
    'username',
    'password',
    'createdAt',
    'updatedAt',
]
export const readableFields = fields.filter(f => !['schemaVersion', 'password'].includes(f))
export const updatableFields = readableFields.filter(f => !['_id', 'createdAt', 'updatedAt'].includes(f))
