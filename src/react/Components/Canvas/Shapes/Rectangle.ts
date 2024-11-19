import { translate, compose, applyToPoint, Matrix, fromObject } from 'transformation-matrix';
import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";

export class Rectangle implements Shape {
    path: Path2D
    x: number
    y: number
    w: number
    h: number
    lineWidth: number
    stroke: string | CanvasGradient | CanvasPattern
    fill: string | CanvasGradient | CanvasPattern
    transformArgs: DOMMatrix | Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, }

    constructor(x: number, y: number, w: number, h: number, lineWidth: number, stroke: string | CanvasGradient | CanvasPattern, fill: string | CanvasGradient | CanvasPattern) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.fill = fill
    }

    getBoundary(): Boundary {
        return {
            topLeft: { x: this.x, y: this.y },
            top: { x: this.x + (this.w / 2), y: this.y },
            topRight: { x: this.x + this.w, y: this.y },
            right: { x: this.x + this.w, y: this.y + (this.h / 2) },
            bottomRight: { x: this.x + this.w, y: this.y + this.h },
            bottom: { x: this.x + (this.w / 2), y: this.y + this.h },
            bottomLeft: { x: this.x, y: this.y + this.h },
            left: { x: this.x, y: this.y + (this.h / 2) },
        }
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean {
        if (!this.path)
            return false

        ctx.save()

        ctx.setTransform(this.transformArgs)

        const result = ctx.isPointInPath(this.path, point.x, point.y)

        ctx.restore()

        return result
    }

    translate(x: number, y: number) {
        this.transformArgs = compose(
            translate(x, y),
            fromObject(this.transformArgs),
        )
    }

    rotate(rad: number, pivot: Point) {
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        this.transformArgs = compose(
            {
                a: cos,
                b: sin,
                c: -sin,
                d: cos,
                e: pivot.x - (cos * pivot.x - sin * pivot.y),
                f: pivot.y - (sin * pivot.x + cos * pivot.y),
            },
            fromObject(this.transformArgs),
        )
    }

    redraw(d: Draw): void {
        this.draw(d)
    }

    draw(d: Draw): void {
        d.ctx.save()

        this.path = new Path2D()

        d.ctx.lineWidth = this.lineWidth
        d.ctx.strokeStyle = this.stroke
        d.ctx.fillStyle = this.fill

        if (this.transformArgs)
            d.ctx.setTransform(this.transformArgs)

        this.path.rect(this.x, this.y, this.w, this.h)

        d.ctx.fill(this.path)
        d.ctx.stroke(this.path)

        d.ctx.restore()
    }
}
