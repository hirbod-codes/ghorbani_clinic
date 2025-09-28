import { useCallback, useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Position } from "../types"
import { getRadiansFromTwoPoints } from "../../../../Lib/Math/2d"
import { Point } from "../../../../Lib/Math"
import { Stack } from "../../Stack"
import { Button } from "../../Button"
import { MousePointerSquareDashedIcon, TrashIcon } from "lucide-react"

export type SelectToolProps = {
    shapes: Shapes
    canvasBackground: string
    setOnDraw: (onDraw: (draw: Draw) => void) => void
    setOnHoverHook: (onHoverHook: (draw: Draw) => void) => void
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void
}

export function SelectTool({ shapes, canvasBackground, setOnDraw, setOnHoverHook, setOnUpHook, setOnDownHook }: SelectToolProps) {
    const [selectedHandler, setSelectedHandler] = useState<Position | 'rotate' | 'move' | undefined>(undefined)
    const [referencePoint, setReferencePoint] = useState<Point | undefined>(undefined)

    const [shouldScale, setShouldScale] = useState<boolean>(false)

    const [mode, setModeState] = useState<'select' | 'delete'>('select')

    const setMode = (m) => {

        shapes.deselect()
        setSelectedHandler(undefined)
        setReferencePoint(undefined)

        setModeState(m)
    }

    const onDown = useCallback((draw: Draw) => {
        if (!draw.currentPoint)
            return

        if (mode === 'delete') {
            shapes.select(draw.ctx, draw.currentPoint)

            let i = shapes.getSelectionIndex()
            if (i !== undefined)
                shapes.removeAt(i)

            shapes.deselect()
            setSelectedHandler(undefined)
            setReferencePoint(undefined)

            shapes.draw(draw)

            return
        }

        setReferencePoint(draw.currentPoint)
        shapes.select(draw.ctx, draw.currentPoint)
        shapes.draw(draw)

        const selectionBox = shapes.getSelectionBox()
        if (!shapes.hasSelection() || selectionBox === undefined)
            return

        setSelectedHandler(selectionBox.isInside(draw.ctx, draw.currentPoint))
    }, [mode])

    const onUp = (draw: Draw) => {
        setSelectedHandler(undefined)
        setReferencePoint(undefined)
    }

    const onMoveHook = (draw: Draw) => {
        const selectionBox = shapes.getSelectionBox()
        if (!shapes.hasSelection() || !selectedHandler || !draw.currentPoint || !selectionBox)
            return

        const shape = shapes.getSelectedShape()

        if (!draw.prevPoint || !shape || !shapes.getSelectionBox())
            return

        if (selectedHandler === 'move')
            shape.translate(draw.prevPoint, draw.currentPoint)
        else if (selectedHandler === 'rotate')
            shape.rotate(draw.prevPoint, draw.currentPoint)
        else {
            if (shouldScale)
                shape.scale(draw.prevPoint, draw.currentPoint, selectionBox, selectedHandler)
            else {
                shape.updateWidth(draw.prevPoint, draw.currentPoint, selectionBox, selectedHandler)
                shape.updateHeight(draw.prevPoint, draw.currentPoint, selectionBox, selectedHandler)
            }
        }

        shapes.draw(draw)
    }

    const onHoverHook = (draw: Draw) => {
        const selectionBox = shapes.getSelectionBox()
        if (!shapes.hasSelection() || !selectionBox || !draw.canvasRef.current || !draw.currentPoint)
            return

        const direction = selectionBox.isInside(draw.ctx, draw.currentPoint)

        console.log(!shapes.hasSelection(), !selectionBox, !draw.canvasRef.current, !draw.currentPoint, draw, direction);
        if (!direction) {
            if (draw.canvasRef.current.style.cursor !== 'default')
                draw.canvasRef.current.style.cursor = 'default'
            return
        }

        switch (direction) {
            case 'move':
                if (draw.canvasRef.current.style.cursor !== 'move')
                    draw.canvasRef.current.style.cursor = 'move'
                return;

            case 'rotate':
                if (draw.canvasRef.current.style.cursor !== 'progress')
                    draw.canvasRef.current.style.cursor = 'progress'
                return;
        }

        const centerPoint: Point | undefined = shapes.getSelectedShape()?.getCenterPoint()
        if (!centerPoint)
            return
        const rad = getRadiansFromTwoPoints(centerPoint, draw.currentPoint)

        const r = Math.floor(rad / (2 * Math.PI / 16))
        if (r === 15 || r === 0)
            // top
            if (draw.canvasRef.current.style.cursor !== 'n-resize')
                draw.canvasRef.current.style.cursor = 'n-resize'

        if (r === 1 || r === 2)
            // topRight
            if (draw.canvasRef.current.style.cursor !== 'ne-resize')
                draw.canvasRef.current.style.cursor = 'ne-resize'

        if (r === 3 || r === 4)
            // right
            if (draw.canvasRef.current.style.cursor !== 'e-resize')
                draw.canvasRef.current.style.cursor = 'e-resize'

        if (r === 5 || r === 6)
            // bottomRight
            if (draw.canvasRef.current.style.cursor !== 'se-resize')
                draw.canvasRef.current.style.cursor = 'se-resize'

        if (r === 7 || r === 8)
            // bottom
            if (draw.canvasRef.current.style.cursor !== 's-resize')
                draw.canvasRef.current.style.cursor = 's-resize'

        if (r === 9 || r === 10)
            // bottomLeft
            if (draw.canvasRef.current.style.cursor !== 'sw-resize')
                draw.canvasRef.current.style.cursor = 'sw-resize'

        if (r === 11 || r === 12)
            // left
            if (draw.canvasRef.current.style.cursor !== 'w-resize')
                draw.canvasRef.current.style.cursor = 'w-resize'

        if (r === 13 || r === 14)
            // topLeft
            if (draw.canvasRef.current.style.cursor !== 'nw-resize')
                draw.canvasRef.current.style.cursor = 'nw-resize'
    }

    useEffect(() => {
        setOnDraw(() => onMoveHook)
        setOnHoverHook(() => onHoverHook)
        setOnUpHook(() => onUp)
        setOnDownHook(() => onDown)
    }, [selectedHandler, referencePoint, mode])

    return (
        <>
            <Stack stackProps={{ className: 'items-center h-full w-max' }}>
                <Button isIcon variant='text' fgColor={mode === 'select' ? 'success' : 'surface-foreground'} onClick={() => setMode('select')}>
                    <MousePointerSquareDashedIcon />
                </Button>
                <Button isIcon variant='text' fgColor={mode === 'delete' ? 'error' : 'surface-foreground'} onClick={() => setMode('delete')}>
                    <TrashIcon fontSize="medium" />
                </Button>
            </Stack>
        </>
    )
}

