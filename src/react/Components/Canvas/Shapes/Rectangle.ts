import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";

export class Rectangle implements Shape {
    x: number
    y: number
    w: number
    h: number
    lineWidth: number
    stroke: string | CanvasGradient | CanvasPattern
    fill: string | CanvasGradient | CanvasPattern

    constructor(x: number, y: number, w: number, h: number, lineWidth: number, stroke: string | CanvasGradient | CanvasPattern, fill: string | CanvasGradient | CanvasPattern) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.lineWidth = lineWidth
        this.stroke = stroke
        this.fill = fill
    }

    redraw(d: Draw): void {
        this.draw(d)
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
        d.ctx.strokeStyle = this.stroke
        d.ctx.fillStyle = this.fill

        d.ctx.beginPath()
        d.ctx.rect(this.x, this.y, this.w, this.h)
        d.ctx.fill()
        d.ctx.stroke()
    }
}
