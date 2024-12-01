import { translate, compose, applyToPoint, Matrix, fromObject, decomposeTSR, scale } from 'transformation-matrix';
import { Boundary, Draw, Point } from "../types";
import { Shape } from "./Shape";
import { SelectionBox } from './SelectionBox';
import { getRadiansFromTwoPoints, lineFunction, pointFromLineDistance } from '../../../Lib/Math/2d';

export type UpdateGradient = { steps?: { offset: number, color: string }[], startAngle?: number, x0?: number, y0?: number, r0?: number, x1?: number, y1?: number, r1?: number }

export type conicGradient = { steps: { offset: number, color: string }[], mode: 'conic', startAngle: number, x0: number, y0: number }
export type linearGradient = { steps: { offset: number, color: string }[], mode: 'linear', x0: number, y0: number, x1: number, y1: number }
export type radialGradient = { steps: { offset: number, color: string }[], mode: 'radial', x0: number, y0: number, r0: number, x1: number, y1: number, r1: number }

export type Gradients = conicGradient | linearGradient | radialGradient

export class RectangleGradient implements Shape {
    private path: Path2D
    x: number
    y: number
    w: number
    h: number
    canvasGradient: Gradients
    transformArgs: DOMMatrix | Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, }

    constructor(x: number, y: number, w: number, h: number, canvasGradient: Gradients) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.canvasGradient = canvasGradient
    }

    updateGradient(gradient: UpdateGradient) {
        this.canvasGradient = { ...this.canvasGradient, ...gradient }
    }

    getGradient(): Gradients {
        return this.canvasGradient
    }

    redraw(d: Draw): void {
        this.draw(d)
    }

    draw(d: Draw): void {
        d.ctx.save()

        this.path = new Path2D()

        let fillStyle: CanvasGradient
        switch (this.canvasGradient.mode) {
            case 'conic':
                if (!this.canvasGradient.startAngle || !this.canvasGradient.x0 || !this.canvasGradient.y0)
                    throw new Error('invalid gradient options provided.')

                const conicGradient = d.ctx.createConicGradient(this.canvasGradient.startAngle, this.canvasGradient.x0, this.canvasGradient.y0)
                this.canvasGradient.steps.forEach((s) => conicGradient.addColorStop(s.offset, s.color))
                fillStyle = conicGradient
                break;

            case 'linear':
                if (!this.canvasGradient.x0 || !this.canvasGradient.y0 || !this.canvasGradient.x1 || !this.canvasGradient.y1)
                    throw new Error('invalid gradient options provided.')

                const linearGradient = d.ctx.createLinearGradient(this.canvasGradient.x0, this.canvasGradient.y0, this.canvasGradient.x1, this.canvasGradient.y1)
                this.canvasGradient.steps.forEach((s) => linearGradient.addColorStop(s.offset, s.color))
                fillStyle = linearGradient
                break;

            case 'radial':
                if (!this.canvasGradient.x0 || !this.canvasGradient.y0 || !this.canvasGradient.r0 || !this.canvasGradient.x1 || !this.canvasGradient.y1 || !this.canvasGradient.r1)
                    throw new Error('invalid gradient options provided.')

                const radialGradient = d.ctx.createRadialGradient(this.canvasGradient.x0, this.canvasGradient.y0, this.canvasGradient.r0, this.canvasGradient.x1, this.canvasGradient.y1, this.canvasGradient.r1)
                this.canvasGradient.steps.forEach((s) => radialGradient.addColorStop(s.offset, s.color))
                fillStyle = radialGradient
                break;

            default:
                throw new Error('invalid gradient options provided.')
        }

        if (fillStyle === undefined)
            throw new Error('invalid gradient options provided.')

        d.ctx.fillStyle = fillStyle

        if (this.transformArgs)
            d.ctx.setTransform(this.transformArgs)

        this.path.rect(this.x, this.y, this.w, this.h)

        d.ctx.fill(this.path)

        d.ctx.restore()
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

    scale(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string) {
        let x = this.getHorizontalDistance(prevPoint, currentPoint, selectionBox, selectedHandler)
        let y = this.getVerticalDistance(prevPoint, currentPoint, selectionBox, selectedHandler)
        console.log(x, y)

        const calcScale = (old: number, change: number) => (old + 2 * change) / old

        const topLeft = applyToPoint(fromObject(this.transformArgs), { x: this.x, y: this.y })
        const bottomRight = applyToPoint(fromObject(this.transformArgs), { x: this.x + this.w, y: this.y + this.h })
        const centerPoint: Point = this.getCenterPoint()
        const width = bottomRight.x - topLeft.x
        const height = bottomRight.y - topLeft.y

        if (x !== 0 && (selectedHandler.toLowerCase().includes('left') || selectedHandler.toLowerCase().includes('right')))
            if (x > 0)
                this.transformArgs = compose(scale(calcScale(width, x), 1, centerPoint.x, centerPoint.y), fromObject(this.transformArgs))
            else
                this.transformArgs = compose(scale(calcScale(width, x), 1, centerPoint.x, centerPoint.y), fromObject(this.transformArgs))

        if (y !== 0 && (selectedHandler.toLowerCase().includes('top') || selectedHandler.toLowerCase().includes('bottom')))
            if (y > 0)
                this.transformArgs = compose(scale(1, calcScale(height, y), centerPoint.x, centerPoint.y), fromObject(this.transformArgs))
            else
                this.transformArgs = compose(scale(1, calcScale(height, y), centerPoint.x, centerPoint.y), fromObject(this.transformArgs))



        const tl = applyToPoint(fromObject(this.transformArgs), { x: this.x, y: this.y })
        const br = applyToPoint(fromObject(this.transformArgs), { x: this.x + this.w, y: this.y + this.h })
        this.transformArgs = compose(translate((br.x - tl.x - width) / 2, (br.y - tl.y - height) / 2))
    }

    updateWidth(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string) {
        const distance = this.getHorizontalDistance(prevPoint, currentPoint, selectionBox, selectedHandler)

        if (selectedHandler.toLowerCase().includes('left'))
            if (distance > 0)
                this.addLeft(distance)
            else
                this.minusLeft(-distance)

        if (selectedHandler.toLowerCase().includes('right'))
            if (distance > 0)
                this.addRight(distance)
            else
                this.minusRight(-distance)
    }

    updateHeight(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string) {
        const distance = this.getVerticalDistance(prevPoint, currentPoint, selectionBox, selectedHandler)

        if (selectedHandler.toLowerCase().includes('top'))
            if (distance > 0)
                this.addTop(distance)
            else
                this.minusTop(-distance)

        if (selectedHandler.toLowerCase().includes('bottom'))
            if (distance > 0)
                this.addBottom(distance)
            else
                this.minusBottom(-distance)
    }

    private getHorizontalDistance(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): number {
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
        console.log({ y })

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

        console.log({ shouldAdd, distance })
        return shouldAdd ? distance : -distance
    }

    private getVerticalDistance(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): number {
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

        return shouldAdd ? distance : -distance
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
