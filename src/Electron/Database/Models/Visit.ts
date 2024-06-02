import { InferType, array, number, object, string } from "yup";

export const visitSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: string().optional().length(24),
    patientId: string().optional().length(24),
    due: number().required(),
    diagnosis: array().default([]).of(string().required()),
    createdAt: number().required(),
    updatedAt: number().required(),
})

export type Visit = InferType<typeof visitSchema>
