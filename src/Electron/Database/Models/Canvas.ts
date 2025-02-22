import { ObjectId } from "mongodb"
import { mixed, number, object, string, InferType, array } from "yup"

export const collectionName = 'canvas'

export const canvasSchema = object().required().shape({
    schemaVersion: string().optional().min(6).max(10),
    _id: mixed<string | ObjectId>().optional(),
    backgroundColor: string().optional().default('white'),
    width: number().required(),
    height: number().required(),
    data: array().required(),
})

export type Canvas = InferType<typeof canvasSchema>

export const fields: (keyof Canvas)[] = [
    'schemaVersion',
    '_id',
    'backgroundColor',
    'width',
    'height',
    'data'
]
export const readableFields = fields.filter(f => !['schemaVersion'].includes(f))
export const updatableFields = readableFields.filter(f => !['_id'].includes(f))
