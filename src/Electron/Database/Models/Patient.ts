import { ObjectId } from "mongodb";
import { InferType, array, number, object, mixed, string } from "yup"

export const collectionName = 'patients'

export const medicalHistorySchema = object().optional().shape({
    description: string().optional(),
    histories: array().optional().of(string().required())
})

export type MedicalHistory = InferType<typeof medicalHistorySchema>

// after updates, don't forget to also update privileges
export const patientSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    socialId: string().required().length(10),
    firstName: string().optional(),
    lastName: string().optional(),
    gender: string().optional().oneOf(['male', 'female']),
    age: number().optional().min(0).max(130),
    birthDate: number().optional(),
    medicalHistory: medicalHistorySchema,
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
