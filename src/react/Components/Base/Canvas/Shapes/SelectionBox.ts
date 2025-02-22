import { Boundaries, Boundary, Draw, Point, Position } from "../types";
import { IShape } from "./IShape";

export class SelectionBox {
    paths: { [key in Position]: Path2D | undefined } & { move: Path2D | undefined, rotate: Path2D | undefined } = {
        topLeft: undefined,
        top: undefined,
        topRight: undefined,
        right: undefined,
        bottomRight: undefined,
        bottom: undefined,
        bottomLeft: undefined,
        left: undefined,
        move: undefined,
        rotate: undefined,
    }

    private shape: IShape
    private rectanglesWidth: number
    offset: number = 25
    private fillStyle: string | CanvasGradient | CanvasPattern
    private strokeStyle: string | CanvasGradient | CanvasPattern

    private boundaries: Boundaries | undefined = undefined

    constructor(shape: IShape, rectanglesWidth = 15, offset = 30, fillStyle: string | CanvasGradient | CanvasPattern = 'cyan', strokeStyle: string | CanvasGradient | CanvasPattern = 'cyan') {
        this.shape = shape
        this.rectanglesWidth = rectanglesWidth
        this.offset = offset
        this.fillStyle = fillStyle
        this.strokeStyle = strokeStyle
    }

    getShape(): IShape {
        return this.shape
    }

    redraw(d: Draw): void {
        this.draw(d)
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): Position | 'move' | 'rotate' | undefined {
        let result: Position | 'move' | 'rotate' | undefined = undefined

        ctx.save()

        if (this.shape.transformArgs)
            ctx.setTransform(this.shape.transformArgs)

        if (this.paths.rotate && ctx.isPointInPath(this.paths.rotate, point.x, point.y))
            result = 'rotate'

        if (this.paths.move && ctx.isPointInPath(this.paths.move, point.x, point.y))
            result = 'move'

        for (const k in this.paths)
            if (Object.prototype.hasOwnProperty.call(this.paths, k)) {
                if (k === 'move' || k === 'rotate' || !this.paths[k as Position])
                    continue
                else if (this.paths[k as Position] && ctx.isPointInPath(this.paths[k as Position]!, point.x, point.y)) {
                    result = k as Position
                    break
                }
            }

        ctx.restore()

        return result
    }

    draw(d: Draw): void {
        this.createHandlers(d.ctx)
    }

    private createHandlers(ctx: CanvasRenderingContext2D) {
        const boundaries = this.getHandlersBoundaries();

        // rotate
        ctx.save()

        ctx.fillStyle = '#ff000000'
        ctx.lineWidth = this.offset

        this.paths.rotate = new Path2D

        if (this.shape.transformArgs)
            ctx.setTransform(this.shape.transformArgs)

        this.paths.rotate.rect(boundaries.topLeft.topLeft.x - this.offset, boundaries.topLeft.topLeft.y - this.offset, boundaries.right.right.x - boundaries.left.left.x + (this.offset * 2), boundaries.bottom.bottom.y - boundaries.top.top.y + (this.offset * 2))

        ctx.fill(this.paths.rotate)

        ctx.restore()

        // move
        ctx.save()

        ctx.fillStyle = '#00000000'
        ctx.strokeStyle = this.strokeStyle
        ctx.setLineDash([5, 3])

        this.paths.move = new Path2D

        if (this.shape.transformArgs)
            ctx.setTransform(this.shape.transformArgs)

        this.paths.move.rect(
            boundaries.topLeft.topLeft.x + (this.rectanglesWidth / 2),
            boundaries.topLeft.topLeft.y + (this.rectanglesWidth / 2),
            boundaries.right.right.x - boundaries.left.left.x - this.rectanglesWidth,
            boundaries.bottom.bottom.y - boundaries.top.top.y - this.rectanglesWidth
        )

        ctx.fill(this.paths.move)
        ctx.stroke(this.paths.move)

        ctx.restore()

        for (const key in boundaries)
            if (Object.prototype.hasOwnProperty.call(boundaries, key)) {
                ctx.save()

                ctx.fillStyle = this.fillStyle

                this.paths[key as Position] = new Path2D

                if (this.shape.transformArgs)
                    ctx.setTransform(this.shape.transformArgs)

                const boundary = boundaries[key as Position]
                this.paths[key as Position]!.rect(boundary.topLeft.x, boundary.topLeft.y, boundary.right.x - boundary.left.x, boundary.bottom.y - boundary.top.y)

                ctx.fill(this.paths[key as Position]!)

                ctx.restore()
            }
    }

