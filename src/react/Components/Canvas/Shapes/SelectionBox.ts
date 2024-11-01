import { Point, Draw, Boundary, Position, PositionKeys } from "../types";
import { Shape } from "./Shape";

export class SelectionBox implements Shape {
    private shape: Shape
    private rotationButtonRadius: number
    private rectanglesWidth: number
    private offset: number
    private fillStyle: string | CanvasGradient | CanvasPattern

    constructor(shape: Shape, rotationButtonRadius = 10, rectanglesWidth = 10, offset = 20, fillStyle: string | CanvasGradient | CanvasPattern = 'cyan') {
        this.shape = shape
        this.rotationButtonRadius = rotationButtonRadius
        this.rectanglesWidth = rectanglesWidth
        this.offset = offset
        this.fillStyle = fillStyle
    }

    isSelected(point: Point): boolean {
        return false
    }

    draw(d: Draw): void {
        this.createScaleHandler(d.ctx)
        this.createRotationHandler(d.ctx)

    }

    getBoundary(): Boundary {
        const boundaries = this.getBoundaries()
        return [
            boundaries.TOP_LEFT[0],
            boundaries.TOP_RIGHT[1],
            boundaries.BOTTOM_RIGHT[2],
            boundaries.BOTTOM_LEFT[3],
        ]
    }

    getBoundaries(): { [key in PositionKeys]: Boundary }
    getBoundaries(position?: Position): Boundary
    getBoundaries(position?: Position): { [key in PositionKeys]: Boundary } | Boundary {
        const boundaries = this.shape.getBoundary().map((p, i) => {
            return [Position[i].toString(), this.getHandlerBoundary(this.getReferencePoint(this.getOffsetPoint(p, i)))]
        })

        if (!position)
            return Object.fromEntries(boundaries)

        return Object.fromEntries(boundaries)[Position[position].toString()]
    }

    private getHandlerBoundary(referencePoint: Point): Boundary {
        return [
            { x: referencePoint.x, y: referencePoint.y },
            { x: referencePoint.x + this.rectanglesWidth, y: referencePoint.y },
            { x: referencePoint.x + this.rectanglesWidth, y: referencePoint.y + this.rectanglesWidth },
            { x: referencePoint.x, y: referencePoint.y + this.rectanglesWidth },
        ]
    }

    private getReferencePoint(offsetPoint: Point): Point {
        return { x: offsetPoint.x - this.rectanglesWidth, y: offsetPoint.y - this.rectanglesWidth }
    }

    private getOffsetPoint(point: Point, position: Position): Point {
        switch (position) {
            case Position.TOP:
                return { x: point.x, y: point.y - this.offset }

            case Position.RIGHT:
                return { x: point.x + this.offset, y: point.y }

            case Position.BOTTOM:
                return { x: point.x, y: point.y + this.offset }

            case Position.LEFT:
                return { x: point.x - this.offset, y: point.y }

            case Position.TOP_LEFT:
                return { x: point.x - this.offset, y: point.y - this.offset }

            case Position.TOP_RIGHT:
                return { x: point.x + this.offset, y: point.y - this.offset }

            case Position.BOTTOM_RIGHT:
                return { x: point.x + this.offset, y: point.y + this.offset }

            case Position.BOTTOM_LEFT:
                return { x: point.x - this.offset, y: point.y + this.offset }

            default:
                throw new Error('Invalid position provided for createCornerHandler method')
        }
    }

    getCornerBoundaries(): { [key in PositionKeys]: Boundary } {
        const boundaries = this.getBoundaries()

        return Object.fromEntries(
            Object.entries(boundaries).filter(f =>
                f[0] !== Position.TOP.toString() && f[0] !== Position.RIGHT.toString() && f[0] !== Position.BOTTOM.toString() && f[0] !== Position.LEFT.toString()
            )
        ) as { [key in PositionKeys]: Boundary }
    }

    getMiddleBoundaries(): { [key in PositionKeys]: Boundary } {
        const boundaries = this.getBoundaries()

        return Object.fromEntries(
            Object.entries(boundaries).filter(f =>
                f[0] !== Position.TOP_LEFT.toString() && f[0] !== Position.TOP_RIGHT.toString() && f[0] !== Position.BOTTOM_RIGHT.toString() && f[0] !== Position.BOTTOM_LEFT.toString()
            )
        ) as { [key in PositionKeys]: Boundary }
    }

    private createRotationHandler(c: CanvasRenderingContext2D) {
        c.fillStyle = this.fillStyle

        const boundary = this.getBoundaries(Position.TOP);

        c.beginPath()
        c.ellipse(boundary[0].x + (this.rectanglesWidth / 2), boundary[0].y + (this.rectanglesWidth / 2) - this.offset, this.rotationButtonRadius, this.rotationButtonRadius, 0, 0, Math.PI * 4)
        c.fill()
    }

    private createScaleHandler(c: CanvasRenderingContext2D) {
        c.fillStyle = this.fillStyle

        c.beginPath()

        const boundaries = this.getBoundaries();
        for (const key in boundaries) {
            const boundary = boundaries[key as PositionKeys]
            c.rect(boundary[0].x, boundary[0].y, boundary[1].x - boundary[0].x, boundary[3].y - boundary[0].y)
        }
        c.fill()
    }
}

