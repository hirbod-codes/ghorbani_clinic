import { useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Point, Position } from "../types"
import { Rectangle } from "../Shapes/Rectangle"
import { applyToPoint, decomposeTSR, fromObject } from "transformation-matrix"
import { Stack } from "@mui/material"
import { Shape } from "../Shapes/Shape"

export type SelectToolProps = {
    shapes: Shapes,
    canvasBackground: string,
    setOnDraw: (onDraw: (draw: Draw) => void) => void,
    setOnHoverHook: (onHoverHook: (draw: Draw) => void) => void,
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void,
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void,
}

export function SelectTool({ shapes, canvasBackground, setOnDraw, setOnHoverHook, setOnUpHook, setOnDownHook }: SelectToolProps) {
    const [selectedHandler, setSelectedHandler] = useState<Position | 'rotate' | 'move'>(undefined)
    const [referencePoint, setReferencePoint] = useState<Point>(undefined)

    const [pointerCoordinates, setPointerCoordinates] = useState<Point>()

    const onDown = (draw: Draw) => {
        setReferencePoint(draw.currentPoint)
        shapes.select(draw.ctx, draw.currentPoint)
        shapes.draw(draw)

        if (!shapes.hasSelection())
            return

        setSelectedHandler(shapes.selectionBox.isInside(draw.ctx, draw.currentPoint))
    }

    const onUp = (draw: Draw) => {
        setSelectedHandler(undefined)
        setReferencePoint(undefined)
    }

    const onMoveHook = (draw: Draw) => {
        if (!shapes.hasSelection() || !selectedHandler)
            return

        const handlersBoundaries = shapes.selectionBox.getHandlersBoundaries()

        const shape = shapes.getSelectedShape()

        if (!referencePoint)
            setReferencePoint(draw.currentPoint)
        else if (selectedHandler === 'move') {
            if (shape instanceof Rectangle && draw.prevPoint && shape.x + (draw.currentPoint.x - draw.prevPoint.x) > 0)
                shape.translate((draw.currentPoint.x - draw.prevPoint.x), (draw.currentPoint.y - draw.prevPoint.y))
        } else if (selectedHandler === 'rotate') {
            if (shape instanceof Rectangle && draw.prevPoint) {
                const centerPoint: Point = applyToPoint(shape.transformArgs, { x: shape.x + (shape.w / 2), y: shape.y + (shape.h / 2) })

                const p = getRad(centerPoint, draw.prevPoint)
                const c = getRad(centerPoint, draw.currentPoint)
                let absoluteRad = c - p

                while (absoluteRad >= 2 * Math.PI)
                    absoluteRad -= 2 * Math.PI

                shape.rotate(absoluteRad, centerPoint)
            }
        } else {
            function calcRectWidth(shape: Rectangle, pointer: Point, side: string) {
                if (!side.toLowerCase().includes('left') && !side.toLowerCase().includes('right'))
                    return

                const topLeft = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.topLeft.topLeft)
                const topRight = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.topRight.topRight)
                const bottomRight = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.bottomRight.bottomRight)
                const bottomLeft = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.bottomLeft.bottomLeft)
                const [p1, p2] = side.toLowerCase().includes('left') ? [topLeft, bottomLeft] : [bottomRight, topRight]

                const distance = pointFromLineDistance(p1, p2, draw.currentPoint)
                if (Number.isNaN(distance) || distance === Infinity)
                    return

                let shouldAdd: boolean

                let y = lineFunction(p1, p2, pointer.x)

                if (y === Infinity)
                    return

                if (y === undefined && pointer.x < p1.x)
                    shouldAdd = false
                if (y === undefined && pointer.x >= p1.x)
                    shouldAdd = true
                if (y !== undefined && pointer.y <= y)
                    shouldAdd = false
                if (y !== undefined && pointer.y > y)
                    shouldAdd = true

                if (!side.toLowerCase().includes('right'))
                    shouldAdd = !shouldAdd

                const decomposedMatrix = decomposeTSR(fromObject(shape.transformArgs))
                if ((decomposedMatrix.rotation.angle * 180 / Math.PI) < 0)
                    shouldAdd = !shouldAdd

                if (side.toLowerCase().includes('left'))
                    if (shouldAdd)
                        addLeft(shape, distance)
                    else
                        minusLeft(shape, distance)

                if (side.toLowerCase().includes('right'))
                    if (shouldAdd)
                        addRight(shape, distance)
                    else
                        minusRight(shape, distance)

                return
            }

            function calcRectHeight(shape: Rectangle, pointer: Point, side: string) {
                if (!side.toLowerCase().includes('top') && !side.toLowerCase().includes('bottom'))
                    return

                const topLeft = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.topLeft.topLeft)
                const topRight = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.topRight.topRight)
                const bottomRight = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.bottomRight.bottomRight)
                const bottomLeft = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries.bottomLeft.bottomLeft)
                const [p1, p2] = side.toLowerCase().includes('bottom') ? [bottomRight, bottomLeft] : [topLeft, topRight]

                const distance = pointFromLineDistance(p1, p2, draw.currentPoint)
                if (Number.isNaN(distance) || distance === Infinity)
                    return

                let shouldAdd: boolean

                let y = lineFunction(p1, p2, pointer.x)

                if (y === Infinity)
                    return

                if (y === undefined && pointer.x < p1.x)
                    shouldAdd = false
                if (y === undefined && pointer.x >= p1.x)
                    shouldAdd = true
                if (y !== undefined && pointer.y <= y)
                    shouldAdd = false
                if (y !== undefined && pointer.y > y)
                    shouldAdd = true

                const decomposedMatrix = decomposeTSR(fromObject(shape.transformArgs))
                if ((decomposedMatrix.rotation.angle * 180 / Math.PI) < 0)
                    shouldAdd = !shouldAdd

                if (!side.toLowerCase().includes('bottom'))
                    shouldAdd = !shouldAdd

                if (side.toLowerCase().includes('top'))
                    if (shouldAdd)
                        addTop(shape, distance)
                    else
                        minusTop(shape, distance)

                if (side.toLowerCase().includes('bottom'))
                    if (shouldAdd)
                        addBottom(shape, distance)
                    else
                        minusBottom(shape, distance)

                return
            }

            function addRight(shape: Rectangle, x: number) {
                shape.w += x
            }

            function addLeft(shape: Rectangle, x: number) {
                if ((shape.w - x) < 0)
                    return

                shape.x -= x
                shape.w += x
            }

            function minusRight(shape: Rectangle, x: number) {
                if ((shape.w - x) < 0)
                    return

                shape.w -= x
            }

            function minusLeft(shape: Rectangle, x: number) {
                if ((shape.w - x) < 0)
                    return

                shape.x += x
                shape.w -= x
            }

            function addTop(shape: Rectangle, y: number) {
                shape.y -= y
                shape.h += y
            }

            function addBottom(shape: Rectangle, y: number) {
                shape.h += y
            }

            function minusTop(shape: Rectangle, y: number) {
                if ((shape.h - y) < 0)
                    return

                shape.y += y
                shape.h -= y
            }

            function minusBottom(shape: Rectangle, y: number) {
                if ((shape.h - y) < 0)
                    return

                shape.h -= y
            }

            if (shape instanceof Rectangle) {
                calcRectWidth(shape, draw.currentPoint, selectedHandler)
                calcRectHeight(shape, draw.currentPoint, selectedHandler)
            }
        }

        shapes.draw(draw)
    }

    const onHoverHook = (draw: Draw) => {
        setPointerCoordinates(draw.currentPoint)
        if (!shapes.hasSelection() || selectedHandler)
            return

        switch (shapes.selectionBox.isInside(draw.ctx, draw.currentPoint)) {
            case 'topLeft':
                if (draw.canvasRef.current.style.cursor !== 'nw-resize') {
                    draw.canvasRef.current.style.cursor = 'nw-resize'
                    return;
                }
                break;

            case 'top':
                if (draw.canvasRef.current.style.cursor !== 'n-resize') {
                    draw.canvasRef.current.style.cursor = 'n-resize'
                    return;
                }
                break;

            case 'topRight':
                if (draw.canvasRef.current.style.cursor !== 'ne-resize') {
                    draw.canvasRef.current.style.cursor = 'ne-resize'
                    return;
                }
                break;

            case 'right':
                if (draw.canvasRef.current.style.cursor !== 'e-resize') {
                    draw.canvasRef.current.style.cursor = 'e-resize'
                    return;
                }
                break;

            case 'bottomRight':
                if (draw.canvasRef.current.style.cursor !== 'se-resize') {
                    draw.canvasRef.current.style.cursor = 'se-resize'
                    return;
                }
                break;

            case 'bottom':
                if (draw.canvasRef.current.style.cursor !== 's-resize') {
                    draw.canvasRef.current.style.cursor = 's-resize'
                    return;
                }
                break;

            case 'bottomLeft':
                if (draw.canvasRef.current.style.cursor !== 'sw-resize') {
                    draw.canvasRef.current.style.cursor = 'sw-resize'
                    return;
                }
                break;

            case 'left':
                if (draw.canvasRef.current.style.cursor !== 'w-resize') {
                    draw.canvasRef.current.style.cursor = 'w-resize'
                    return;
                }
                break;

            case 'move':
                if (draw.canvasRef.current.style.cursor !== 'move') {
                    draw.canvasRef.current.style.cursor = 'move'
                    return;
                }
                break;

            case 'rotate':
                if (draw.canvasRef.current.style.cursor !== 'progress') {
                    draw.canvasRef.current.style.cursor = 'progress'
                    return;
                }
                break;

            default:
                if (draw.canvasRef.current.style.cursor !== 'default')
                    draw.canvasRef.current.style.cursor = 'default'
                break;
        }
    }

    const getRad = (centerPoint: Point, p: Point): number => {
        const relativeRad = Math.abs(Math.asin((centerPoint.y - p.y) / twoPointDistance(p, centerPoint)))

        if (p.x >= centerPoint.x && p.y <= centerPoint.y)
            return Math.PI / 2 - relativeRad
        else if (p.x >= centerPoint.x && p.y >= centerPoint.y)
            return Math.PI / 2 + relativeRad
        else if (p.x <= centerPoint.x && p.y <= centerPoint.y)
            return 3 * Math.PI / 2 + relativeRad
        else if (p.x <= centerPoint.x && p.y >= centerPoint.y)
            return 3 * Math.PI / 2 - relativeRad
        else
            throw new Error('Invalid Points')
    }

    const twoPointDistance = (p1: Point, p2: Point): number => Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))

    const pointFromLineDistance = (p1: Point, p2: Point, p: Point): number => {
        console.log({ p1, p2, p })
        // area = (1/2) |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)| = (1/2) p1.p2 * p
        return Math.abs(p.x * (p1.y - p2.y) + p1.x * (p2.y - p.y) + p2.x * (p.y - p1.y)) / twoPointDistance(p1, p2)
    }

    const lineFunction = (p1: Point, p2: Point, x: number): number => {
        const m = (p2.y - p1.y) / (p2.x - p1.x)
        if (m === Infinity)
            return p1.x === x ? Infinity : undefined
        if (m === 0)
            return p1.y

        const c = p2.y - p2.x * m
        return m * x + c
    }

    useEffect(() => {
        setOnDraw(() => onMoveHook)
        setOnHoverHook(() => onHoverHook)
        setOnUpHook(() => onUp)
        setOnDownHook(() => onDown)
    }, [selectedHandler, referencePoint])

    return (
        <>
        </>
    )
}

