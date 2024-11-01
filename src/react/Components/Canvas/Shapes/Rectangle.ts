import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";

export class Rectangle implements Shape {
    private x: number
    private y: number
    private w: number
    private h: number
    private lineWidth: number
    private fillColor: string | CanvasGradient | CanvasPattern

    constructor(w: number, h: number, lineWidth: number, fillColor: string | CanvasGradient | CanvasPattern) {
        this.w = w
        this.h = h
        this.lineWidth = lineWidth
        this.fillColor = fillColor
    }

    getBoundary(): Boundary {
        return [
            { x: this.x, y: this.y },
            { x: this.x + this.w, y: this.y },
            { x: this.x + this.w, y: this.y + this.h },
            { x: this.x, y: this.y + this.h },
        ]
    }

    isSelected(point: Point): boolean {
        if (!this.x || !this.y)
            return false

        return point.x >= this.x && point.x <= (this.x + this.w) && point.y >= this.y && point.y <= (this.y + this.h)
    }

    draw(d: Draw): void {
        d.ctx.lineWidth = this.lineWidth
        d.ctx.fillStyle = this.fillColor

        d.ctx.beginPath()
        d.ctx.rect(d.currentPoint.x, d.currentPoint.y, this.w, this.h)
        d.ctx.fill()
        d.ctx.stroke()

        this.x = d.currentPoint.x
        this.y = d.currentPoint.y
    }
}
