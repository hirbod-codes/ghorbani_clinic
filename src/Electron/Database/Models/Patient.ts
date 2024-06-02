import { InferType, array, number, object, string } from "yup"

export const patientSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: string().optional().length(24),
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
