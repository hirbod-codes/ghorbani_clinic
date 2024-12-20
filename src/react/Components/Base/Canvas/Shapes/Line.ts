import { applyToPoint, compose, fromObject, Matrix, translate } from "transformation-matrix";
import { Boundary, Draw } from "../types";
import { Shape } from "./Shape";
import { Point } from "../../../../Lib/Math";
import { SelectionBox } from "./SelectionBox";
import { getRadiansFromTwoPoints } from "../../../../Lib/Math/2d";

export class Line implements Shape {
    private lineWidth: number
    private stroke: string
    private pressureMagnitude: number
    private isPressureSensitive: boolean
    private mode: 'eraser' | 'pencil'
    transformArgs: DOMMatrix | Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, }
    rotationDegree: number = 0

    private points: (Point & { lineWidth: number })[] = []

    constructor(lineWidth: number, stroke: string, pressureMagnitude: number, isPressureSensitive: boolean, mode: 'eraser' | 'pencil') {
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.pressureMagnitude = pressureMagnitude
        this.isPressureSensitive = isPressureSensitive
        this.mode = mode
    }

    scale(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");
    }

    getCenterPoint(): Point {
        const b = this.getBoundary()
        return applyToPoint(fromObject(this.transformArgs), {
            x: b.topLeft.x + (b.topRight.x - b.topLeft.x) / 2,
            y: b.topLeft.y + (b.bottomLeft.y - b.topLeft.y) / 2,
        })
    }

    updateWidth(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");

    }

    updateHeight(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");

    }

    translate(previousPoint: Point, currentPoint: Point): void {
        this.transformArgs = compose(
            translate(currentPoint.x - previousPoint.x, currentPoint.y - previousPoint.y),
            fromObject(this.transformArgs),
        )
    }

    rotate(previousPoint: Point, currentPoint: Point): void {
        const centerPoint: Point = this.getCenterPoint()

        const p = getRadiansFromTwoPoints(centerPoint, previousPoint)
        const c = getRadiansFromTwoPoints(centerPoint, currentPoint)
        let absoluteRad = c - p

        while (absoluteRad >= 2 * Math.PI)
            absoluteRad -= 2 * Math.PI

        const sin = Math.sin(absoluteRad)
        const cos = Math.cos(absoluteRad)
        this.transformArgs = compose(
            {
                a: cos,
                b: sin,
                c: -sin,
                d: cos,
                e: centerPoint.x - (cos * centerPoint.x - sin * centerPoint.y),
                f: centerPoint.y - (sin * centerPoint.x + cos * centerPoint.y),
            },
            fromObject(this.transformArgs),
        )
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
            top: { x: minX + diffX, y: minY },
            topRight: { x: maxX, y: minY },
            right: { x: maxX, y: minY + diffY },
            bottomRight: { x: maxX, y: maxY },
            bottom: { x: minX + diffX, y: maxY },
            bottomLeft: { x: minX, y: maxY },
            left: { x: minX, y: minY + diffY },
        }
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean {
        const offset = 3
        for (let i = 0; i < this.points.length; i++) {
            const p = applyToPoint(fromObject(this.transformArgs), this.points[i])
            if (point.x > p.x - offset && point.x < p.x + offset && point.y > p.y - offset && point.y < p.y + offset)
                return true
        }
        return false
    }

    draw(d: Draw, w?: number): void {
        if (!d)
            return

        const { prevPoint, currentPoint, ctx } = d
        if (!prevPoint || !currentPoint || !ctx)
            return

        if (Number.isNaN(Number(this.lineWidth)) || Number.isNaN(Number(this.pressureMagnitude)))
            return

        let width = Number(this.lineWidth);

        if (d.e !== undefined)
            if (w === undefined) {
                if (this.mode !== 'eraser' && this.isPressureSensitive && d.e.pointerType === 'pen')
                    width += (Math.pow(d.e.pressure, 2) * Number(this.pressureMagnitude));
            } else
                width = w

        if (!prevPoint)
            return

        this.internalDraw(d.ctx, prevPoint, currentPoint, width, this.stroke, 'round')

        if (this.points.length === 0)
            this.addPoint(prevPoint, width)
        this.addPoint(currentPoint, width)
    }

    private internalDraw(ctx: CanvasRenderingContext2D, prevPoint: Point, currentPoint: Point, lineWidth: number, strokeStyle: string | CanvasGradient | CanvasPattern, lineJoin: CanvasLineJoin) {
        ctx.save()

        ctx.lineWidth = lineWidth
        ctx.strokeStyle = strokeStyle
        ctx.fillStyle = strokeStyle
        ctx.lineJoin = lineJoin

        if (this.transformArgs)
            ctx.setTransform(this.transformArgs)

        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(prevPoint.x, prevPoint.y, lineWidth / 2, 0, 2 * Math.PI)
        ctx.fill()

        ctx.restore()
    }

    private addPoint(point: Point, lineWidth: number) {
        return new Promise<number>((r, rej) => {
            r(0)
            this.points.push({ ...point, lineWidth })
        })
    }

    redraw(d: Draw): void {
        for (let i = 0; i < this.points.length; i++)
            if (i === 0)
                continue
            else
                this.internalDraw(d.ctx, this.points[i - 1], this.points[i], this.points[i].lineWidth, this.stroke, 'round')
    }
}
