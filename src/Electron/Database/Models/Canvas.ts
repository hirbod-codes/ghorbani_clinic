import { mixed, number, object, string, InferType } from "yup"

export const collectionName = 'canvas'

export const canvasSchema = object().required().shape({
    colorSpace: mixed<PredefinedColorSpace>().required(),
    width: number().required(),
    height: number().required(),
    data: mixed<ArrayBuffer | Buffer | string>().required(),
    dataStr: string().optional()
})

export type Canvas = InferType<typeof canvasSchema>
