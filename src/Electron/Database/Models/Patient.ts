import { ObjectId } from "mongodb";
import { InferType, array, number, object, string, mixed } from "yup"

export const patientSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: mixed<string | ObjectId>().optional().oneOf([typeof string, typeof ObjectId]),
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
