import { MutableRefObject } from "react";
import { IShape } from "./Shapes/IShape";
import { Line } from "./Shapes/Line";
import { Circle } from "./Shapes/Circle";
import { Rectangle } from "./Shapes/Rectangle";
import { RectangleGradient } from "./Shapes/RectangleGradient";

export function isCanvasEmpty(ref: MutableRefObject<HTMLCanvasElement | null>) {
    if (!ref.current)
        return true

    const context = ref.current.getContext('2d');
    if (!context)
        return true

    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, ref.current.width, ref.current.height).data.buffer)

    return !pixelBuffer.some(color => color !== 0);
}

export function buildShapes(models: any[]): IShape[] {
    return models.map(m => {
        console.log('m', m)
        switch (m.type) {
            case 'Line':
                let line = new Line()
                line.setSerializableModel(m)
                return line

            case 'Circle':
                let circle = new Circle()
                circle.setSerializableModel(m)
                return circle

            case 'Rectangle':
                let rectangle = new Rectangle()
                rectangle.setSerializableModel(m)
                return rectangle

            case 'RectangleGradient':
                let rectangleGradient = new RectangleGradient()
                rectangleGradient.setSerializableModel(m)
                return rectangleGradient

            default:
                throw new Error('Unsupported type provided for shape type in buildShapes function');
        }
    })
}
