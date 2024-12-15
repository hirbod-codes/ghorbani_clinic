import { ObjectId } from "mongodb"
import { InferType, array, mixed, number, object, string } from "yup"

export const collectionName = 'medicalHistories'

export const medicalHistorySchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    name: string().required(),
    createdAt: number().optional(),
    updatedAt: number().optional(),
})

export type MedicalHistory = InferType<typeof medicalHistorySchema>
