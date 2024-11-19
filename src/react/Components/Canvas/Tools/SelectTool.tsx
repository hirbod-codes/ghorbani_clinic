import { useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Point, Position } from "../types"
import { Rectangle } from "../Shapes/Rectangle"
import { applyToPoint, fromObject } from "transformation-matrix"
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
            const p1 = applyToPoint(shape.transformArgs, handlersBoundaries.topLeft.topLeft)
            const p2 = applyToPoint(shape.transformArgs, handlersBoundaries.bottomRight.bottomRight)
            let xFlipped = false
            let xRange: [number, number]
            if (p1.x > p2.x) {
                xFlipped = true
                xRange = [p2.x, p1.x]
            }
            else
                xRange = [p1.x, p2.x]

            let yFlipped = false
            let yRange: [number, number]
            if (p1.y > p2.y) {
                yFlipped = true
                yRange = [p2.y, p1.y]
            }
            else
                yRange = [p1.y, p2.y]

            const handlerRefPoint = applyToPoint(fromObject(shape.transformArgs), handlersBoundaries[selectedHandler][selectedHandler])

            const verticalDiff = Math.abs(draw.currentPoint.y - handlerRefPoint.y) - 5
            const horizontalDiff = Math.abs(draw.currentPoint.x - handlerRefPoint.x) - 5

            function calcRectWidth(shape: Rectangle, point: Point, range: [number, number], side: string) {
                if (side.toLowerCase().includes('left')) {
                    if (!xFlipped && point.x > range[1])
                        return
                    if (xFlipped && point.x < range[0])
                        return
                } else {
                    if (!xFlipped && point.x < range[0])
                        return
                    if (xFlipped && point.x > range[1])
                        return
                }

                if (point.x <= range[1] && point.x >= range[0]) {
                    if (side.toLowerCase().includes('left'))
                        minusLeft(shape, horizontalDiff)
                    else
                        minusRight(shape, horizontalDiff)
                } else {
                    if (side.toLowerCase().includes('left'))
                        addLeft(shape, horizontalDiff)
                    else
                        addRight(shape, horizontalDiff)
                }
            }

            function calcRectHeight(shape: Rectangle, point: Point, range: [number, number], side: string) {
                if (side.toLowerCase().includes('top')) {
                    if (!yFlipped && point.y > range[1])
                        return
                    if (yFlipped && point.y < range[0])
                        return
                } else {
                    if (!yFlipped && point.y < range[0])
                        return
                    if (yFlipped && point.y > range[1])
                        return
                }

                if (point.y <= range[1] && point.y >= range[0]) {
                    if (side.toLowerCase().includes('top'))
                        minusTop(shape, verticalDiff)
                    else
                        minusBottom(shape, verticalDiff)
                } else {
                    if (side.toLowerCase().includes('top'))
                        addTop(shape, verticalDiff)
                    else
                        addBottom(shape, verticalDiff)
                }
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

            if (verticalDiff > 0 || horizontalDiff > 0)
                switch (selectedHandler) {
                    case 'topLeft':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'top':
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'topRight':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'right':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        break;

                    case 'bottomRight':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'bottom':
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'bottomLeft':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        if (shape instanceof Rectangle)
                            calcRectHeight(shape, draw.currentPoint, yRange, selectedHandler)
                        break;

                    case 'left':
                        if (shape instanceof Rectangle)
                            calcRectWidth(shape, draw.currentPoint, xRange, selectedHandler)
                        break;

                    default:
                        break;
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

