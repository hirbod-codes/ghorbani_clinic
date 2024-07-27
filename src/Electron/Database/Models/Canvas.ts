import { mixed, number, object, string, InferType } from "yup"

export const collectionName = 'canvas'

export const canvasSchema = object().required().shape({
    colorSpace: mixed<PredefinedColorSpace>().required(),
    width: number().required(),
    height: number().required(),
    data: mixed<ArrayBuffer | Buffer>().required()
})

export type Canvas = InferType<typeof canvasSchema>
