import { Boundaries, Boundary, Draw, Point, Position } from "../types";
import { Shape } from "./Shape";

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

    private shape: Shape
    private rectanglesWidth: number
    private offset: number
    private fillStyle: string | CanvasGradient | CanvasPattern

    private boundaries: Boundaries = undefined

    constructor(shape: Shape, rectanglesWidth = 20, offset = 30, fillStyle: string | CanvasGradient | CanvasPattern = 'cyan') {
        this.shape = shape
        this.rectanglesWidth = rectanglesWidth
        this.offset = offset
        this.fillStyle = fillStyle
    }

    getShape(): Shape {
        return this.shape
    }

    redraw(d: Draw): void {
        this.createHandlers(d.ctx)
    }

    isInside(ctx: CanvasRenderingContext2D, point: Point): Position | 'move' | 'rotate' | undefined {
        let result: Position | 'move' | 'rotate' | undefined = undefined

        ctx.save()
        this.transform(ctx)

        if (ctx.isPointInPath(this.paths.rotate, point.x, point.y))
            result = 'rotate'

        if (ctx.isPointInPath(this.paths.move, point.x, point.y))
            result = 'move'

        for (const k in this.paths)
            if (k === 'move' || k === 'rotate' || !this.paths[k as Position])
                continue
            else if (ctx.isPointInPath(this.paths[k as Position], point.x, point.y)) {
                result = k as Position
                break
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

        const width = 25
        ctx.fillStyle = '#ff000085'
        ctx.lineWidth = width

        this.paths.rotate = new Path2D

        this.transform(ctx)

        this.paths.rotate.rect(boundaries.topLeft.topLeft.x - width, boundaries.topLeft.topLeft.y - width, boundaries.right.right.x - boundaries.left.left.x + (width * 2), boundaries.bottom.bottom.y - boundaries.top.top.y + (width * 2))

        ctx.fill(this.paths.rotate)

        ctx.restore()

        // move
        ctx.save()

        ctx.fillStyle = '#00000085'

        this.paths.move = new Path2D

        this.transform(ctx)

        this.paths.move.rect(boundaries.topLeft.topLeft.x, boundaries.topLeft.topLeft.y, boundaries.right.right.x - boundaries.left.left.x, boundaries.bottom.bottom.y - boundaries.top.top.y)

        ctx.fill(this.paths.move)

        ctx.restore()

        for (const key in boundaries) {
            ctx.save()

            ctx.strokeStyle = '#ff0000'
            ctx.fillStyle = this.fillStyle
            ctx.lineWidth = 10

            this.paths[key as Position] = new Path2D

            this.transform(ctx)

            const boundary = boundaries[key as Position]
            this.paths[key as Position].rect(boundary.topLeft.x, boundary.topLeft.y, boundary.right.x - boundary.left.x, boundary.bottom.y - boundary.top.y)

            ctx.fill(this.paths[key as Position])
            ctx.stroke(this.paths[key as Position])

            ctx.restore()
        }
    }

    private transform(c: CanvasRenderingContext2D) {
        const boundary = this.shape.getBoundary();
        c.rotate(this.shape.rotationDegree)
        c.setTransform(...this.shape.transformArgs)
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
                    v => [v[0], this.getHandlerBoundary(this.getReferencePoint(this.getOffsetPoint(v[1], v[0] as Position)))]
                )
        ) as Boundaries

        this.boundaries = boundaries

        if (!position)
            return boundaries

        return boundaries[position]
    }

    private getHandlerBoundary(referencePoint: Point): Boundary {
        return {
            topLeft: { x: referencePoint.x, y: referencePoint.y },
            top: { x: referencePoint.x + (this.rectanglesWidth / 2), y: referencePoint.y },
            topRight: { x: referencePoint.x + this.rectanglesWidth, y: referencePoint.y },
            right: { x: referencePoint.x + this.rectanglesWidth, y: referencePoint.y + (this.rectanglesWidth / 2) },
            bottomRight: { x: referencePoint.x + this.rectanglesWidth, y: referencePoint.y + this.rectanglesWidth },
            bottom: { x: referencePoint.x + (this.rectanglesWidth / 2), y: referencePoint.y + this.rectanglesWidth },
            bottomLeft: { x: referencePoint.x, y: referencePoint.y + this.rectanglesWidth },
            left: { x: referencePoint.x, y: referencePoint.y + (this.rectanglesWidth / 2) },
        }
    }

    private getReferencePoint(offsetPoint: Point): Point {
        return { x: offsetPoint.x - (this.rectanglesWidth / 2), y: offsetPoint.y - (this.rectanglesWidth / 2) }
    }

    private getOffsetPoint(point: Point, position: keyof Boundaries): Point {
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

