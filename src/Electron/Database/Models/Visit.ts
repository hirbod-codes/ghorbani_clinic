import { ObjectId } from "mongodb";
import { InferType, array, mixed, number, object, string } from "yup";

export const visitSchema = object().required().shape({
    schemaVersion: string().required().min(6).max(10),
    _id: mixed<string | ObjectId>().optional().oneOf([typeof string, typeof ObjectId]),
    patientId: mixed<string | ObjectId>().optional().oneOf([typeof string, typeof ObjectId]),
    due: number().required(),
    diagnosis: array().default([]).of(string().required()),
    createdAt: number().required(),
    updatedAt: number().required(),
})

export type Visit = InferType<typeof visitSchema>
