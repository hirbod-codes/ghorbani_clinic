import { ObjectId } from "mongodb";
import { InferType, number, object, mixed, string, array } from "yup"
import { contentSchema } from "./Content";

export const collectionName = 'patients'

export const patientsMedicalHistorySchema = object().optional().shape({
    description: contentSchema,
    histories: array().optional().of(string().required())
})

export type PatientsMedicalHistory = InferType<typeof patientsMedicalHistorySchema>

// after updates, don't forget to also update privileges
export const patientSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    socialId: string().required().length(10),
    phoneNumber: string().optional().length(11),
    firstName: string().optional(),
    lastName: string().optional(),
    gender: string().optional().oneOf(['male', 'female']),
    age: number().optional().min(0).max(130),
    birthDate: number().optional(),
    medicalHistory: patientsMedicalHistorySchema,
    address: contentSchema,
    createdAt: number().optional(),
    updatedAt: number().optional(),
})

export type Patient = InferType<typeof patientSchema>

export const fields: (keyof Patient)[] = [
    'schemaVersion',
    '_id',
    'socialId',
    'phoneNumber',
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
