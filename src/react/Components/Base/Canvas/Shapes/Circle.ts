import { Point } from "@/src/react/Lib/Math";
import { Boundary, Draw } from "../types";
import { SelectionBox } from "./SelectionBox";
import { IShape } from "./IShape";
import { translate, compose, fromObject, Matrix } from 'transformation-matrix';

export class Circle implements IShape {
    private path: Path2D
    x: number
    y: number
    r: number
    lineWidth: number | undefined
    stroke: string | CanvasGradient | CanvasPattern | undefined
    fill: string | CanvasGradient | CanvasPattern | undefined
    shadowBlur: number | undefined
    shadowColor: string | undefined
    shadowOffsetX: number | undefined
    shadowOffsetY: number | undefined
    transformArgs: DOMMatrix | Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, }

    constructor(x?: number, y?: number, r?: number, lineWidth?: number, stroke?: string | CanvasGradient | CanvasPattern, fill?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number) {
        this.x = x ?? 0
        this.y = y ?? 0
        this.r = r ?? 0
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.fill = fill
        this.shadowBlur = shadowBlur
        this.shadowColor = shadowColor
        this.shadowOffsetX = shadowOffsetX
        this.shadowOffsetY = shadowOffsetY
    }

    getSerializableModel(): any {
        return {
            type: 'Circle',
            x: this.x,
            y: this.y,
            r: this.r,
            lineWidth: this.lineWidth,
            stroke: this.stroke,
            fill: this.fill,
            shadowBlur: this.shadowBlur,
            shadowColor: this.shadowColor,
            shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY,
            transformArgs: this.transformArgs,
        }
    }

    setSerializableModel(model: any): void {
        this.x = model.x
        this.y = model.y
        this.r = model.r
        this.lineWidth = model.lineWidth
        this.stroke = model.stroke
        this.fill = model.fill
        this.shadowBlur = model.shadowBlur
        this.shadowColor = model.shadowColor
        this.shadowOffsetX = model.shadowOffsetX
        this.shadowOffsetY = model.shadowOffsetY
        this.transformArgs = model.transformArgs
    }

    getCenterPoint(): Point {
        return { x: this.x, y: this.y }
    }

    updateWidth(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");
    }

    updateHeight(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");
    }

    scale(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void {
        throw new Error("Method not implemented.");
    }

    translate(previousPoint: Point, currentPoint: Point): void {
        this.transformArgs = compose(
            translate(currentPoint.x - previousPoint.x, currentPoint.y - previousPoint.y),
            fromObject(this.transformArgs),
        )
    }

    rotate(previousPoint: Point, currentPoint: Point): void {
        throw new Error("Method not implemented.");
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean {
        if (this.path === undefined)
            return false

        return ctx.isPointInPath(this.path, point.x, point.y)
    }

    getBoundary(): Boundary {
        throw new Error("Method not implemented.");
    }

    draw(d: Draw): void {
        d.ctx.save()

        this.path = new Path2D()

        if (this.lineWidth !== undefined) d.ctx.lineWidth = this.lineWidth
        if (this.shadowBlur !== undefined) d.ctx.shadowBlur = this.shadowBlur
        if (this.shadowColor !== undefined) d.ctx.shadowColor = this.shadowColor
        if (this.shadowOffsetX !== undefined) d.ctx.shadowOffsetX = this.shadowOffsetX
        if (this.shadowOffsetY !== undefined) d.ctx.shadowOffsetY = this.shadowOffsetY
        if (this.stroke !== undefined) d.ctx.strokeStyle = this.stroke
        if (this.fill !== undefined) d.ctx.fillStyle = this.fill

        if (this.transformArgs)
            d.ctx.setTransform(this.transformArgs)

        this.path.ellipse(this.x, this.y, this.r, this.r, 0, 0, 2 * Math.PI)

        if (this.stroke !== undefined)
            d.ctx.stroke(this.path)
        if (this.fill !== undefined)
            d.ctx.fill(this.path)

        d.ctx.restore()
    }

    redraw(d: Draw): void {
        this.draw(d)
    }
}