    getBoundary(): Boundary {
        const boundaries = this.getHandlersBoundaries()
        return {
            topLeft: { x: boundaries.topLeft.topLeft.x, y: boundaries.topLeft.topLeft.y },
            top: { x: boundaries.top.top.x, y: boundaries.top.top.y },
            topRight: { x: boundaries.topRight.topRight.x, y: boundaries.topRight.topRight.y },
            right: { x: boundaries.right.right.x, y: boundaries.right.right.y },
            bottomRight: { x: boundaries.bottomRight.bottomRight.x, y: boundaries.bottomRight.bottomRight.y },
            bottom: { x: boundaries.bottom.bottom.x, y: boundaries.bottom.bottom.y },
            bottomLeft: { x: boundaries.bottomLeft.bottomLeft.x, y: boundaries.bottomLeft.bottomLeft.y },
            left: { x: boundaries.left.left.x, y: boundaries.left.left.y },
        }
    }

    getHandlersBoundaries(): Boundaries
    getHandlersBoundaries(position?: Position): Boundary
    getHandlersBoundaries(position?: Position): Boundaries | Boundary {
        // For more performance
        if (this.boundaries !== undefined) {
            if (!position)
                return this.boundaries
            else
                return this.boundaries[position]
        }

        const boundaries = Object.fromEntries(
            Object.entries(this.shape?.getBoundary() ?? {})
                .map(
                    v => [v[0], this.getHandlerBoundary(this.getHandlerTopLeftPoint(this.getHandlerCenterPoint(v[1], v[0] as Position)))]
                )
        ) as Boundaries

        this.boundaries = boundaries

        if (!position)
            return boundaries

        return boundaries[position]
    }

    private getHandlerBoundary(handlerTopLeftPoint: Point): Boundary {
        return {
            topLeft: handlerTopLeftPoint,
            top: { x: handlerTopLeftPoint.x + (this.rectanglesWidth / 2), y: handlerTopLeftPoint.y },
            topRight: { x: handlerTopLeftPoint.x + this.rectanglesWidth, y: handlerTopLeftPoint.y },
            right: { x: handlerTopLeftPoint.x + this.rectanglesWidth, y: handlerTopLeftPoint.y + (this.rectanglesWidth / 2) },
            bottomRight: { x: handlerTopLeftPoint.x + this.rectanglesWidth, y: handlerTopLeftPoint.y + this.rectanglesWidth },
            bottom: { x: handlerTopLeftPoint.x + (this.rectanglesWidth / 2), y: handlerTopLeftPoint.y + this.rectanglesWidth },
            bottomLeft: { x: handlerTopLeftPoint.x, y: handlerTopLeftPoint.y + this.rectanglesWidth },
            left: { x: handlerTopLeftPoint.x, y: handlerTopLeftPoint.y + (this.rectanglesWidth / 2) },
        }
    }

    private getHandlerTopLeftPoint(handlerCenterPoint: Point): Point {
        return { x: handlerCenterPoint.x - (this.rectanglesWidth / 2), y: handlerCenterPoint.y - (this.rectanglesWidth / 2) }
    }

    private getHandlerCenterPoint(point: Point, position: keyof Boundaries): Point {
        switch (position) {
            case 'top':
                return { x: point.x, y: point.y - this.offset }

            case 'right':
                return { x: point.x + this.offset, y: point.y }

            case 'bottom':
                return { x: point.x, y: point.y + this.offset }

            case 'left':
                return { x: point.x - this.offset, y: point.y }

            case 'topLeft':
                return { x: point.x - this.offset, y: point.y - this.offset }

            case 'topRight':
                return { x: point.x + this.offset, y: point.y - this.offset }

            case 'bottomRight':
                return { x: point.x + this.offset, y: point.y + this.offset }

            case 'bottomLeft':
                return { x: point.x - this.offset, y: point.y + this.offset }

            default:
                throw new Error('Invalid position provided for createCornerHandler method')
        }
    }
}

