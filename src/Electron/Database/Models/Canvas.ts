import { mixed, number, object, string, InferType } from "yup"

export const collectionName = 'canvas'

export const canvasSchema = object().required().shape({
    colorSpace: mixed<PredefinedColorSpace>().required(),
    backgroundColor: string().optional().default('white'),
    width: number().required(),
    height: number().required(),
    type: string().required(),
    data: string().required(),
})

export type Canvas = InferType<typeof canvasSchema>
