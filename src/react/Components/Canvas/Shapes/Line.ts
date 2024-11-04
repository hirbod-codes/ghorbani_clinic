import { Boundaries, Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";

export class Line implements Shape {
    private lineWidth: number
    private stroke: string
    private pressureMagnitude: number
    private isPressureSensitive: boolean
    private mode: 'eraser' | 'pencil'
    transformArgs: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0]
    rotationDegree: number = 0

    private points: (Point & { lineWidth: number })[] = []

    constructor(lineWidth: number, stroke: string, pressureMagnitude: number, isPressureSensitive: boolean, mode: 'eraser' | 'pencil') {
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.pressureMagnitude = pressureMagnitude
        this.isPressureSensitive = isPressureSensitive
        this.mode = mode
    }

    redraw(d: Draw): void {
        d.ctx.beginPath()
        d.ctx.strokeStyle = this.stroke
        d.ctx.lineWidth = this.lineWidth
        d.ctx.strokeStyle = this.stroke
        d.ctx.fillStyle = this.stroke

        d.ctx.moveTo(this.points[0].x, this.points[0].y)

        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];

            d.ctx.lineWidth = point.lineWidth
            d.ctx.lineTo(point.x, point.y)
        }
        d.ctx.stroke()

        d.ctx.beginPath()
        d.ctx.arc(this.points[0].x, this.points[0].y, this.points[0].lineWidth / 2, 0, 2 * Math.PI)
        d.ctx.fill()
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

        const diffX = (maxX - minX) / 2
        const diffY = (maxY - minY) / 2

        return {
            topLeft: { x: minX, y: minY },
            top: { x: minX + (diffX / 2), y: minY },
            topRight: { x: maxX, y: minY },
            right: { x: maxX, y: minY + (diffY / 2) },
            bottomRight: { x: maxX, y: maxY },
            bottom: { x: minX + (diffX / 2), y: maxY },
            bottomLeft: { x: minX, y: maxY },
            left: { x: minX, y: minY + (diffY / 2) },
        }
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean {
        const boundary = this.getBoundary()

        return point.x >= boundary.left.x && point.x <= boundary.right.x && point.y >= boundary.top.y && point.y <= boundary.bottom.y
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

        ctx.beginPath()

        const lineColor = this.stroke
        ctx.lineWidth = width
        ctx.strokeStyle = lineColor
        ctx.fillStyle = lineColor

        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, width / 2, 0, 2 * Math.PI)
        ctx.fill()

        this.points.push({ ...currentPoint, lineWidth: width })
    }
}
