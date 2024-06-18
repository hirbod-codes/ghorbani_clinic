import { ObjectId } from "mongodb";
import { InferType, array, number, object, mixed, string } from "yup"

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
    createdAt: number().optional(),
    updatedAt: number().optional(),
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
