import { translate, compose, applyToPoint, Matrix, fromObject, decomposeTSR } from 'transformation-matrix';
import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";
import { SelectionBox } from './SelectionBox';
import { getRadiansFromTwoPoints, lineFunction, pointFromLineDistance } from '../../../Lib/Math/2d';

export class Rectangle implements Shape {
    private path: Path2D
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

    getCenterPoint(): Point {
        return applyToPoint(fromObject(this.transformArgs), { x: this.x + (this.w / 2), y: this.y + (this.h / 2) })
    }

    translate(previousPoint: Point, currentPoint: Point) {
        if (this.x + (currentPoint.x - previousPoint.x) < 0)
            return

        this.transformArgs = compose(
            translate(currentPoint.x - previousPoint.x, currentPoint.y - previousPoint.y),
            fromObject(this.transformArgs),
        )
    }

    rotate(previousPoint: Point, currentPoint: Point): void {
        const centerPoint: Point = applyToPoint(fromObject(this.transformArgs), { x: this.x + (this.w / 2), y: this.y + (this.h / 2) })

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

    updateWidth(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string) {
        if (!selectedHandler.toLowerCase().includes('left') && !selectedHandler.toLowerCase().includes('right'))
            return

        const handlersBoundaries = selectionBox.getHandlersBoundaries()

        const topLeft = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.topLeft.topLeft)
        const topRight = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.topRight.topRight)
        const bottomRight = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.bottomRight.bottomRight)
        const bottomLeft = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.bottomLeft.bottomLeft)
        const [p1, p2] = selectedHandler.toLowerCase().includes('left') ? [topLeft, bottomLeft] : [bottomRight, topRight]

        const distance = pointFromLineDistance(p1, p2, currentPoint)
        if (Number.isNaN(distance) || distance === Infinity)
            return

        let shouldAdd: boolean

        let y = lineFunction(p1, p2, currentPoint.x)

        if (y === Infinity)
            return

        if (y === undefined && currentPoint.x < p1.x)
            shouldAdd = false
        if (y === undefined && currentPoint.x >= p1.x)
            shouldAdd = true
        if (y !== undefined && currentPoint.y <= y)
            shouldAdd = false
        if (y !== undefined && currentPoint.y > y)
            shouldAdd = true

        if (!selectedHandler.toLowerCase().includes('right'))
            shouldAdd = !shouldAdd

        const decomposedMatrix = decomposeTSR(fromObject(this.transformArgs))
        if ((decomposedMatrix.rotation.angle * 180 / Math.PI) < 0)
            shouldAdd = !shouldAdd

        if (selectedHandler.toLowerCase().includes('left'))
            if (shouldAdd)
                this.addLeft(distance)
            else
                this.minusLeft(distance)

        if (selectedHandler.toLowerCase().includes('right'))
            if (shouldAdd)
                this.addRight(distance)
            else
                this.minusRight(distance)

        return
    }

    updateHeight(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string) {
        if (!selectedHandler.toLowerCase().includes('top') && !selectedHandler.toLowerCase().includes('bottom'))
            return

        const handlersBoundaries = selectionBox.getHandlersBoundaries()

        const topLeft = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.topLeft.topLeft)
        const topRight = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.topRight.topRight)
        const bottomRight = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.bottomRight.bottomRight)
        const bottomLeft = applyToPoint(fromObject(this.transformArgs), handlersBoundaries.bottomLeft.bottomLeft)
        const [p1, p2] = selectedHandler.toLowerCase().includes('bottom') ? [bottomRight, bottomLeft] : [topLeft, topRight]

        const distance = pointFromLineDistance(p1, p2, currentPoint)
        if (Number.isNaN(distance) || distance === Infinity)
            return

        let shouldAdd: boolean

        let y = lineFunction(p1, p2, currentPoint.x)

        if (y === Infinity)
            return

        if (y === undefined && currentPoint.x < p1.x)
            shouldAdd = false
        if (y === undefined && currentPoint.x >= p1.x)
            shouldAdd = true
        if (y !== undefined && currentPoint.y <= y)
            shouldAdd = false
        if (y !== undefined && currentPoint.y > y)
            shouldAdd = true

        const decomposedMatrix = decomposeTSR(fromObject(this.transformArgs))
        if ((decomposedMatrix.rotation.angle * 180 / Math.PI) < 0)
            shouldAdd = !shouldAdd

        if (!selectedHandler.toLowerCase().includes('bottom'))
            shouldAdd = !shouldAdd

        if (selectedHandler.toLowerCase().includes('top'))
            if (shouldAdd)
                this.addTop(distance)
            else
                this.minusTop(distance)

        if (selectedHandler.toLowerCase().includes('bottom'))
            if (shouldAdd)
                this.addBottom(distance)
            else
                this.minusBottom(distance)
    }

    private addRight(x: number) {
        this.w += x
    }

    private addLeft(x: number) {
        if ((this.w - x) < 0)
            return

        this.x -= x
        this.w += x
    }

    private minusRight(x: number) {
        if ((this.w - x) < 0)
            return

        this.w -= x
    }

    private minusLeft(x: number) {
        if ((this.w - x) < 0)
            return

        this.x += x
        this.w -= x
    }

    private addTop(y: number) {
        this.y -= y
        this.h += y
    }

    private addBottom(y: number) {
        this.h += y
    }

    private minusTop(y: number) {
        if ((this.h - y) < 0)
            return

        this.y += y
        this.h -= y
    }

    private minusBottom(y: number) {
        if ((this.h - y) < 0)
            return

        this.h -= y
    }
}
