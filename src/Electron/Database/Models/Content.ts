import { ObjectId } from "mongodb";
import { object, mixed, string, InferType } from "yup";

export const contentSchema = object().optional().shape({
    text: string().optional(),
    canvas: mixed<string | ObjectId>().optional(),
});

export type Content = InferType<typeof contentSchema>
