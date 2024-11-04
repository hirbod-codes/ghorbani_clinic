import { Boundaries, Boundary, Draw, Point } from "../types";
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
    transformArgs: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0]
    rotationDegree: number = 0

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

        ctx.setTransform(this.transformArgs[0], this.transformArgs[1], this.transformArgs[2], this.transformArgs[3], -1.5 * (this.x), -1.5 * (this.y))
        ctx.rotate(this.rotationDegree)
        ctx.setTransform(...this.transformArgs)
        const result = ctx.isPointInPath(this.path, point.x, point.y)

        ctx.restore()

        return result
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

        d.ctx.setTransform(this.transformArgs[0], this.transformArgs[1], this.transformArgs[2], this.transformArgs[3], -1.5 * (this.x), -1.5 * (this.y))

        d.ctx.rotate(this.rotationDegree)

        d.ctx.setTransform(...this.transformArgs)

        this.path.rect(this.x, this.y, this.w, this.h)

        d.ctx.fill(this.path)
        d.ctx.stroke(this.path)

        d.ctx.restore()
    }
}
