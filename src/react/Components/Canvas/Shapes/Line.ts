import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";

export class Line implements Shape {
    private lineWidth: number
    private stroke: string
    private pressureMagnitude: number
    private isPressureSensitive: boolean
    private mode: 'eraser' | 'pen'

    private points: { x: number, y: number }[] = []

    constructor(lineWidth: number, stroke: string, pressureMagnitude: number, isPressureSensitive: boolean, mode: 'eraser' | 'pen') {
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.pressureMagnitude = pressureMagnitude
        this.isPressureSensitive = isPressureSensitive
        this.mode = mode
    }

    getBoundary(): Boundary {
        if (this.points.length <= 0)
            throw new Error("points array in Line instance is empty");

        const maxX = this.points.reduce((p, c, ci, arr) => {
            if (!p)
                return c

            return p.x >= c.x ? p : c
        }).x

        const minX = this.points.reduce((p, c, ci, arr) => {
            if (!p)
                return c

            return p.x <= c.x ? p : c
        }).x

        const maxY = this.points.reduce((p, c, ci, arr) => {
            if (!p)
                return c

            return p.y >= c.y ? p : c
        }).y

        const minY = this.points.reduce((p, c, ci, arr) => {
            if (!p)
                return c

            return p.y <= c.y ? p : c
        }).y

        return [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
        ]
    }

    isSelected(point: Point): boolean {
        const boundaries = this.getBoundary()

        return point.x >= boundaries[0].x && point.x <= boundaries[1].x && point.y >= boundaries[0].y && point.y <= boundaries[2].y
    }

    draw(d: Draw): void {
        if (!d)
            return

        const { prevPoint, currentPoint, ctx } = d
        if (!prevPoint || !currentPoint || !ctx)
            return

        if (Number.isNaN(Number(this.lineWidth)) || Number.isNaN(Number(this.pressureMagnitude)))
            return

        let width = Number(this.lineWidth);
        if (this.mode !== 'eraser' && this.isPressureSensitive && d.e.pointerType === 'pen')
            width += (Math.pow(d.e.pressure, 2) * Number(this.pressureMagnitude));

        let startPoint = prevPoint ?? currentPoint

        const lineColor = this.stroke
        ctx.lineWidth = width
        ctx.strokeStyle = lineColor
        ctx.fillStyle = lineColor

        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, width / 2, 0, 2 * Math.PI)
        ctx.fill()

        this.points.push(currentPoint)
    }
}
