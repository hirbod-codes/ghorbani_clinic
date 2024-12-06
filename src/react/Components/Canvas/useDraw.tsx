import { MutableRefObject, PointerEvent, useRef, useState } from 'react'
import { Draw, Point } from './types'
import { isCanvasEmpty } from './helpers'

export const useDraw = (
    canvasRef: MutableRefObject<HTMLCanvasElement | undefined>,
    onChange?: (empty?: boolean) => void | Promise<void>,
    onDraw?: (draw: Draw) => void,
    onHoverHook?: (draw: Draw) => void,
    onPointerDownHook?: (draw: Draw) => void,
    onPointerUpHook?: (draw: Draw) => void,
) => {
    const [empty, setEmpty] = useState(true)
    const [pointerDown, setPointerDown] = useState(false)

    const prevPoint = useRef<null | Point>(null)

    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })

    const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setPointerDown(true)

        if (onPointerDownHook) {
            const point = computePointInCanvas(e.clientX, e.clientY)
            onPointerDownHook({ ctx, currentPoint: point, prevPoint: prevPoint.current, e, canvasRef })
        }
    }

    const onUp = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        prevPoint.current = null
        setPointerDown(false)

        if (onPointerUpHook) {
            const point = computePointInCanvas(e.clientX, e.clientY)
            onPointerUpHook({ ctx, currentPoint: point, prevPoint: prevPoint.current, e, canvasRef })
        }
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        if (!ctx)
            return

        const shouldCallOnChange = !isCanvasEmpty(canvasRef)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (shouldCallOnChange && onChange)
            onChange(true)

        if (shouldCallOnChange)
            setEmpty(true)
    }

    const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!ctx)
            return

        const point = computePointInCanvas(e.clientX, e.clientY)

        if (!point || !ctx || !onDraw)
            return

        const draw = { ctx, currentPoint: point, prevPoint: prevPoint.current, e, canvasRef }

        if (onHoverHook)
            onHoverHook(draw)

        if (!pointerDown)
            return

        if (onChange)
            onChange(empty)

        onDraw(draw)
        prevPoint.current = point

        if (empty)
            setEmpty(false)
    }

    const computePointInCanvas = (x: number, y: number): Point | null => {
        if (!canvasRef.current)
            return null

        const rect = canvasRef.current.getBoundingClientRect()

        x = x - rect.left
        y = y - rect.top

        return { x, y }
    }

    return { onDown, clear, empty, onUp, onMove, pointerDown }
}
