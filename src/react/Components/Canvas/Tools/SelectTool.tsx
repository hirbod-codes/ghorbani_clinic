import { PointerEvent, useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Point, Position } from "../types"
import { Rectangle } from "../Shapes/Rectangle"
import { ContentPasteGoTwoTone } from "@mui/icons-material"

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

        if (selectedHandler === 'move') {
            if (shape instanceof Rectangle && draw.prevPoint && shape.x + (draw.currentPoint.x - draw.prevPoint.x) > 0) {
                shape.transformArgs[4] += (draw.currentPoint.x - draw.prevPoint.x)
                shape.transformArgs[5] += (draw.currentPoint.y - draw.prevPoint.y)
            }
        } else if (selectedHandler === 'rotate') {
            if (!referencePoint)
                setReferencePoint(draw.currentPoint)
            else if (shape instanceof Rectangle && draw.prevPoint) {
                const t1 = shape.y / shape.x
                const t2 = draw.currentPoint.y / draw.currentPoint.x
                // const degree = ((draw.currentPoint.y < draw.prevPoint.y) ? -1 : +1) * (Math.tan(t2) - Math.tan(t1));
                // const degree = Math.tan(t2) - Math.tan(t1);
                const degree = Math.tan((draw.currentPoint.y));
                console.log(t2, t1, degree, shape.rotationDegree)
                if (!Number.isNaN(t1) && t1 !== Infinity && !Number.isNaN(t2) && t2 !== Infinity)
                    shape.rotationDegree = (shape.rotationDegree ?? 0) + (degree * Math.PI / 180)
            }
        } else {
            const verticalDiff = draw.currentPoint.y - handlersBoundaries[selectedHandler][selectedHandler].y
            const horizontalDiff = draw.currentPoint.x - handlersBoundaries[selectedHandler][selectedHandler].x

            switch (selectedHandler) {
                case 'topLeft':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff) * -1) >= 0) {
                        shape.x += horizontalDiff
                        shape.w += (horizontalDiff) * -1
                    }
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff) * -1) >= 0) {
                        shape.y += verticalDiff
                        shape.h += (verticalDiff) * -1
                    }
                    break;

                case 'top':
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff) * -1) >= 0) {
                        shape.y += verticalDiff
                        shape.h += (verticalDiff) * -1
                    }
                    break;

                case 'topRight':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff)) >= 0)
                        shape.w += horizontalDiff
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff) * -1) >= 0) {
                        shape.y += verticalDiff
                        shape.h += (verticalDiff) * -1
                    }
                    break;

                case 'right':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff)) >= 0)
                        shape.w += horizontalDiff
                    break;

                case 'bottomRight':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff)) >= 0)
                        shape.w += horizontalDiff
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff)) >= 0)
                        shape.h += verticalDiff
                    break;

                case 'bottom':
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff)) >= 0)
                        shape.h += verticalDiff
                    break;

                case 'bottomLeft':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff) * -1) >= 0) {
                        shape.x += horizontalDiff
                        shape.w += (horizontalDiff) * -1
                    }
                    if (shape instanceof Rectangle && (shape.h + (verticalDiff)) >= 0)
                        shape.h += verticalDiff
                    break;

                case 'left':
                    if (shape instanceof Rectangle && (shape.w + (horizontalDiff) * -1) >= 0) {
                        shape.x += horizontalDiff
                        shape.w += (horizontalDiff) * -1
                    }
                    break;

                default:
                    break;
            }
        }

        shapes.draw(draw)
    }

    const onHoverHook = (draw: Draw) => {
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

